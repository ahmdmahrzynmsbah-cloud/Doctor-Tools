import React, { useState, useMemo } from 'react';
import { Plus, Search, X, Factory, ArrowDownToLine, ShoppingCart, History, Edit2, Trash2, Banknote, Printer, Share2, Loader2, MessageCircle } from 'lucide-react';
import { useAppData, Supplier } from '@/src/context/AppDataContext';
import html2canvas from 'html2canvas';

export default function Suppliers() {
  const { suppliers, purchases, inventory, addSupplier, updateSupplier, deleteSupplier, createPurchase, recordSupplierPayment } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [purchaseItems, setPurchaseItems] = useState([{ inventoryId: '', qty: 1, cost: 0 }]);
  const [paidAmount, setPaidAmount] = useState(0);

  const [selectedSupplierHistory, setSelectedSupplierHistory] = useState<Supplier | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [newSupplier, setNewSupplier] = useState({
    name: '', phone: '', balance: 0
  });

  const getSupplierPurchases = (supplierId: string) => {
    return purchases.filter(p => p.supplierId === supplierId);
  };

  const ledgerEntries = useMemo(() => {
    if (!selectedSupplierHistory) return [];

    const transactions = [...getSupplierPurchases(selectedSupplierHistory.id)].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let netChange = transactions.reduce((acc, inv) => acc + (inv.total - inv.paid), 0);
    const initialBalance = selectedSupplierHistory.balance - netChange;

    let currentBalance = initialBalance;
    const entries = [];

    if (initialBalance !== 0 || transactions.length === 0) {
      entries.push({
        id: 'initial',
        date: '-',
        description: 'رصيد مرحل (افتتاحي)',
        debit: initialBalance < 0 ? Math.abs(initialBalance) : 0, 
        credit: initialBalance > 0 ? initialBalance : 0,
        balance: currentBalance,
        isInitial: true
      });
    }

    transactions.forEach(inv => {
      const isPayment = inv.items.length === 0;
      const debit = inv.paid; // دفعات سددناها للمورد
      const credit = inv.total; // بضاعة وردها لنا المورد
      
      currentBalance += (credit - debit);

      let purchaseDetails = '';
      if (!isPayment && inv.items.length > 0) {
        const itemNames = inv.items.map(item => {
          const inventoryItem = inventory.find(i => i.id === item.itemId);
          return inventoryItem ? `${inventoryItem.name} (${item.quantity})` : `صنف محذوف (${item.quantity})`;
        });
        purchaseDetails = ` - أصناف: ${itemNames.join('، ')}`;
      }

      entries.push({
        id: inv.id,
        date: new Date(inv.date).toLocaleDateString('ar-EG'),
        description: isPayment ? `سند صرف للمورد` : `توريد ونزول بضاعة${purchaseDetails}`,
        debit: debit,
        credit: credit,
        balance: currentBalance,
        isInitial: false
      });
    });

    return entries;
  }, [selectedSupplierHistory, purchases, inventory]);

  const handlePrintStatement = () => {
    window.print();
  };

  const handleShareWhatsApp = async () => {
    if (!selectedSupplierHistory) return;
    
    if (!selectedSupplierHistory.phone) {
      alert("المورد ليس لديه رقم هاتف مسجل للمراسلة عبر واتساب.");
      return;
    }

    try {
      setIsGeneratingImage(true);
      const element = document.getElementById('supplier-statement-printable-area');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsGeneratingImage(false);
          return;
        }
        
        try {
          const file = new File([blob], `statement_${selectedSupplierHistory.name}.png`, { type: 'image/png' });
          const textMsg = `مرحباً بك،\nمرفق كشف حساب تفصيلي خاص بك.`;
          
          let phone = selectedSupplierHistory.phone;
          if (phone.startsWith('0')) {
              phone = '2' + phone.substring(1);
          } else if (!phone.startsWith('2')) {
              phone = '2' + phone;
          }

          // 1. Try Native Mobile/Desktop Share First
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `كشف حساب - ${selectedSupplierHistory.name}`,
                text: textMsg
              });
              return;
            } catch (shareError: any) {
              if (shareError.name !== "AbortError") {
                console.log('Share failed', shareError);
              } else {
                return;
              }
            }
          }

          // 2. Fallback: Try to use Clipboard for Desktop Computers
          let isCopied = false;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            isCopied = true;
          } catch (clipboardError) {
            console.log('Clipboard write failed', clipboardError);
          }

          if (isCopied) {
            alert('تم نسخ صورة الكشف بنجاح! 📋\n\n- سيتم فتح محادثة الواتساب الآن.\n- الرجاء عمل "لصق" (Paste) لإرسال الصورة مباشرةً للمورد.\n- اختصار اللصق (Ctrl+V) أو (Cmd+V).');
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(textMsg)}`, '_blank');
          } else {
            // 3. Ultimate Fallback: Download file and open WA
            alert('تم تصدير وتحميل صورة الكشف 📥\n\n- سيتم فتح محادثة الواتساب الآن.\n- الرجاء إرفاق الصورة التي تم تحميلها للتو داخل المحادثة.');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `كشف_حساب_مورد_${selectedSupplierHistory.name}.png`;
            a.click();
            URL.revokeObjectURL(url);
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(textMsg)}`, '_blank');
          }
        } catch (error) {
          console.error("Error sharing:", error);
        } finally {
          setIsGeneratingImage(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      setIsGeneratingImage(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.includes(searchTerm) || 
      s.phone.includes(searchTerm)
    );
  }, [suppliers, searchTerm]);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, newSupplier);
    } else {
      addSupplier(newSupplier);
    }
    closeSupplierModal();
  };

  const closeSupplierModal = () => {
    setIsAddSupplierModalOpen(false);
    setEditingSupplier(null);
    setNewSupplier({ name: '', phone: '', balance: 0 });
  };

  const openEditSupplierModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({ name: supplier.name, phone: supplier.phone, balance: supplier.balance });
    setIsAddSupplierModalOpen(true);
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المورد "${name}"؟`)) {
      deleteSupplier(id);
    }
  };

  const handlePaymentSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentSupplier && paymentAmount) {
      recordSupplierPayment(paymentSupplier.id, Number(paymentAmount));
      setPaymentSupplier(null);
      setPaymentAmount('');
    }
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validItems = purchaseItems.filter(i => i.inventoryId !== '' && i.qty > 0 && i.cost > 0);
    if (!selectedSupplierId || validItems.length === 0) return;

    let total = 0;
    const finalItems = validItems.map(item => {
      const lineCost = item.qty * item.cost;
      total += lineCost;
      return { itemId: item.inventoryId, quantity: item.qty, price: item.cost };
    });

    createPurchase({
      date: new Date().toISOString(),
      supplierId: selectedSupplierId,
      items: finalItems,
      total,
      paid: paidAmount
    });

    setIsPurchaseModalOpen(false);
    setPurchaseItems([{ inventoryId: '', qty: 1, cost: 0 }]);
    setSelectedSupplierId('');
    setPaidAmount(0);
  };

  return (
    <>
    <div className={`space-y-6 ${selectedSupplierHistory ? 'print:hidden' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">حسابات الموردين والمشتريات</h2>
          <p className="mt-1 text-sm text-[#475569]">إدارة بيانات الموردين وتسجيل عمليات الشراء التي تُسمِّع في المخزن فوراً</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPurchaseModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#059669] cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            شراء أصناف وتوريد
          </button>
          <button 
            onClick={() => {
              setEditingSupplier(null);
              setNewSupplier({ name: '', phone: '', balance: 0 });
              setIsAddSupplierModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            مورد جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 right-3 flex items-center pr-1 pointer-events-none text-[#94A3B8]">
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full bg-[#F1F5F9] border-none rounded-lg pr-10 pl-4 py-2 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              placeholder="بحث باسم المورد..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#F7FAFC] text-xs font-bold text-[#475569] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">اسم المورد</th>
                <th className="px-6 py-4">رقم الهاتف</th>
                <th className="px-6 py-4">الرصيد المستحق (ج.م)</th>
                <th className="px-6 py-4">حالة الحساب</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#94A3B8]">
                    لا يوجد موردين مطابقين للبحث
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 font-bold text-[#1E293B]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#475569]">
                          <Factory className="w-4 h-4" />
                        </div>
                        {supplier.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#475569]">{supplier.phone}</td>
                    <td className="px-6 py-4 font-bold" dir="ltr">
                      <span className={supplier.balance > 0 ? 'text-[#DC2626]' : supplier.balance < 0 ? 'text-[#16A34A]' : 'text-[#1E293B]'}>
                        {Math.abs(supplier.balance).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {supplier.balance > 0 && <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] whitespace-nowrap">مطلوب تسديده للمورد</span>}
                      {supplier.balance < 0 && <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#F0FDF4] text-[#16A34A] whitespace-nowrap">الورشة دائنة للمورد</span>}
                      {supplier.balance === 0 && <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] whitespace-nowrap">خالص</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedSupplierHistory(supplier)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#F1F5F9] text-[#475569] rounded-lg font-bold text-xs hover:bg-[#E2E8F0] transition-colors border-none cursor-pointer"
                        >
                          <History className="w-4 h-4" />
                          السجل
                        </button>
                        {supplier.phone && (
                          <a
                            href={`https://wa.me/2${supplier.phone.startsWith('0') ? supplier.phone.substring(1) : supplier.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center w-8 h-8 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] rounded-lg hover:bg-[#CEEAD6] transition-colors cursor-pointer"
                            title="مراسلة عبر واتساب"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        {supplier.balance > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPaymentSupplier(supplier);
                              setPaymentAmount(supplier.balance);
                            }}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EFF6FF] text-[#2563EB] rounded-lg font-bold text-xs hover:bg-[#DBEAFE] transition-colors border-none cursor-pointer"
                          >
                            <Banknote className="w-4 h-4" />
                            سداد 
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditSupplierModal(supplier);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#F1F5F9] hover:text-[#2563EB] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupplier(supplier.id, supplier.name);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#FECACA] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Record Modal */}
      {selectedSupplierHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:items-start print:block print:relative print:z-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:h-auto print:shadow-none print:rounded-none">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] print:hidden">
              <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                <History className="w-5 h-5 text-[#2563EB]" />
                سجل المشتريات المتبادلة
              </h3>
              <div className="flex items-center gap-3">
                 <button 
                   onClick={handleShareWhatsApp} 
                   disabled={isGeneratingImage || !selectedSupplierHistory.phone}
                   className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-lg font-bold text-xs hover:bg-[#15803D] transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                    مشاركة {selectedSupplierHistory.phone ? 'واتساب' : '(لا يوجد رقم)'}
                 </button>
                 <button onClick={handlePrintStatement} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-bold text-xs hover:bg-[#1D4ED8] transition-colors border-none cursor-pointer">
                    <Printer className="w-4 h-4" />
                    طباعة
                 </button>
                 <button onClick={() => setSelectedSupplierHistory(null)} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-none">
                   <X className="w-6 h-6" />
                 </button>
              </div>
            </div>
            
            <div id="supplier-statement-printable-area" className="p-6 overflow-y-auto space-y-6 print:overflow-visible print:p-2 bg-white">
              <div className="text-center hidden print:block mb-6 pt-4 border-b pb-4">
                <h2 className="text-2xl font-bold text-[#1E293B]">كشف حساب مورد</h2>
                <div className="text-sm text-[#475569] mt-1 space-x-4 space-x-reverse">
                  <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center bg-[#F1F5F9] p-4 rounded-xl border border-[#E2E8F0] gap-4 print:bg-transparent print:border-none print:p-0 print:items-end print:mb-6">
                <div className="flex items-center gap-4 text-right print:gap-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#2563EB] shadow-sm print:hidden">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-lg print:text-xl">اسم المورد: {selectedSupplierHistory.name}</h3>
                    <p className="text-sm text-[#64748B] font-mono mt-1 print:text-[#1E293B]">تليفون: {selectedSupplierHistory.phone}</p>
                  </div>
                </div>
                <div className="text-left bg-white px-5 py-3 rounded-xl shadow-sm border border-[#E2E8F0] w-full sm:w-auto print:shadow-none print:px-4">
                  <p className="text-xs text-[#475569] font-bold mb-1 block">الرصيد الحالي</p>
                  <p className={`text-2xl font-bold ${selectedSupplierHistory.balance > 0 ? 'text-[#DC2626]' : selectedSupplierHistory.balance < 0 ? 'text-[#16A34A]' : 'text-[#1E293B]'} print:text-black`} dir="ltr">
                    {Math.abs(selectedSupplierHistory.balance).toLocaleString()} <span className="text-xs text-[#94A3B8] print:text-black">ج.م</span>
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-1 text-center font-bold print:text-black">
                    {selectedSupplierHistory.balance > 0 ? 'مطلوب تسديده للمورد' : selectedSupplierHistory.balance < 0 ? 'رصيد دائن للمورد' : 'حساب خالص غير مدين'}
                  </p>
                </div>
              </div>

              <div>
                <table className="w-full text-right border-collapse border border-[#E2E8F0]">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-3 py-3 border border-[#E2E8F0] font-bold text-[#475569] text-sm print:text-black">التاريخ</th>
                      <th className="px-3 py-3 border border-[#E2E8F0] font-bold text-[#475569] text-sm md:w-1/3 print:text-black">البيان</th>
                      <th className="px-3 py-3 border border-[#E2E8F0] font-bold text-[#475569] text-sm text-center print:text-black">حركة دائنة (للمورد)</th>
                      <th className="px-3 py-3 border border-[#E2E8F0] font-bold text-[#475569] text-sm text-center print:text-black">حركة مدينة (سداد)</th>
                      <th className="px-3 py-3 border border-[#E2E8F0] font-bold text-[#475569] text-sm text-center print:text-black">الرصيد (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.length > 0 ? (
                      ledgerEntries.map((row, idx) => (
                        <tr key={`${row.id}-${idx}`} className={row.isInitial ? 'bg-[#F1F5F9] print:bg-gray-100' : ''}>
                          <td className="px-3 py-3 border border-[#E2E8F0] text-sm text-[#64748B] whitespace-nowrap print:text-black">{row.date}</td>
                          <td className="px-3 py-3 border border-[#E2E8F0] text-sm text-[#1E293B] font-bold print:text-black">{row.description}</td>
                          <td className="px-3 py-3 border border-[#E2E8F0] text-sm text-center text-[#DC2626] font-bold print:text-black" dir="ltr">
                            {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                          </td>
                          <td className="px-3 py-3 border border-[#E2E8F0] text-sm text-center text-[#16A34A] font-bold print:text-black" dir="ltr">
                            {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                          </td>
                          <td className="px-3 py-3 border border-[#E2E8F0] text-sm text-center font-bold print:text-black" dir="ltr">
                            <span className={row.balance > 0 ? 'text-[#DC2626] print:text-black' : row.balance < 0 ? 'text-[#16A34A] print:text-black' : 'text-[#64748B] print:text-black'}>
                              {Math.abs(row.balance).toLocaleString()} {row.balance > 0 ? 'دائن' : row.balance < 0 ? 'مدين' : ''}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-[#94A3B8] font-bold print:text-black">لا توجد حركات مسجلة للمورد</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end print:hidden">
               <button onClick={() => setSelectedSupplierHistory(null)} className="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                 إغلاق النافذة
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2332]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1E293B]">{editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h3>
              <button onClick={closeSupplierModal} className="text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">اسم المورد المعتمد</label>
                <input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">رقم هاتف المورد</label>
                <input required type="tel" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none" dir="ltr" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">الرصيد الافتتاحي (ج.م)</label>
                <input type="number" value={newSupplier.balance} onChange={e => setNewSupplier({...newSupplier, balance: Number(e.target.value)})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none" />
                <p className="text-[10px] text-[#94A3B8]">الموجب يعني أن للمورد مستحقات لديك سابقة.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E2E8F0] mt-6">
                <button type="button" onClick={closeSupplierModal} className="px-4 py-2 text-sm font-bold text-[#475569] bg-[#F1F5F9] rounded-lg hover:bg-[#E2E8F0] cursor-pointer">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] cursor-pointer">{editingSupplier ? 'تحديث البيانات' : 'حفظ المورد'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Modal (Supplies directly to inventory) */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2332]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <div className="flex items-center gap-2 text-[#1E293B]">
                <ShoppingCart className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-lg font-bold">تسجيل عملية شراء بضاعة</h3>
              </div>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreatePurchase} className="p-6 overflow-y-auto space-y-6">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">المورد</label>
                <select required value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none bg-white">
                  <option value="">-- اختر المورد --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>)}
                </select>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#1E293B] mb-3">تفاصيل البضاعة الواردة (تُضاف للمخزون فوراً)</h4>
                <div className="space-y-3">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 bg-[#F1F5F9] p-3 rounded-lg sm:bg-transparent sm:p-0">
                       <select 
                         required 
                         value={item.inventoryId}
                         onChange={(e) => {
                            const newItems = [...purchaseItems];
                            newItems[idx].inventoryId = e.target.value;
                            setPurchaseItems(newItems);
                         }}
                         className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none bg-white"
                       >
                         <option value="">-- الصنف --</option>
                         {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name} (متوفر: {inv.quantity})</option>)}
                       </select>
                       <div className="flex gap-2">
                         <input 
                           type="number" min="1" placeholder="الكمية" required
                           value={item.qty}
                           onChange={(e) => {
                              const newItems = [...purchaseItems];
                              newItems[idx].qty = Number(e.target.value);
                              setPurchaseItems(newItems);
                           }}
                           className="w-full sm:w-24 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none bg-white"
                         />
                         <input 
                           type="number" min="0" placeholder="تكلفة الوحدة" required
                           value={item.cost}
                           onChange={(e) => {
                              const newItems = [...purchaseItems];
                              newItems[idx].cost = Number(e.target.value);
                              setPurchaseItems(newItems);
                           }}
                           className="w-full sm:w-32 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none bg-white"
                         />
                       </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setPurchaseItems([...purchaseItems, { inventoryId: '', qty: 1, cost: 0 }])} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
                    + إضافة صنف آخر
                  </button>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center justify-between font-bold text-[#1E293B] text-lg">
                  <span>إجمالي التكلفة:</span>
                  <span>{purchaseItems.reduce((sum, item) => sum + (item.qty * item.cost), 0).toLocaleString()} <span className="text-sm">ج.م</span></span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                   <label className="text-xs font-bold text-[#475569] block mb-1">المبلغ المدفوع كاش للمورد (ج.م)</label>
                   <input 
                     type="number" min="0" required
                     value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))}
                     className="w-full md:w-1/2 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                   />
                   <p className="text-[10px] text-[#94A3B8] mt-1">الباقي سيُضاف تلقائياً إلى مديونية المورد في حساباته.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="px-6 py-2 text-sm font-bold text-[#475569] bg-[#F1F5F9] rounded-lg hover:bg-[#E2E8F0] cursor-pointer">إلغاء</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-[#10B981] rounded-lg hover:bg-[#059669] cursor-pointer">تأكيد الإدخال للمخزن</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Payment Modal */}
      {paymentSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2332]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                <Banknote className="w-5 h-5 text-[#2563EB]" />
                سداد دفعة نقدية للمورد
              </h3>
              <button onClick={() => setPaymentSupplier(null)} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePaymentSupplier} className="p-5 space-y-4">
              <div className="bg-[#EFF6FF] p-3 rounded-lg border border-[#BFDBFE]">
                <p className="text-xs text-[#1D4ED8] font-bold mb-1">المورد: {paymentSupplier.name}</p>
                <p className="text-sm text-[#1E3A8A] font-bold">المطلوب سداده: <span className="text-xl inline-block mr-1">{paymentSupplier.balance.toLocaleString()}</span> ج.م</p>
              </div>

              <div className="space-y-1 mt-4">
                <label className="text-sm font-bold text-[#475569]">المبلغ المسدد نقداً (ج.م)</label>
                <div className="relative">
                  <input 
                    required 
                    type="number" 
                    min="1"
                    max={paymentSupplier.balance}
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(Number(e.target.value))} 
                    className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-lg font-bold flex-1 text-left focus:ring-2 focus:ring-[#2563EB] focus:outline-none" 
                    dir="ltr"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold pointer-events-none">ج.م</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setPaymentSupplier(null)} className="px-4 py-2.5 text-sm font-bold text-[#475569] bg-[#F1F5F9] rounded-lg hover:bg-[#E2E8F0] cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] cursor-pointer shadow-sm">
                  تأكيد السداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
