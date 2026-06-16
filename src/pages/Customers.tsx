import React, { useState, useMemo } from 'react';
import { Plus, Search, Users as UsersIcon, X, History, User } from 'lucide-react';
import { useAppData, Customer } from '@/src/context/AppDataContext';

export default function Customers() {
  const { customers, invoices, addCustomer } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '', phone: '', balance: 0
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.includes(searchTerm) || 
      c.phone.includes(searchTerm) ||
      c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer(newCustomer);
    setIsAddModalOpen(false);
    setNewCustomer({ name: '', phone: '', balance: 0 });
  };

  const getCustomerTransactions = (customerId: string) => {
    return invoices.filter(inv => inv.customerId === customerId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">حسابات العملاء</h2>
          <p className="mt-1 text-sm text-[#475569]">إدارة بيانات العملاء والتفاصيل المالية وسجل المعاملات</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          إضافة عميل
        </button>
      </div>

      <div>
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
                placeholder="بحث بالرقم المسلسل للاستعلام، الاسم، أو الهاتف..."
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#F7FAFC] text-xs font-bold text-[#475569] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">رقم العميل</th>
                  <th className="px-6 py-4">اسم العميل</th>
                  <th className="px-6 py-4">رقم الهاتف</th>
                  <th className="px-6 py-4">الرصيد المالي الحالي (ج.م)</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#94A3B8]">
                      لا يوجد عملاء مطابقين للبحث
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-[#475569]">{customer.serialNumber}</td>
                      <td className="px-6 py-4 font-bold text-[#1E293B]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#475569] overflow-hidden">
                            <User className="w-4 h-4" />
                          </div>
                          {customer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#475569]">{customer.phone}</td>
                      <td className="px-6 py-4 font-bold" dir="ltr">
                        <span className={customer.balance > 0 ? 'text-[#DC2626]' : customer.balance < 0 ? 'text-[#16A34A]' : 'text-[#64748B]'}>
                          {customer.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#475569] rounded-lg font-bold text-xs hover:bg-[#E2E8F0] transition-colors border-none cursor-pointer"
                        >
                          <History className="w-4 h-4" />
                          سجل الفواتير والتعاملات
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Record Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                <History className="w-5 h-5 text-[#2563EB]" />
                سجل الفواتير المتبادلة
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-none">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-[#F1F5F9] p-4 rounded-xl border border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 text-right">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#2563EB] shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-lg">{selectedCustomer.name}</h3>
                    <p className="text-sm text-[#64748B] font-mono">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <div className="text-left bg-white px-5 py-3 rounded-xl shadow-sm border border-[#E2E8F0] w-full sm:w-auto">
                  <p className="text-xs text-[#475569] font-bold mb-1 block">الرصيد الحالي</p>
                  <p className={`text-2xl font-bold ${selectedCustomer.balance > 0 ? 'text-[#DC2626]' : selectedCustomer.balance < 0 ? 'text-[#16A34A]' : 'text-[#1E293B]'}`} dir="ltr">
                    {Math.abs(selectedCustomer.balance).toLocaleString()} <span className="text-xs text-[#94A3B8]">ج.م</span>
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-1 text-center font-bold">
                    {selectedCustomer.balance > 0 ? 'مطلوب من العميل' : selectedCustomer.balance < 0 ? 'رصيد دائن للعميل' : 'حساب خالص غير مدين'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2">الفواتير المسجلة</h4>
                
                <div className="space-y-3">
                  {getCustomerTransactions(selectedCustomer.id).length > 0 ? (
                    getCustomerTransactions(selectedCustomer.id).map(inv => (
                      <div key={inv.id} className="p-4 border border-[#E2E8F0] rounded-xl bg-white flex items-center justify-between hover:border-[#2563EB] transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold bg-[#EFF6FF] px-2 py-1 rounded text-[#2563EB] font-mono">فاتورة SA-{inv.invoiceNumber}</span>
                            <span className="text-xs font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded">{new Date(inv.date).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <p className="text-xs text-[#64748B] font-bold">إجمالي الفاتورة: <span className="text-[#1E293B] text-base">{inv.total.toLocaleString()}</span> ج.م</p>
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
                      <p className="text-sm font-bold text-[#94A3B8]">لا توجد فواتير سابقة لهذا العميل.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
               <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-xl font-bold hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                 إغلاق النافذة
               </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2332]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1E293B]">تسجيل عميل جديد</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">اسم العميل</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">رقم الهاتف</label>
                <input required type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none" dir="ltr" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#475569]">الرصيد الإفتتاحي (ج.م)</label>
                <input type="number" value={newCustomer.balance} onChange={e => setNewCustomer({...newCustomer, balance: Number(e.target.value)})} className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none" />
                <p className="text-[10px] text-[#94A3B8]">الموجب يعني أن العميل مدين (عليه فلوس)، السالب معناه دائن للورشة.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E2E8F0] mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#475569] bg-[#F1F5F9] rounded-lg hover:bg-[#E2E8F0] cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] cursor-pointer">
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
