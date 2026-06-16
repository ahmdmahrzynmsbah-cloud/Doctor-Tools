import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Wrench } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    const result = await login(password);

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#E2E8F0]">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#2180B2] rounded-2xl flex items-center justify-center mb-4 shadow-md">
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
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 bg-[#F1F5F9] focus:ring-2 focus:ring-[#2180B2] focus:outline-none"
              placeholder="أدخل كلمة المرور (admin)..."
              required
            />
            {error && <p className="text-[#DC2626] text-xs mt-2 font-bold text-center">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#2180B2] text-white font-bold py-3 rounded-lg hover:bg-[#1A6B94] transition-colors cursor-pointer block"
          >
            دخول النظام
          </button>
        </form>
      </div>
    </div>
  );
}

