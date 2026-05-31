import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "student";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: string[];
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<User>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('sfm_session');
    if (session) {
      setCurrentUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password?: string): Promise<User> => {
    const usersStr = localStorage.getItem('users');
    if (!usersStr) {
      throw new Error("No users found in database");
    }

    const users = JSON.parse(usersStr);
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const sessionUser: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      permissions: user.permissions || [],
      createdAt: user.createdAt || new Date().toISOString()
    };

    localStorage.setItem('sfm_session', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem('sfm_session');
    setCurrentUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    return currentUser.permissions.includes(permission);
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signOut,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
