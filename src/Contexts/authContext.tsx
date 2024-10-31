import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../MockService/auth';
import { getUserByEmail } from '../MockService/users';

interface AuthContextType {
  user: User | null;
  role: {name: string, permissions: string[]} | null | string; // Agregamos el rol
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null, 
  loading: true,
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('cambio el estado de usuario', currentUser);
      setUser(currentUser);
      if (currentUser) {
        try {
          const response = await getUserByEmail(currentUser.email as unknown as string);
          setRole(response.role); 
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setRole(null); 
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null); // Reinicia el rol al cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
