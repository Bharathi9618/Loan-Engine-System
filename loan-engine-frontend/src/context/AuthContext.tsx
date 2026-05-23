import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';
import type { Role, User } from '../types';
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserFromAuth: (token: string, email: string, firstName: string, lastName: string, role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = storage.getToken();
    const savedUser = storage.getUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const setUserFromAuth = useCallback(
    (newToken: string, email: string, firstName: string, lastName: string, role: Role) => {
      const u: User = { email, firstName, lastName, role };
      storage.setToken(newToken);
      storage.setUser(u);
      setToken(newToken);
      setUser(u);
    },
    []
  );

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    if (!data.token || !data.role) throw new Error('Invalid login response');
    setUserFromAuth(data.token, data.email!, data.firstName!, data.lastName!, data.role as Role);
  };

  const logout = () => {
    storage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        logout,
        setUserFromAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
