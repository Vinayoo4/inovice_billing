import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import CryptoJS from 'crypto-js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export type UserRole = "admin" | "manager" | "accountant" | "staff";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: string[];
  department?: string;
  createdAt: string;
  lastLogin?: string;
  pin?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string, pin?: string) => Promise<User>;
  signOut: () => Promise<void>;
  createUser: (email: string, password: string, userData: Partial<User>) => Promise<User>;
  verifyPin: (pin: string) => boolean;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  getUsersByRole: (role: UserRole) => Promise<User[]>;
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

  // Encrypt and decrypt PIN
  const encryptPin = (pin: string): string => {
    return CryptoJS.AES.encrypt(pin, 'secure-pin-key').toString();
  };

  const decryptPin = (encryptedPin: string): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedPin, 'secure-pin-key');
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const verifyPin = (pin: string): boolean => {
    if (!currentUser?.pin) return false;
    const decryptedPin = decryptPin(currentUser.pin);
    return pin === decryptedPin;
  };

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        return {
          ...userData,
          uid: firebaseUser.uid,
          email: firebaseUser.email || ""
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string, pin?: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(userCredential.user);
      
      if (!userData) {
        throw new Error("User data not found");
      }
      
      // If PIN is required and provided, verify it
      if (userData.pin && pin) {
        const isValidPin = decryptPin(userData.pin) === pin;
        if (!isValidPin) {
          await firebaseSignOut(auth);
          throw new Error("Invalid PIN");
        }
      }
      
      // Update last login time
      await setDoc(doc(db, "users", userCredential.user.uid), {
        ...userData,
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      setCurrentUser(userData);
      return userData;
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const createUser = async (email: string, password: string, userData: Partial<User>): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Encrypt PIN if provided
      let secureUserData = { ...userData };
      if (userData.pin) {
        secureUserData.pin = encryptPin(userData.pin);
      }
      
      const newUser: User = {
        uid: userCredential.user.uid,
        email: email,
        displayName: userData.displayName || email.split('@')[0],
        role: userData.role || "staff",
        permissions: userData.permissions || [],
        department: userData.department,
        createdAt: new Date().toISOString(),
        ...secureUserData
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
      
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
    try {
      await setDoc(doc(db, "users", uid), { role }, { merge: true });
      if (currentUser && currentUser.uid === uid) {
        setCurrentUser({ ...currentUser, role });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  const getUsersByRole = async (role: UserRole): Promise<User[]> => {
    try {
      const usersQuery = query(collection(db, "users"), where("role", "==", role));
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as User));
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    // Admin has all permissions
    if (currentUser.role === "admin") return true;
    
    // Check specific permission
    return currentUser.permissions.includes(permission);
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signOut,
    createUser,
    verifyPin,
    updateUserRole,
    getUsersByRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};