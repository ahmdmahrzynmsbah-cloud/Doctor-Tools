import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type InventoryItem = {
  id: string;
  code: string;
  name: string;
  brand: string;
  compatibleCars: string;
  category: string;
  storageLocation: string;
  quantity: number;
  purchasePrice: number;
  sellPrice: number;
};

export type Customer = {
  id: string;
  serialNumber: string;
  name: string;
  phone: string;
  balance: number; // positive means they owe us
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  balance: number; // positive means we owe them
};

export type TransactionItem = {
  itemId: string;
  quantity: number;
  price: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  items: TransactionItem[];
  total: number;
  paid: number;
};

export type PurchaseOrder = {
  id: string;
  date: string;
  supplierId: string;
  items: TransactionItem[];
  total: number;
  paid: number;
};

export type AppNotification = {
  id: string;
  message: string;
  date: string;
  read: boolean;
};

export type BusinessProfile = {
  name: string;
  phone: string;
  address: string;
  logo: string | null;
};

type AppDataContextType = {
  inventory: InventoryItem[];
  categories: string[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchases: PurchaseOrder[];
  notifications: AppNotification[];
  businessProfile: BusinessProfile;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Omit<InventoryItem, 'id'>) => void;
  deleteInventoryItem: (id: string) => void;
  
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'serialNumber'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoice: (id: string, invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  deleteInvoice: (id: string) => void;
  
  createPurchase: (purchase: Omit<PurchaseOrder, 'id'>) => void;
  
  markAllNotificationsRead: () => void;
  updateBusinessProfile: (profile: BusinessProfile) => void;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: 'AutoServ Pro',
    phone: '01000000000',
    address: 'القاهرة، شارع التسعين',
    logo: null
  });

  // Default seed run flag
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      setInventory(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
    });

    const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snapshot) => {
      setSuppliers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Supplier)));
    });

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setInvoices(data);
    });

    const unsubPurchases = onSnapshot(collection(db, 'purchases'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseOrder));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPurchases(data);
    });

    const unsubCategories = onSnapshot(doc(db, 'settings', 'categories'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setCategories(docSnap.data().list);
      } else if (!hasSeeded) {
        // Only seed if empty
        const defaultCategories = ["فلاتر", "فرامل", "كهرباء", "زيوت", "إطارات", "عادم", "تعليق", "أخرى"];
        setDoc(doc(db, 'settings', 'categories'), { list: defaultCategories }).catch(console.error);
        setHasSeeded(true);
      }
    });

    const unsubProfile = onSnapshot(doc(db, 'settings', 'businessProfile'), (docSnap) => {
      if (docSnap.exists()) {
        setBusinessProfile(docSnap.data() as BusinessProfile);
      } else if (!hasSeeded) {
        setDoc(doc(db, 'settings', 'businessProfile'), businessProfile).catch(console.error);
        setHasSeeded(true);
      }
    });

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNotifications(data);
    });

    return () => {
      unsubInventory();
      unsubCustomers();
      unsubSuppliers();
      unsubInvoices();
      unsubPurchases();
      unsubCategories();
      unsubProfile();
      unsubNotifications();
    };
  }, [hasSeeded]);

  // Derived low stock notifications
  const lowStockThreshold = 10;
  const currentNotifications = useMemo(() => {
    const lowStockAlerts = inventory
      .filter(i => i.quantity <= lowStockThreshold)
      .map(i => ({
        id: `low-stock-${i.id}`,
        message: `تنبيه: صنف (${i.name}) قارب على الانتهاء. المتبقي: ${i.quantity}`,
        date: new Date().toISOString(),
        read: false
      }));
    
    return [...notifications, ...lowStockAlerts];
  }, [inventory, notifications]);

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'inventory'), item);
    } catch (e) {
      console.error('Error adding inventory item:', e);
    }
  };
  
  const updateInventoryItem = async (id: string, item: Omit<InventoryItem, 'id'>) => {
    try {
      await updateDoc(doc(db, 'inventory', id), item as any);
    } catch (e) {
      console.error('Error updating inventory item:', e);
    }
  };
  
  const deleteInventoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (e) {
      console.error('Error deleting inventory item:', e);
    }
  };

  const addCategory = async (category: string) => {
    if (!categories.includes(category) && category.trim()) {
      try {
        await updateDoc(doc(db, 'settings', 'categories'), {
          list: [...categories, category.trim()]
        });
      } catch (e) { console.error(e); }
    }
  };
  
  const removeCategory = async (category: string) => {
    try {
      await updateDoc(doc(db, 'settings', 'categories'), {
        list: categories.filter(c => c !== category)
      });
    } catch (e) { console.error(e); }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'serialNumber'>) => {
    try {
      const serialNumber = `CUST-${1000 + customers.length + 1}`;
      await addDoc(collection(db, 'customers'), { ...customer, serialNumber });
    } catch (e) { console.error(e); }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      await addDoc(collection(db, 'suppliers'), supplier);
    } catch (e) { console.error(e); }
  };

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    try {
      const invoiceNumber = `INV-${1000 + invoices.length + 1}`;
      await addDoc(collection(db, 'invoices'), { ...invoice, invoiceNumber });
      
      // Update Inventory
      for (const invItem of invoice.items) {
        const item = inventory.find(i => i.id === invItem.itemId);
        if (item) {
          await updateDoc(doc(db, 'inventory', item.id), {
            quantity: item.quantity - invItem.quantity
          });
        }
      }

      // Update Customer Balance
      const remaining = invoice.total - invoice.paid;
      if (remaining !== 0) {
        const customer = customers.find(c => c.id === invoice.customerId);
        if (customer) {
          await updateDoc(doc(db, 'customers', customer.id), {
            balance: customer.balance + remaining
          });
        }
      }
    } catch (e) { console.error(e); }
  };

  const updateInvoice = async (id: string, invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    try {
      const existingInvoice = invoices.find(inv => inv.id === id);
      if (!existingInvoice) return;

      await updateDoc(doc(db, 'invoices', id), invoice as any);

      // Revert old inventory
      for (const item of inventory) {
        const oldSoldItem = existingInvoice.items.find(i => i.itemId === item.id);
        const newSoldItem = invoice.items.find(i => i.itemId === item.id);
        
        let newQuantity = item.quantity;
        if (oldSoldItem) newQuantity += oldSoldItem.quantity; // revert old
        if (newSoldItem) newQuantity -= newSoldItem.quantity; // apply new
        
        if (newQuantity !== item.quantity) {
          await updateDoc(doc(db, 'inventory', item.id), { quantity: newQuantity });
        }
      }

      // Revert old customer balance
      const oldRemaining = existingInvoice.total - existingInvoice.paid;
      const newRemaining = invoice.total - invoice.paid;
      
      if (existingInvoice.customerId === invoice.customerId) {
        const customer = customers.find(c => c.id === existingInvoice.customerId);
        if (customer) {
          await updateDoc(doc(db, 'customers', customer.id), {
            balance: customer.balance - oldRemaining + newRemaining
          });
        }
      } else {
        const oldCustomer = customers.find(c => c.id === existingInvoice.customerId);
        if (oldCustomer) {
          await updateDoc(doc(db, 'customers', oldCustomer.id), {
            balance: oldCustomer.balance - oldRemaining
          });
        }
        const newCustomer = customers.find(c => c.id === invoice.customerId);
        if (newCustomer) {
          await updateDoc(doc(db, 'customers', newCustomer.id), {
            balance: newCustomer.balance + newRemaining
          });
        }
      }
    } catch (e) { console.error(e); }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const invToDelete = invoices.find(inv => inv.id === id);
      if (!invToDelete) return;

      await deleteDoc(doc(db, 'invoices', id));

      // Revert inventory
      for (const invItem of invToDelete.items) {
        const item = inventory.find(i => i.id === invItem.itemId);
        if (item) {
          await updateDoc(doc(db, 'inventory', item.id), {
            quantity: item.quantity + invItem.quantity
          });
        }
      }

      // Revert customer balance
      const remaining = invToDelete.total - invToDelete.paid;
      if (remaining !== 0) {
        const customer = customers.find(c => c.id === invToDelete.customerId);
        if (customer) {
          await updateDoc(doc(db, 'customers', customer.id), {
            balance: customer.balance - remaining
          });
        }
      }
    } catch (e) { console.error(e); }
  };

  const createPurchase = async (purchase: Omit<PurchaseOrder, 'id'>) => {
    try {
      await addDoc(collection(db, 'purchases'), purchase);
      
      // Update Inventory
      for (const purItem of purchase.items) {
        const item = inventory.find(i => i.id === purItem.itemId);
        if (item) {
          await updateDoc(doc(db, 'inventory', item.id), {
            quantity: item.quantity + purItem.quantity
          });
        }
      }

      // Update Supplier Balance
      const remaining = purchase.total - purchase.paid;
      if (remaining !== 0) {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        if (supplier) {
          await updateDoc(doc(db, 'suppliers', supplier.id), {
            balance: supplier.balance + remaining
          });
        }
      }
    } catch (e) { console.error(e); }
  };

  const markAllNotificationsRead = async () => {
    try {
      for (const notif of notifications) {
        if (!notif.read) {
          await updateDoc(doc(db, 'notifications', notif.id), { read: true });
        }
      }
    } catch (e) { console.error(e); }
  };

  const updateBusinessProfile = async (profile: BusinessProfile) => {
    try {
      await setDoc(doc(db, 'settings', 'businessProfile'), profile);
    } catch (e) { console.error(e); }
  };

  return (
    <AppDataContext.Provider value={{
      inventory, categories, customers, suppliers, invoices, purchases, notifications: currentNotifications, businessProfile,
      addInventoryItem, updateInventoryItem, deleteInventoryItem, addCategory, removeCategory,
      addCustomer, addSupplier, createInvoice, updateInvoice, deleteInvoice, createPurchase, markAllNotificationsRead, updateBusinessProfile
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
