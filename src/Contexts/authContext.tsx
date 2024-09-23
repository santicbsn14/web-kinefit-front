import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../MockService/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {} });

interface AuthProviderProps {
  children: ReactNode;
  sessionTimeout?: number; // Tiempo en milisegundos
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, sessionTimeout = 30 * 60 * 1000 }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      logout();
    }, sessionTimeout);
    setTimer(newTimer);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        resetTimer();
      }
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
    }

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [user]);

  const logout = async () => {
    console.log('me pegaron')
    await signOut(auth);
    setUser(null);
    if (timer) clearTimeout(timer);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);