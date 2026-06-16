import React from 'react';
import { Invoice, Customer, InventoryItem, BusinessProfile } from '@/src/context/AppDataContext';

type InvoicePrintProps = {
  invoice: Invoice;
  customer?: Customer;
  inventory: InventoryItem[];
  profile: BusinessProfile;
};

export default function InvoicePrint({ invoice, customer, inventory, profile }: InvoicePrintProps) {
  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto w-[800px] min-h-[1000px] print:w-full print:min-h-0" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex items-center gap-4">
          {profile.logo && (
            <img src={profile.logo} alt="Logo" className="w-20 h-20 object-contain" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-gray-600 mt-1">{profile.address}</p>
            <p className="text-gray-600">هاتف: <span dir="ltr">{profile.phone}</span></p>
          </div>
        </div>
        <div className="text-left">
          <h2 className="text-4xl font-bold text-gray-200 mb-2 uppercase tracking-widest">فاتورة</h2>
          <p className="font-bold text-lg">{invoice.invoiceNumber}</p>
          <p className="text-gray-600">التاريخ: {new Date(invoice.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-700 border-b border-gray-300 pb-2 mb-3">بيانات العميل</h3>
        <p className="font-bold text-lg">{customer?.name || 'عميل غير معروف'}</p>
        <p className="text-gray-600">رقم الهاتف: <span dir="ltr">{customer?.phone}</span></p>
        <p className="text-gray-600">الكود: <span dir="ltr">{customer?.serialNumber}</span></p>
      </div>

      {/* Items Table */}
      <table className="w-full text-right mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-800 border-y-2 border-gray-800">
            <th className="py-3 px-4 font-bold w-16">م</th>
            <th className="py-3 px-4 font-bold">البيان / الصنف</th>
            <th className="py-3 px-4 font-bold w-24">الكمية</th>
            <th className="py-3 px-4 font-bold w-32">السعر (ج.م)</th>
            <th className="py-3 px-4 font-bold w-32">الإجمالي (ج.م)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 border-b-2 border-gray-800">
          {invoice.items.map((item, idx) => {
            const invItem = inventory.find(i => i.id === item.itemId);
            const lineTotal = item.quantity * item.price;
            return (
              <tr key={idx}>
                <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                <td className="py-3 px-4 font-bold">{invItem?.name || 'صنف محذوف'}</td>
                <td className="py-3 px-4 text-gray-700">{item.quantity}</td>
                <td className="py-3 px-4 text-gray-700">{item.price.toLocaleString()}</td>
                <td className="py-3 px-4 font-bold">{lineTotal.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-lg">
            <span className="font-bold">الإجمالي:</span>
            <span className="font-bold">{invoice.total.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between text-green-700 border-b border-gray-300 pb-2">
            <span className="font-bold">المدفوع:</span>
            <span className="font-bold">{invoice.paid.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between text-xl pt-1">
            <span className="font-bold">الباقي:</span>
            <span className="font-bold text-red-700">{(invoice.total - invoice.paid).toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-16 pt-8 border-t border-gray-200">
        <p>لا ترد أو تستبدل البضاعة المباعة إلا في حالة وجود عيب صناعة خلال 14 يوم من تاريخ الشراء بشرط وجود الفاتورة الأصلية.</p>
        <p className="mt-2 font-bold text-gray-800">شكراً لتعاملكم معنا!</p>
      </div>
    </div>
  );
}
