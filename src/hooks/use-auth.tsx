
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getUsers, saveUsers } from '@/lib/data';
import type { User, Role } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: Role) => { success: boolean, error?: string };
  logout: () => void;
  register: (data: Omit<User, 'id' | 'avatarUrl'|'attendance'>) => boolean;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client
    const allUsers = getUsers();
    setUsers(allUsers);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Refresh check against latest approved state
        const freshUser = allUsers.find(u => u.id === parsed.id);
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } else {
          setUser(parsed);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, role: Role): { success: boolean, error?: string } => {
    const allUsers = getUsers();
    const foundUser = allUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (foundUser) {
      if (foundUser.role === 'faculty') {
        const isApproved = foundUser.isApproved === true;
        if (!isApproved) {
          return {
            success: false,
            error: "Your faculty account is pending approval from the Super Admin. Please contact administration."
          };
        }
      }
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password for the selected role." };
  };

  const register = (data: Omit<User, 'id' | 'avatarUrl' | 'attendance' >): boolean => {
    const allUsers = getUsers();
    const existingUser = allUsers.find(u => u.email === data.email);

    if (existingUser) {
        return false;
    }

    const isFaculty = data.role === 'faculty';
    const newUser: User = {
        id: `user${allUsers.length + 1}`,
        ...data,
        avatarUrl: `https://placehold.co/100x100.png`,
        isApproved: isFaculty ? false : true,
        status: isFaculty ? 'pending' : 'active'
    };
    
    const updatedUsers = [...allUsers, newUser];
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    
    return true;
  }

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const allUsers = getUsers();
    const updatedUsers = allUsers.map(u => u.id === user.id ? { ...u, ...updatedData } : u);
    saveUsers(updatedUsers);

    const newUserState = { ...user, ...updatedData };
    setUser(newUserState);
    localStorage.setItem('user', JSON.stringify(newUserState));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
