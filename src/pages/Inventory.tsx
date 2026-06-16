import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Filter, Search, Edit, Trash2, X, PackageOpen, LayoutGrid, Eye, Printer, MapPin } from 'lucide-react';
import { useAppData, InventoryItem } from '@/src/context/AppDataContext';
import Barcode from 'react-barcode';

export default function Inventory() {
  const { inventory, categories, addInventoryItem, updateInventoryItem, deleteInventoryItem, addCategory, removeCategory } = useAppData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [printingBarcodeItem, setPrintingBarcodeItem] = useState<InventoryItem | null>(null);
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    code: '', name: '', brand: '', compatibleCars: '', category: '', storageLocation: '', quantity: 0, purchasePrice: 0, sellPrice: 0
  });

  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (printingBarcodeItem) {
      const handleAfterPrint = () => {
        setPrintingBarcodeItem(null);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      
      return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
        clearTimeout(timer);
      };
    }
  }, [printingBarcodeItem]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      (selectedCategory === 'الكل' || item.category === selectedCategory) &&
      (item.name.includes(searchTerm) || item.code.includes(searchTerm) || item.brand.includes(searchTerm))
    );
  }, [inventory, searchTerm, selectedCategory]);

  const generateAutoCode = () => {
    return Math.floor(Math.random() * 899999999999 + 100000000000).toString();
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ code: generateAutoCode(), name: '', brand: '', compatibleCars: '', category: categories[0] || '', storageLocation: '', quantity: 0, purchasePrice: 0, sellPrice: 0 });
    setIsModalOpen(true);
  };


  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateInventoryItem(editingItem.id, formData);
    } else {
      addInventoryItem(formData);
    }
    setIsModalOpen(false);
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0]">
        <button
          onClick={() => setSelectedCategory('الكل')}
          className={`px-5 py-2 rounded-full font-bold text-sm border-none transition-colors cursor-pointer ${selectedCategory === 'الكل' ? 'bg-[#1E293B] text-white' : 'bg-transparent text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0]'}`}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full font-bold text-sm border-none transition-colors cursor-pointer ${selectedCategory === cat ? 'bg-[#1E293B] text-white' : 'bg-transparent text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0]'}`}
          >
            {cat}
          </button>
        ))}
        
        <div className="flex-1 min-w-[20px]" />
        
        <button 
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-colors cursor-pointer border border-[#C7D2FE]"
        >
          <LayoutGrid className="w-4 h-4" />
          إدارة الفئات
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button 
          onClick={openAdd}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2180B2] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1A6B94] cursor-pointer shadow-sm border-none"
        >
          <Plus className="h-5 w-5" />
          إضافة منتج جديد
        </button>

        <div className="relative flex-1 w-full bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden flex items-center pr-3">
           <div className="flex items-center justify-center px-3 border-l border-[#E2E8F0]">
             <span className="px-3 py-1 bg-[#F0FDF4] text-[#16A34A] rounded-full border border-[#BBF7D0] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
               <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span> قارئ الباركود مستعد
             </span>
           </div>
           <Search className="h-5 w-5 text-[#94A3B8] ml-2" />
           <input
             type="text"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="flex-1 bg-transparent border-none py-3 px-2 text-sm focus:outline-none"
             placeholder="البحث بالاسم، الباركود، الماركة..."
           />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col relative pt-4">
        
        <div className="flex justify-between items-center px-6 mb-4">
           <div className="flex items-center gap-2 text-[#1E293B]">
             <PackageOpen className="w-6 h-6 text-[#2180B2]" />
             <h3 className="font-bold text-lg">سجل المنتجات الفعلي بالمستودع</h3>
           </div>
           <div className="px-4 py-1.5 bg-[#F1F5F9] rounded-full text-sm font-bold text-[#475569]">
             متاح: {filteredInventory.length} قطعة
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-[#475569] border-y border-[#E2E8F0] bg-white text-xs font-bold whitespace-nowrap tracking-wider">
              <tr>
                <th className="px-6 py-4">الباركود</th>
                <th className="px-6 py-4">اسم القطعة<br/>والماركة</th>
                <th className="px-6 py-4">السيارات<br/>المتوافقة</th>
                <th className="px-6 py-4 text-center">التصنيف</th>
                <th className="px-6 py-4 text-center">مكان<br/>التخزين</th>
                <th className="px-6 py-4 text-center">الكمية<br/>الحالية</th>
                <th className="px-6 py-4">شراء / بيع</th>
                <th className="px-6 py-4 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#94A3B8]">
                      <PackageOpen className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-bold">لا توجد منتجات مطابقة للبحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 font-mono font-bold text-[#1E293B]">{item.code}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1E293B] text-base">{item.name}</p>
                      <p className="text-sm text-[#94A3B8]">{item.brand}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#475569]">{item.compatibleCars}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold rounded-lg border border-[#C7D2FE]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center text-[#94A3B8]">
                        <MapPin className="w-4 h-4 mb-1" />
                        <span className="text-xs font-bold">{item.storageLocation || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xl font-bold ${item.quantity > 0 ? 'text-[#1E293B]' : 'text-[#DC2626]'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-xs whitespace-nowrap">
                       <p className="text-[#94A3B8] flex justify-between gap-4"><span>شراء:</span> <span>{item.purchasePrice} <span className="text-[10px]">ج.م</span></span></p>
                       <p className="text-[#16A34A] text-sm mt-1 flex justify-between gap-4"><span>بيع:</span> <span>{item.sellPrice} <span className="text-[10px]">ج.م</span></span></p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center items-center gap-3 text-[#94A3B8]">
                         <button onClick={() => setViewingItem(item)} className="hover:text-[#2180B2] transition-colors cursor-pointer bg-transparent border-none" title="عرض"><Eye className="w-5 h-5"/></button>
                         <button onClick={() => setPrintingBarcodeItem(item)} className="hover:text-[#2180B2] transition-colors cursor-pointer bg-transparent border-none" title="طباعة باركود"><Printer className="w-5 h-5"/></button>
                         <button onClick={() => openEdit(item)} className="hover:text-[#2180B2] transition-colors cursor-pointer bg-transparent border-none" title="تعديل"><Edit className="w-5 h-5"/></button>
                         <button onClick={() => deleteInventoryItem(item.id)} className="hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-none" title="حذف"><Trash2 className="w-5 h-5"/></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2332]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                <PackageOpen className="w-5 h-5 text-[#2180B2]" />
                {editingItem ? 'تعديل الصنف' : 'إضافة منتج جديد للمستودع'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-none">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#475569]">رمز الباركود / الكود</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2180B2] focus:outline-none bg-[#F8FAFC]" dir="ltr" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#475569]">الكمية الحالية</label>
                  <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2180B2] focus:outline-none" />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-[#475569]">اسم القطعة</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2180B2] focus:outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#475569]">الماركة</label>
                  <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2180B2] focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#475569]">السيارات المتوافقة</label>
                  <input type="text" value={formData.compatibleCars} onChange={e => setFormData({...formData, compatibleCars: e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2180B2] focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#475569]">التصنيف (الفئة)</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2180B2] focus:outline-none bg-white">
                    <option value="">-- اختر الفئة --</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#475569]">مكان التخزين (الرف)</label>
                  <input type="text" value={formData.storageLocation} onChange={e => setFormData({...formData, storageLocation: e.target.value})} className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2180B2] focus:outline-none" />
                </div>

                <div className="space-y-1 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <label className="text-sm font-bold text-[#475569]">سعر الشراء</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input required type="number" min="0" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none" />
                    <span className="text-xs font-bold text-[#94A3B8]">ج.م</span>
                  </div>
                </div>
                <div className="space-y-1 p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                  <label className="text-sm font-bold text-[#16A34A]">سعر البيع</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input required type="number" min="0" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none font-bold" />
                    <span className="text-xs font-bold text-[#16A34A]">ج.م</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-[#475569] bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] cursor-pointer border-none transition-colors">
                  إلغاء الأمر
                </button>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#2180B2] rounded-xl hover:bg-[#1A6B94] cursor-pointer border-none shadow-sm transition-colors">
                  <Plus className="w-4 h-4"/>
                  {editingItem ? 'حفظ التعديلات' : 'إضافة إلى المستودع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2332]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="text-lg font-bold text-[#1E293B]">إدارة الفئات</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-none">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newCatName} 
                   onChange={e => setNewCatName(e.target.value)} 
                   placeholder="اسم الفئة الجديدة..."
                   className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2180B2]"
                   onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                 />
                 <button 
                   onClick={handleAddCategory}
                   className="px-4 py-2 bg-[#2180B2] text-white rounded-lg font-bold text-sm cursor-pointer border-none"
                 >
                   إضافة
                 </button>
               </div>
               
               <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                 {categories.map(cat => (
                   <div key={cat} className="flex justify-between items-center px-4 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                     <span className="font-bold text-[#1E293B] text-sm">{cat}</span>
                     <button 
                       onClick={() => removeCategory(cat)}
                       className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded cursor-pointer border-none bg-transparent"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 {categories.length === 0 && (
                   <p className="text-center text-[#94A3B8] text-sm mt-4">لا توجد فئات</p>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                <PackageOpen className="w-5 h-5 text-[#2180B2]" />
                تفاصيل المنتج
              </h3>
              <button onClick={() => setViewingItem(null)} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-none">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden">
                 <Barcode value={viewingItem.code} width={1.8} height={60} displayValue={true} />
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                 <div>
                   <p className="text-[#94A3B8] font-bold mb-1">اسم القطعة</p>
                   <p className="font-bold text-[#1E293B]">{viewingItem.name}</p>
                 </div>
                 <div>
                   <p className="text-[#94A3B8] font-bold mb-1">الماركة</p>
                   <p className="font-bold text-[#1E293B]">{viewingItem.brand || '-'}</p>
                 </div>
                 <div>
                   <p className="text-[#94A3B8] font-bold mb-1">السيارات المتوافقة</p>
                   <p className="font-bold text-[#1E293B]">{viewingItem.compatibleCars || '-'}</p>
                 </div>
                 <div>
                   <p className="text-[#94A3B8] font-bold mb-1">التصنيف</p>
                   <p className="font-bold text-[#1E293B]">{viewingItem.category}</p>
                 </div>
                 <div>
                   <p className="text-[#94A3B8] font-bold mb-1">مكان التخزين</p>
                   <p className="font-bold text-[#1E293B]">{viewingItem.storageLocation || '-'}</p>
                 </div>
                 <div>
                   <p className="text-[#94A3B8] font-bold mb-1">الكمية الحالية</p>
                   <p className={"font-bold " + (viewingItem.quantity > 0 ? "text-[#16A34A]" : "text-[#DC2626]")}>{viewingItem.quantity} قطعة</p>
                 </div>
                 <div className="p-3 bg-[#EEF2FF] rounded-lg border border-[#E0E7FF]">
                   <p className="text-[#4F46E5] font-bold mb-1 text-xs">سعر الشراء</p>
                   <p className="font-bold text-[#1E293B]">{viewingItem.purchasePrice} ج.م</p>
                 </div>
                 <div className="p-3 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0]">
                   <p className="text-[#16A34A] font-bold mb-1 text-xs">سعر البيع</p>
                   <p className="font-bold text-[#1E293B]">{viewingItem.sellPrice} ج.م</p>
                 </div>
              </div>
              
              <div className="pt-2 flex justify-center gap-3">
                 <button onClick={() => { setViewingItem(null); setPrintingBarcodeItem(viewingItem); }} className="flex items-center gap-2 px-6 py-2.5 bg-[#F1F5F9] text-[#475569] rounded-xl hover:bg-[#E2E8F0] font-bold text-sm transition-colors border-none cursor-pointer">
                   <Printer className="w-4 h-4" /> طباعة الباركود
                 </button>
                 <button onClick={() => { setViewingItem(null); openEdit(viewingItem); }} className="flex items-center gap-2 px-6 py-2.5 bg-[#2180B2] text-white rounded-xl hover:bg-[#1A6B94] font-bold text-sm transition-colors border-none cursor-pointer">
                   <Edit className="w-4 h-4" /> تعديل المنتج
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Barcode View */}
      {printingBarcodeItem && (
        <div className="fixed inset-0 z-50 bg-[#F1F5F9] flex flex-col print:bg-white overflow-hidden">
           <div className="p-4 flex gap-4 justify-end border-b border-[#E2E8F0] print:hidden bg-white shadow-sm shrink-0">
             <button 
               onClick={() => { setTimeout(() => window.print(), 100); }}
               className="px-6 py-2 bg-[#2180B2] text-white rounded-lg font-bold hover:bg-[#1A6B94]"
             >
               طباعة الآن
             </button>
             <button 
               onClick={() => setPrintingBarcodeItem(null)}
               className="px-6 py-2 bg-[#E2E8F0] text-[#1E293B] rounded-lg font-bold hover:bg-[#CBD5E1]"
             >
               إلغاء
             </button>
           </div>
           
           <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#F1F5F9] print:p-0 print:bg-white">
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E8F0] print:shadow-none print:border-none print:p-0 flex flex-col items-center justify-center">
               <div className="text-center p-6 border-[3px] border-black rounded-2xl w-80 bg-white">
                 <h2 className="text-2xl font-bold mb-1 text-black">{printingBarcodeItem.name}</h2>
                 <p className="text-black font-bold mb-4">{printingBarcodeItem.brand || printingBarcodeItem.category}</p>
                 <div className="flex justify-center mb-4">
                   <Barcode value={printingBarcodeItem.code} width={2.5} height={80} displayValue={true} />
                 </div>
                 <p className="mt-2 text-3xl font-black text-black">{printingBarcodeItem.sellPrice} ج.م</p>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

