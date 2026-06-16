import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  Users, 
  Factory, 
  LayoutDashboard,
  History,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { useAuth } from '@/src/context/AuthContext';
import { useAppData } from '@/src/context/AppDataContext';

const navigation = [
  { name: 'لوحة التحكم', to: '/', icon: LayoutDashboard },
  { name: 'الفواتير والمبيعات', to: '/invoices', icon: FileText },
  { name: 'إدارة المخزون', to: '/inventory', icon: Package },
  { name: 'العملاء', to: '/customers', icon: Users },
  { name: 'الموردون', to: '/suppliers', icon: Factory },
  { name: 'سجل المعاملات', to: '/audit-log', icon: History },
  { name: 'الإعدادات', to: '/settings', icon: Settings },
];

export default function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { logout } = useAuth();
  const { businessProfile } = useAppData();
  
  return (
    <aside className="w-64 bg-[#1A2332] text-[#F1F5F9] flex flex-col border-l border-[#243447] flex-shrink-0 h-screen print:hidden shadow-2xl md:shadow-none relative">
      <div className="p-6 flex items-center justify-between gap-3 border-b border-[#243447]">
        <div className="flex items-center gap-3 overflow-hidden">
          {businessProfile.logo ? (
            <div className="w-8 h-8 rounded bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={businessProfile.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{businessProfile.name.charAt(0)}</span>
            </div>
          )}
          <span className="text-lg font-bold tracking-tight truncate">{businessProfile.name}</span>
        </div>
        
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="md:hidden p-1 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#243447] cursor-pointer"
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
            }}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#94A3B8] hover:bg-[#243447] hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn("w-5 h-5", isActive ? "opacity-80" : "")}
                  aria-hidden="true"
                />
                <span className="font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-[#243447] bg-[#151C29] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#475569] flex items-center justify-center text-xs font-bold text-white">مح</div>
          <div>
            <p className="text-sm font-semibold">مستخدم</p>
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">مدير النظام</p>
          </div>
        </div>
        <button onClick={logout} className="text-[#94A3B8] hover:text-[#DC2626] cursor-pointer p-2 rounded-lg hover:bg-[#243447] transition-colors" title="تسجيل خروج">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
