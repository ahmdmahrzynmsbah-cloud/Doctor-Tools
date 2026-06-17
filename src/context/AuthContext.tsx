import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (pass: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (pass: string) => {
    if (pass.trim().toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'كلمة المرور غير صحيحة. (استخدم: admin)' };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
