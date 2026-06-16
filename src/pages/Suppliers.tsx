import React, { useState, useMemo } from 'react';
import { Plus, Search, X, Factory, ArrowDownToLine, ShoppingCart, History } from 'lucide-react';
import { useAppData, Supplier } from '@/src/context/AppDataContext';

export default function Suppliers() {
  const { suppliers, purchases, inventory, addSupplier, createPurchase } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [purchaseItems, setPurchaseItems] = useState([{ inventoryId: '', qty: 1, cost: 0 }]);
  const [paidAmount, setPaidAmount] = useState(0);

  const [selectedSupplierHistory, setSelectedSupplierHistory] = useState<Supplier | null>(null);

  const [newSupplier, setNewSupplier] = useState({
    name: '', phone: '', balance: 0
  });

  const getSupplierPurchases = (supplierId: string) => {
    return purchases.filter(p => p.supplierId === supplierId);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.includes(searchTerm) || 
      s.phone.includes(searchTerm)
    );
  }, [suppliers, searchTerm]);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier(newSupplier);
    setIsAddSupplierModalOpen(false);
    setNewSupplier({ name: '', phone: '', balance: 0 });
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
    <div className="space-y-6">
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
            onClick={() => setIsAddSupplierModalOpen(true)}
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
                      <button 
                        onClick={() => setSelectedSupplierHistory(supplier)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#475569] rounded-lg font-bold text-xs hover:bg-[#E2E8F0] transition-colors border-none cursor-pointer"
                      >
                        <History className="w-4 h-4" />
                        سجل المشتريات والتعاملات
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                <History className="w-5 h-5 text-[#2563EB]" />
                سجل المشتريات المتبادلة
              </h3>
              <button onClick={() => setSelectedSupplierHistory(null)} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-none">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-[#F1F5F9] p-4 rounded-xl border border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 text-right">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#2563EB] shadow-sm">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-lg">{selectedSupplierHistory.name}</h3>
                    <p className="text-sm text-[#64748B] font-mono">{selectedSupplierHistory.phone}</p>
                  </div>
                </div>
                <div className="text-left bg-white px-5 py-3 rounded-xl shadow-sm border border-[#E2E8F0] w-full sm:w-auto">
                  <p className="text-xs text-[#475569] font-bold mb-1 block">الرصيد الحالي</p>
                  <p className={`text-2xl font-bold ${selectedSupplierHistory.balance > 0 ? 'text-[#DC2626]' : selectedSupplierHistory.balance < 0 ? 'text-[#16A34A]' : 'text-[#1E293B]'}`} dir="ltr">
                    {Math.abs(selectedSupplierHistory.balance).toLocaleString()} <span className="text-xs text-[#94A3B8]">ج.م</span>
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-1 text-center font-bold">
                    {selectedSupplierHistory.balance > 0 ? 'مطلوب تسديده للمورد' : selectedSupplierHistory.balance < 0 ? 'رصيد دائن للمورد' : 'حساب خالص غير مدين'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">المشتريات والتوريدات السابقة</h4>
                
                <div className="space-y-3">
                  {getSupplierPurchases(selectedSupplierHistory.id).length > 0 ? (
                    getSupplierPurchases(selectedSupplierHistory.id).map(inv => (
                      <div key={inv.id} className="p-4 border border-[#E2E8F0] rounded-xl bg-white flex items-center justify-between hover:border-[#2563EB] transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold bg-[#EFF6FF] px-2 py-1 rounded text-[#2563EB] font-mono">توريد #{inv.id.slice(0, 5)}</span>
                            <span className="text-xs font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded">{new Date(inv.date).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <p className="text-xs text-[#64748B] font-bold">إجمالي المطالبة: <span className="text-[#1E293B] text-base">{inv.total.toLocaleString()}</span> ج.م</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${inv.paid >= inv.total ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'}`}>
                            {inv.paid >= inv.total ? 'نقدي خــالــص' : 'دفعة جزئية / آجل'}
                          </span>
                          <span className="text-sm font-bold text-[#16A34A] mt-1">المدفوع نقداً: {inv.paid.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <p className="text-sm font-bold text-[#94A3B8]">لا توجد مشتريات سابقة من هذا المورد.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
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
              <h3 className="text-lg font-bold text-[#1E293B]">إضافة مورد جديد</h3>
              <button onClick={() => setIsAddSupplierModalOpen(false)} className="text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"><X className="w-5 h-5" /></button>
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
                <button type="button" onClick={() => setIsAddSupplierModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#475569] bg-[#F1F5F9] rounded-lg hover:bg-[#E2E8F0] cursor-pointer">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] cursor-pointer">حفظ المورد</button>
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
    </div>
  );
}
