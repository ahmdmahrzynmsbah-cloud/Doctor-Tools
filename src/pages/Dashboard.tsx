import React, { useMemo } from 'react';
import { useAppData } from '@/src/context/AppDataContext';
import { Package, FileText, ArrowUpRight, TrendingDown, Wallet, CreditCard, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { inventory, invoices, customers } = useAppData();

  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayInvoices = invoices.filter(inv => inv.date.startsWith(todayStr));
  const todaySales = todayInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const todayDebt = todayInvoices.reduce((acc, inv) => acc + (inv.total - inv.paid), 0);
  const todayCash = todayInvoices.reduce((acc, inv) => acc + inv.paid, 0);
  
  const allTimeDebt = customers.reduce((acc, c) => acc + c.balance, 0);
  const lowStockCount = inventory.filter(i => i.quantity <= 5).length;

  // Recent 5 invoices
  const recentInvoices = [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
        <div className="text-right mb-6 md:mb-0 w-full md:w-auto order-1 md:order-2">
           <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2 flex items-center justify-end gap-2">
              مرحباً بك، admin <span className="text-3xl">👋</span>
           </h2>
           <p className="text-[#475569] text-sm md:text-base">نظام إدارة الأوراق المالية والمخازن لقطع غيار السيارات والميكانيكا</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto order-2 md:order-1">
           <Link to="/inventory" className="flex-1 md:flex-none justify-center bg-white border border-[#E2E8F0] text-[#1E293B] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors">
               <Package className="w-5 h-5"/> المستودع
           </Link>
           <Link to="/invoices" className="flex-1 md:flex-none justify-center bg-[#2180B2] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-colors">
               <FileText className="w-5 h-5"/> فاتورة بيع جديدة
           </Link>
        </div>
      </div>

      {/* Stats Cards Grid - matches the image order roughly */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
           <div>
             <h3 className="text-xs font-bold text-[#94A3B8] mb-1">القطع بالمستودع</h3>
             <p className="text-2xl font-black text-[#1E293B]">{inventory.length}</p>
           </div>
           <div className="w-10 h-10 bg-[#EFF6FF] text-[#3B82F6] rounded-lg flex items-center justify-center shrink-0">
             <Package className="w-5 h-5" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
           <div>
             <h3 className="text-xs font-bold text-[#94A3B8] mb-1 whitespace-nowrap">مبيعات اليوم <br/><span className="text-[10px]">(الإجمالي)</span></h3>
             <p className="text-2xl font-black text-[#10B981]">{todaySales} <span className="text-[10px] font-bold text-[#94A3B8]">ج.م</span></p>
           </div>
           <div className="w-10 h-10 bg-[#ECFDF5] text-[#10B981] rounded-lg flex items-center justify-center shrink-0">
             <ArrowUpRight className="w-5 h-5" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
           <div>
             <h3 className="text-xs font-bold text-[#94A3B8] mb-1 whitespace-nowrap">الديون المعلقة <br/><span className="text-[10px]">(اليوم)</span></h3>
             <p className="text-2xl font-black text-[#F59E0B]">{todayDebt} <span className="text-[10px] font-bold text-[#94A3B8]">ج.م</span></p>
           </div>
           <div className="w-10 h-10 bg-[#FFFBEB] text-[#F59E0B] rounded-lg flex items-center justify-center shrink-0">
             <TrendingDown className="w-5 h-5" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-center gap-2">
           <div className="flex items-center justify-between w-full">
             <div>
               <h3 className="text-xs font-bold text-[#2180B2] mb-1">الموجود في الدرج</h3>
               <p className="text-2xl font-black text-[#2180B2]">{todayCash} <span className="text-[10px] font-bold text-[#94A3B8]">ج.م</span></p>
             </div>
             <div className="w-10 h-10 bg-[#EFF6FF] text-[#2180B2] rounded-lg flex items-center justify-center shrink-0">
               <Wallet className="w-5 h-5" />
             </div>
           </div>
           <p className="text-[9px] font-bold text-[#94A3B8] border-t border-[#E2E8F0] pt-1 w-full text-center">المبيعات الكاش - المصروفات: 0 ج</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
           <div>
             <h3 className="text-xs font-bold text-[#94A3B8] mb-1">الديون بكل <br/><span className="text-[10px]">الأيام</span></h3>
             <p className="text-2xl font-black text-[#EF4444]">{allTimeDebt} <span className="text-[10px] font-bold text-[#94A3B8]">ج.م</span></p>
           </div>
           <div className="w-10 h-10 bg-[#FEF2F2] text-[#EF4444] rounded-lg flex items-center justify-center shrink-0">
             <CreditCard className="w-5 h-5" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between relative overflow-hidden">
           <div>
             <h3 className="text-xs font-bold text-[#94A3B8] mb-1">أوشكت على <br/><span className="text-[10px]">النفاذ</span></h3>
             <p className={`text-2xl font-black ${lowStockCount > 0 ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>{lowStockCount}</p>
           </div>
           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 z-10 ${lowStockCount > 0 ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#FFFBEB] text-[#F59E0B]"}`}>
             <AlertTriangle className="w-5 h-5" />
           </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         
         <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="p-6 flex justify-between items-center border-b border-[#F1F5F9] md:flex-row flex-col gap-4">
               <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                 <FileText className="w-5 h-5 text-[#2180B2]" />
                 آخر الفواتير الصادرة
               </h3>
               <Link to="/invoices" className="text-sm font-bold text-[#2180B2] flex items-center gap-1 hover:underline">
                 عرض المبيعات <ArrowLeft className="w-4 h-4" />
               </Link>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-right">
                  <thead className="bg-[#white] text-[#94A3B8]">
                     <tr>
                        <th className="py-4 px-6 font-bold whitespace-nowrap">رقم الفاتورة</th>
                        <th className="py-4 px-6 font-bold whitespace-nowrap">العميل</th>
                        <th className="py-4 px-6 font-bold whitespace-nowrap">التاريخ</th>
                        <th className="py-4 px-6 font-bold text-center whitespace-nowrap">طريقة الدفع</th>
                        <th className="py-4 px-6 font-bold text-left whitespace-nowrap">المبلغ الإجمالي</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                     {recentInvoices.map((inv) => {
                       const c = customers.find(x => x.id === inv.customerId);
                       const isFullyPaid = inv.paid >= inv.total;
                       const isPartiallyPaid = inv.paid > 0 && inv.paid < inv.total;
                       const dateStr = new Date(inv.date);
                       
                       const formattedDate = `${dateStr.getHours().toString().padStart(2, '0')}:${dateStr.getMinutes().toString().padStart(2, '0')} ${dateStr.getDate().toString().padStart(2, '0')}/${(dateStr.getMonth()+1).toString().padStart(2, '0')}/${dateStr.getFullYear()}`;

                       return (
                         <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors">
                           <td className="py-4 px-6 font-bold text-[#1E293B]">SA-{inv.invoiceNumber}</td>
                           <td className="py-4 px-6 font-bold text-[#1E293B]">{c?.name || 'عميل نقدي'}</td>
                           <td className="py-4 px-6 text-[#94A3B8] font-mono text-right" dir="ltr">{formattedDate}</td>
                           <td className="py-4 px-6 text-center">
                             {isFullyPaid ? (
                               <span className="px-3 py-1 bg-[#F0FDF4] text-[#16A34A] rounded-lg text-xs font-bold">نقدي</span>
                             ) : isPartiallyPaid ? (
                               <span className="px-3 py-1 bg-[#FFFBEB] text-[#D97706] rounded-lg text-xs font-bold">جزئي</span>
                             ) : (
                               <span className="px-3 py-1 bg-[#FEF2F2] text-[#DC2626] rounded-lg text-xs font-bold">آجل</span>
                             )}
                           </td>
                           <td className="py-4 px-6 font-black text-[#1E293B] text-left">{inv.total} <span className="text-xs font-bold text-[#94A3B8]">ج.م</span></td>
                         </tr>
                       );
                     })}
                     {recentInvoices.length === 0 && (
                       <tr>
                         <td colSpan={5} className="py-8 text-center text-[#94A3B8]">لا توجد فواتير صادرة مؤخراً.</td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden text-center col-span-1 border-dashed">
            <div className="absolute top-6 left-6 text-[#F59E0B]">
               <AlertTriangle className="w-5 h-5 bg-yellow-100 p-1 rounded-full text-yellow-500" />
            </div>
            <h3 className="font-bold text-lg text-[#1E293B] mb-2 absolute top-6 right-6">تنبيهات المخزون<br/> الحرج</h3>
            
            <div className={`mt-10 w-24 h-24 ${lowStockCount > 0 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#FEF3C7] text-[#F59E0B]"} rounded-full flex flex-col items-center justify-center mb-6`}>
               <span className="text-3xl font-black">{lowStockCount}</span>
               <span className="text-xs font-bold">قطع</span>
            </div>
            
            {lowStockCount === 0 ? (
               <p className="text-center text-[#94A3B8] text-sm font-bold px-2">
                 جميع السلع متوفرة بكمية ممتازة (أعلى من 5 حبات). 👍
               </p>
            ) : (
               <p className="text-center text-[#DC2626] text-sm font-bold px-2">
                 يوجد {lowStockCount} قطع قاربت على النفاذ بالمستودع وتحتاج للطلب فوراً.
               </p>
            )}
         </div>

      </div>

    </div>
  );
}
