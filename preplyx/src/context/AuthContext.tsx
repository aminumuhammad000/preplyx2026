"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  full_name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: '1',
    full_name: 'John Doe',
    email: 'john@example.com'
  }); // Mock logged in by default for development
  const [isLoading, setIsLoading] = useState(false);

  const login = (email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setUser({ id: '1', full_name: 'John Doe', email });
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
