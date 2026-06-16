import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  updateCustomer: (id: string, customer: Omit<Customer, 'id' | 'serialNumber'>) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Omit<Supplier, 'id'>) => void;
  deleteSupplier: (id: string) => void;
  
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoice: (id: string, invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  deleteInvoice: (id: string) => void;
  
  createPurchase: (purchase: Omit<PurchaseOrder, 'id'>) => void;
  recordCustomerPayment: (customerId: string, amount: number) => void;
  recordSupplierPayment: (supplierId: string, amount: number) => void;
  
  markAllNotificationsRead: () => void;
  updateBusinessProfile: (profile: BusinessProfile) => void;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const loadData = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<string[]>(() => loadData('categories', ["فلاتر", "فرامل", "كهرباء", "زيوت", "إطارات", "عادم", "تعليق", "أخرى"]));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadData('inventory', []));
  const [customers, setCustomers] = useState<Customer[]>(() => loadData('customers', []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadData('suppliers', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadData('invoices', []));
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => loadData('purchases', []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadData('notifications', []));
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => loadData('businessProfile', {
    name: 'AutoServ Pro',
    phone: '01000000000',
    address: 'القاهرة، شارع التسعين',
    logo: null
  }));

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('businessProfile', JSON.stringify(businessProfile));
  }, [businessProfile]);

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

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setInventory(prev => [...prev, newItem]);
  };
  
  const updateInventoryItem = (id: string, item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...item, id } : i));
  };
  
  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category) && category.trim()) {
      setCategories(prev => [...prev, category.trim()]);
    }
  };
  
  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'serialNumber'>) => {
    const serialNumber = `CUST-${1000 + customers.length + 1}`;
    setCustomers(prev => [...prev, { ...customer, id: crypto.randomUUID(), serialNumber }]);
  };

  const updateCustomer = (id: string, customer: Omit<Customer, 'id' | 'serialNumber'>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: crypto.randomUUID() }]);
  };

  const updateSupplier = (id: string, supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const createInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const invoiceNumber = `INV-${1000 + invoices.length + 1}`;
    const newInvoice = { ...invoice, id: crypto.randomUUID(), invoiceNumber };
    setInvoices(prev => [newInvoice, ...prev]);
    
    // Update Inventory
    setInventory(prev => prev.map(item => {
      const soldItem = invoice.items.find(i => i.itemId === item.id);
      return soldItem ? { ...item, quantity: item.quantity - soldItem.quantity } : item;
    }));

    // Update Customer Balance
    const remaining = invoice.total - invoice.paid;
    if (remaining !== 0) {
      setCustomers(prev => prev.map(c => 
        c.id === invoice.customerId ? { ...c, balance: c.balance + remaining } : c
      ));
    }
  };

  const updateInvoice = (id: string, invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const existingInvoice = invoices.find(inv => inv.id === id);
    if (!existingInvoice) return;

    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...invoice } : inv));

    // Revert old inventory and apply new
    setInventory(prev => prev.map(item => {
      const oldSoldItem = existingInvoice.items.find(i => i.itemId === item.id);
      const newSoldItem = invoice.items.find(i => i.itemId === item.id);
      
      let newQuantity = item.quantity;
      if (oldSoldItem) newQuantity += oldSoldItem.quantity; // revert old
      if (newSoldItem) newQuantity -= newSoldItem.quantity; // apply new
      
      return { ...item, quantity: newQuantity };
    }));

    // Revert old customer balance and apply new
    const oldRemaining = existingInvoice.total - existingInvoice.paid;
    const newRemaining = invoice.total - invoice.paid;
    
    setCustomers(prev => prev.map(c => {
      if (c.id === existingInvoice.customerId && c.id === invoice.customerId) {
        return { ...c, balance: c.balance - oldRemaining + newRemaining };
      } else if (c.id === existingInvoice.customerId) {
        return { ...c, balance: c.balance - oldRemaining };
      } else if (c.id === invoice.customerId) {
        return { ...c, balance: c.balance + newRemaining };
      }
      return c;
    }));
  };

  const deleteInvoice = (id: string) => {
    const invToDelete = invoices.find(inv => inv.id === id);
    if (!invToDelete) return;

    setInvoices(prev => prev.filter(inv => inv.id !== id));

    // Revert inventory
    setInventory(prev => prev.map(item => {
      const soldItem = invToDelete.items.find(i => i.itemId === item.id);
      return soldItem ? { ...item, quantity: item.quantity + soldItem.quantity } : item;
    }));

    // Revert customer balance
    const remaining = invToDelete.total - invToDelete.paid;
    if (remaining !== 0) {
      setCustomers(prev => prev.map(c => 
        c.id === invToDelete.customerId ? { ...c, balance: c.balance - remaining } : c
      ));
    }
  };

  const createPurchase = (purchase: Omit<PurchaseOrder, 'id'>) => {
    const newPurchase = { ...purchase, id: crypto.randomUUID() };
    setPurchases(prev => [newPurchase, ...prev]);
    
    // Update Inventory
    setInventory(prev => prev.map(item => {
      const purItem = purchase.items.find(i => i.itemId === item.id);
      return purItem ? { ...item, quantity: item.quantity + purItem.quantity } : item;
    }));

    // Update Supplier Balance
    const remaining = purchase.total - purchase.paid;
    if (remaining !== 0) {
      setSuppliers(prev => prev.map(s => 
        s.id === purchase.supplierId ? { ...s, balance: s.balance + remaining } : s
      ));
    }
  };

  const recordCustomerPayment = (customerId: string, amount: number) => {
    if (amount <= 0) return;
    
    // Record it as an empty invoice "Payment"
    const invoiceNumber = `PAY-${1000 + invoices.length + 1}`;
    const newInvoice = {
      id: crypto.randomUUID(),
      invoiceNumber,
      date: new Date().toISOString(),
      customerId,
      items: [],
      total: 0,
      paid: amount
    };
    
    setInvoices(prev => [newInvoice, ...prev]);

    // Update Customer Balance (remaining = total - paid = 0 - amount = -amount)
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, balance: c.balance - amount } : c
    ));
  };

  const recordSupplierPayment = (supplierId: string, amount: number) => {
    if (amount <= 0) return;
    
    // Record it as an empty purchase "Payment"
    const newPurchase = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      supplierId,
      items: [],
      total: 0,
      paid: amount
    };
    
    setPurchases(prev => [newPurchase, ...prev]);

    // Update Supplier Balance
    setSuppliers(prev => prev.map(s => 
      s.id === supplierId ? { ...s, balance: s.balance - amount } : s
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
  };

  return (
    <AppDataContext.Provider value={{
      inventory, categories, customers, suppliers, invoices, purchases, notifications: currentNotifications, businessProfile,
      addInventoryItem, updateInventoryItem, deleteInventoryItem, addCategory, removeCategory,
      addCustomer, updateCustomer, deleteCustomer, addSupplier, updateSupplier, deleteSupplier, createInvoice, updateInvoice, deleteInvoice, createPurchase, recordCustomerPayment, recordSupplierPayment, markAllNotificationsRead, updateBusinessProfile
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
