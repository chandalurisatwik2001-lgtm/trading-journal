import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null | false;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function formatApiErrorDetail(detail: any): string {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e: any) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null | false>(null);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
      setUser(data);
    } catch {
      setUser(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { email, password }, { withCredentials: true });
      setUser(data);
    } catch (e: any) {
      throw new Error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, { email, password, name }, { withCredentials: true });
      setUser(data);
    } catch (e: any) {
      throw new Error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
