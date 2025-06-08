import React, { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useAuth } from "./AuthContext";
import { Invoice } from "../components/invoice-generator";
import io from "socket.io-client";

// Firebase configuration is already initialized in AuthContext

const db = getFirestore();

// Socket.io connection for real-time updates
const socket = io("http://localhost:3001"); // Replace with your actual socket server URL

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

interface DataContextType {
  invoices: Invoice[];
  customers: Customer[];
  loading: boolean;
  error: string | null;
  saveInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  saveCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getInvoicesByStatus: (status: string) => Invoice[];
  getInvoicesByCustomer: (customerId: string) => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  refreshData: () => Promise<void>;
  activityLog: ActivityLog[];
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: "invoice" | "customer" | "user" | "system";
  entityId: string;
  timestamp: string;
  details?: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  // Log activity
  const logActivity = async (action: string, entityType: "invoice" | "customer" | "user" | "system", entityId: string, details?: any) => {
    if (!currentUser) return;
    
    const logEntry: ActivityLog = {
      id: `log_${Date.now()}`,
      userId: currentUser.uid,
      userName: currentUser.displayName,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      details
    };
    
    try {
      await setDoc(doc(db, "activityLogs", logEntry.id), logEntry);
      
      // Emit real-time update
      socket.emit("activity", logEntry);
      
      setActivityLog(prev => [logEntry, ...prev]);
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  };

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load invoices
      const invoicesSnapshot = await getDocs(collection(db, "invoices"));
      const invoicesData = invoicesSnapshot.docs.map(doc => ({ ...doc.data() } as Invoice));
      setInvoices(invoicesData);
      
      // Load customers
      const customersSnapshot = await getDocs(collection(db, "customers"));
      const customersData = customersSnapshot.docs.map(doc => ({ ...doc.data() } as Customer));
      setCustomers(customersData);
      
      // Load recent activity logs
      const logsQuery = query(
        collection(db, "activityLogs"), 
        where("timestamp", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logsData = logsSnapshot.docs.map(doc => ({ ...doc.data() } as ActivityLog));
      setActivityLog(logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      
      setError(null);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listeners
  useEffect(() => {
    if (!currentUser) return;
    
    // Set up real-time listeners for data changes
    const invoicesUnsubscribe = onSnapshot(collection(db, "invoices"), (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({ ...doc.data() } as Invoice));
      setInvoices(invoicesData);
    });
    
    const customersUnsubscribe = onSnapshot(collection(db, "customers"), (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({ ...doc.data() } as Customer));
      setCustomers(customersData);
    });
    
    const logsUnsubscribe = onSnapshot(
      query(
        collection(db, "activityLogs"),
        where("timestamp", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ), 
      (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({ ...doc.data() } as ActivityLog));
        setActivityLog(logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    );
    
    // Socket.io listeners for real-time updates
    socket.on("invoice_update", (updatedInvoice: Invoice) => {
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    });
    
    socket.on("customer_update", (updatedCustomer: Customer) => {
      setCustomers(prev => prev.map(cust => cust.id === updatedCustomer.id ? updatedCustomer : cust));
    });
    
    socket.on("new_activity", (newActivity: ActivityLog) => {
      setActivityLog(prev => [newActivity, ...prev]);
    });
    
    // Initial data load
    loadData();
    
    return () => {
      invoicesUnsubscribe();
      customersUnsubscribe();
      logsUnsubscribe();
      socket.off("invoice_update");
      socket.off("customer_update");
      socket.off("new_activity");
    };
  }, [currentUser]);

  // CRUD operations for invoices
  const saveInvoice = async (invoice: Invoice): Promise<void> => {
    try {
      await setDoc(doc(db, "invoices", invoice.id), invoice);
      
      // Emit real-time update
      socket.emit("update_invoice", invoice);
      
      await logActivity("create", "invoice", invoice.id, { invoiceNumber: invoice.invoiceNumber });
    } catch (err) {
      console.error("Error saving invoice:", err);
      throw err;
    }
  };

  const updateInvoice = async (invoice: Invoice): Promise<void> => {
    try {
      await updateDoc(doc(db, "invoices", invoice.id), { ...invoice });
      
      // Emit real-time update
      socket.emit("update_invoice", invoice);
      
      await logActivity("update", "invoice", invoice.id, { invoiceNumber: invoice.invoiceNumber });
    } catch (err) {
      console.error("Error updating invoice:", err);
      throw err;
    }
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    try {
      const invoice = invoices.find(inv => inv.id === id);
      await deleteDoc(doc(db, "invoices", id));
      
      // Emit real-time update
      socket.emit("delete_invoice", id);
      
      await logActivity("delete", "invoice", id, { invoiceNumber: invoice?.invoiceNumber });
    } catch (err) {
      console.error("Error deleting invoice:", err);
      throw err;
    }
  };

  // CRUD operations for customers
  const saveCustomer = async (customer: Customer): Promise<void> => {
    try {
      await setDoc(doc(db, "customers", customer.id), customer);
      
      // Emit real-time update
      socket.emit("update_customer", customer);
      
      await logActivity("create", "customer", customer.id, { customerName: customer.name });
    } catch (err) {
      console.error("Error saving customer:", err);
      throw err;
    }
  };

  const updateCustomer = async (customer: Customer): Promise<void> => {
    try {
      await updateDoc(doc(db, "customers", customer.id), { ...customer });
      
      // Emit real-time update
      socket.emit("update_customer", customer);
      
      await logActivity("update", "customer", customer.id, { customerName: customer.name });
    } catch (err) {
      console.error("Error updating customer:", err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      const customer = customers.find(cust => cust.id === id);
      await deleteDoc(doc(db, "customers", id));
      
      // Emit real-time update
      socket.emit("delete_customer", id);
      
      await logActivity("delete", "customer", id, { customerName: customer?.name });
    } catch (err) {
      console.error("Error deleting customer:", err);
      throw err;
    }
  };

  // Helper functions
  const getInvoicesByStatus = (status: string): Invoice[] => {
    return invoices.filter(invoice => invoice.status === status);
  };

  const getInvoicesByCustomer = (customerId: string): Invoice[] => {
    return invoices.filter(invoice => invoice.customer.id === customerId);
  };

  const getInvoiceById = (id: string): Invoice | undefined => {
    return invoices.find(invoice => invoice.id === id);
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  };

  const refreshData = async (): Promise<void> => {
    await loadData();
  };

  const value = {
    invoices,
    customers,
    loading,
    error,
    saveInvoice,
    updateInvoice,
    deleteInvoice,
    saveCustomer,
    updateCustomer,
    deleteCustomer,
    getInvoicesByStatus,
    getInvoicesByCustomer,
    getInvoiceById,
    getCustomerById,
    refreshData,
    activityLog
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};