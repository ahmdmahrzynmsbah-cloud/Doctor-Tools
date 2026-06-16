import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Wrench } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(password)) {
      setError('كلمة المرور غير صحيحة. (استخدم: admin)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#E2E8F0]">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">AutoServ Pro</h1>
          <p className="text-[#475569] text-sm mt-1">تسجيل دخول الإدارة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#475569] mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 bg-[#F1F5F9] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              placeholder="أدخل كلمة المرور (admin)..."
              required
            />
            {error && <p className="text-[#DC2626] text-xs mt-2 font-bold">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#2563EB] text-white font-bold py-3 rounded-lg hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          >
            دخول النظام
          </button>
        </form>
      </div>
    </div>
  );
}
