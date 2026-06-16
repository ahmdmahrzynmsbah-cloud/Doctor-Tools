import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F0F4F8] print:bg-white text-[#1E293B] font-sans overflow-hidden print:overflow-visible print:h-auto print:block" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <Header />
        <main className="flex-1 p-8 print:p-0 overflow-y-auto print:overflow-visible print:h-auto space-y-6 print:space-y-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

