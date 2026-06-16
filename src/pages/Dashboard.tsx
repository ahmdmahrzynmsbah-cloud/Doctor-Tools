import React, { useMemo } from 'react';
import { useAppData } from '@/src/context/AppDataContext';
import { Package, FileText, Factory, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { inventory, invoices, purchases, customers, suppliers } = useAppData();

  const totalSales = useMemo(() => invoices.reduce((acc, inv) => acc + inv.total, 0), [invoices]);
  const totalPurchases = useMemo(() => purchases.reduce((acc, pur) => acc + pur.total, 0), [purchases]);
  
  const lowStockCount = useMemo(() => inventory.filter(i => i.quantity <= 10).length, [inventory]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">لوحة التحكم</h2>
        <p className="mt-1 text-sm text-[#475569]">نظرة عامة على نشاط النظام والتحليلات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
           <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center">
             <TrendingUp className="w-6 h-6" />
           </div>
           <div>
             <h3 className="text-xs font-bold text-[#475569] mb-1">إجمالي المبيعات</h3>
             <p className="text-3xl font-bold text-[#1E293B]">{totalSales.toLocaleString()} <span className="text-sm">ج.م</span></p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
           <div className="w-12 h-12 bg-[#FEF2F2] text-[#DC2626] rounded-full flex items-center justify-center">
             <Factory className="w-6 h-6" />
           </div>
           <div>
             <h3 className="text-xs font-bold text-[#475569] mb-1">إجمالي المشتريات (كافة الموردين)</h3>
             <p className="text-3xl font-bold text-[#1E293B]">{totalPurchases.toLocaleString()} <span className="text-sm">ج.م</span></p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
           <div className="w-12 h-12 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center">
             <Package className="w-6 h-6" />
           </div>
           <div>
             <h3 className="text-xs font-bold text-[#475569] mb-1">الأصناف المتوفرة</h3>
             <p className="text-3xl font-bold text-[#1E293B]">{inventory.length} <span className="text-sm">صنف</span></p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
           <div className="w-12 h-12 bg-[#FFFBEB] text-[#D97706] rounded-full flex items-center justify-center">
             <AlertTriangle className="w-6 h-6" />
           </div>
           <div>
             <h3 className="text-xs font-bold text-[#475569] mb-1">أصناف قاربت على النفاذ</h3>
             <p className="text-3xl font-bold text-[#DC2626]">{lowStockCount} <span className="text-sm">تنبيه</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="font-bold text-[#1E293B] mb-4">نشاط العملاء</h3>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center">
                 <Users className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm text-[#475569]">إجمالي العملاء المسجلين</p>
                  <p className="text-xl font-bold text-[#1E293B]">{customers.length} عميل</p>
               </div>
            </div>
            <div className="space-y-3">
               <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">أهم العملاء المدينين</p>
               {customers.filter(c => c.balance > 0).slice(0, 3).map(c => (
                 <div key={c.id} className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                   <span className="font-bold text-sm text-[#1E293B]">{c.name}</span>
                   <span className="font-bold text-[#DC2626]" dir="ltr">{c.balance.toLocaleString()} ج.م</span>
                 </div>
               ))}
               {customers.filter(c => c.balance > 0).length === 0 && (
                 <p className="text-sm text-[#94A3B8]">لا يوجد عملاء مدينون حالياً.</p>
               )}
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="font-bold text-[#1E293B] mb-4">نشاط الموردين</h3>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-[#EEF2FF] text-[#4F46E5] rounded-full flex items-center justify-center">
                 <Factory className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm text-[#475569]">إجمالي الموردين المعتمدين</p>
                  <p className="text-xl font-bold text-[#1E293B]">{suppliers.length} مورد</p>
               </div>
            </div>
            <div className="space-y-3">
               <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">مستحقات مطلوبة للموردين</p>
               {suppliers.filter(s => s.balance > 0).slice(0, 3).map(s => (
                 <div key={s.id} className="flex justify-between items-center bg-[#FEF2F2] p-3 rounded-lg border border-[#FECACA]">
                   <span className="font-bold text-sm text-[#991B1B]">{s.name}</span>
                   <span className="font-bold text-[#DC2626]" dir="ltr">{s.balance.toLocaleString()} ج.م</span>
                 </div>
               ))}
               {suppliers.filter(s => s.balance > 0).length === 0 && (
                 <p className="text-sm text-[#16A34A] font-bold">لا توجد ديون مستحقة للموردين.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
