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
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string): Promise<User> => {
    let user: User;
    if (email === "admin@example.com") {
      user = {
        uid: "2",
        email: "admin@example.com",
        displayName: "Admin",
        role: "admin",
        permissions: ["manage:all"],
        createdAt: new Date().toISOString()
      };
    } else {
      user = {
        uid: "1",
        email: email,
        displayName: "Student",
        role: "student",
        permissions: [],
        createdAt: new Date().toISOString()
      };
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem('currentUser');
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
