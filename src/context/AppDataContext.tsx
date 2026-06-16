import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

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
  const [categories, setCategories] = useState<string[]>([
    "فلاتر", "فرامل", "كهرباء", "زيوت", "إطارات", "عادم", "تعليق", "أخرى", "ماستر"
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', code: '34476290', name: 'زيت فرامل باندكس', brand: 'فرنسي', compatibleCars: 'كل', category: 'فرامل', storageLocation: 'غير محدد', quantity: 26, purchasePrice: 115, sellPrice: 135 },
    { id: '2', code: '92369861', name: 'فلتر 512', brand: 'مستورد', compatibleCars: 'دبابة', category: 'فلاتر', storageLocation: 'غير محدد', quantity: 29, purchasePrice: 95, sellPrice: 125 },
  ]);
  
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', serialNumber: 'CUST-1001', name: 'أحمد سعيد', phone: '010000000', balance: 0 },
  ]);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'شركة التوريدات العالمية', phone: '011111111', balance: 0 },
  ]);
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n1', message: 'مرحباً بك في النظام الجديد!', date: new Date().toISOString(), read: false }
  ]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: 'AutoServ Pro',
    phone: '01000000000',
    address: 'القاهرة، شارع التسعين',
    logo: null
  });

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
    setInventory(prev => [...prev, { ...item, id: Date.now().toString() }]);
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
    setCustomers(prev => [
      ...prev, 
      { 
        ...customer, 
        id: Date.now().toString(),
        serialNumber: `CUST-${1000 + prev.length + 1}`
      }
    ]);
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: Date.now().toString() }]);
  };

  const createInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: `INV-${1000 + invoices.length + 1}`
    };
    
    // Update Inventory
    setInventory(prev => prev.map(item => {
      const soldItem = invoice.items.find(i => i.itemId === item.id);
      if (soldItem) {
        return { ...item, quantity: item.quantity - soldItem.quantity };
      }
      return item;
    }));

    // Update Customer Balance
    const remaining = invoice.total - invoice.paid;
    if (remaining !== 0) {
      setCustomers(prev => prev.map(c => 
        c.id === invoice.customerId ? { ...c, balance: c.balance + remaining } : c
      ));
    }

    setInvoices(prev => [newInvoice, ...prev]);
  };

  const updateInvoice = (id: string, invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        // Revert old inventory
        setInventory(currentInventory => currentInventory.map(item => {
          const oldSoldItem = inv.items.find(i => i.itemId === item.id);
          const newSoldItem = invoice.items.find(i => i.itemId === item.id);
          let newQuantity = item.quantity;
          if (oldSoldItem) newQuantity += oldSoldItem.quantity; // revert old
          if (newSoldItem) newQuantity -= newSoldItem.quantity; // apply new
          return { ...item, quantity: newQuantity };
        }));

        // Revert old customer balance
        const oldRemaining = inv.total - inv.paid;
        const newRemaining = invoice.total - invoice.paid;
        
        setCustomers(currentCustomers => currentCustomers.map(c => {
          if (c.id === inv.customerId && c.id === invoice.customerId) {
            return { ...c, balance: c.balance - oldRemaining + newRemaining };
          } else if (c.id === inv.customerId) {
            return { ...c, balance: c.balance - oldRemaining };
          } else if (c.id === invoice.customerId) {
            return { ...c, balance: c.balance + newRemaining };
          }
          return c;
        }));

        return { ...inv, ...invoice };
      }
      return inv;
    }));
  };

  const deleteInvoice = (id: string) => {
    // Find the invoice first
    const invToDelete = invoices.find(inv => inv.id === id);
    if (!invToDelete) return;

    // Revert inventory
    setInventory(currentInventory => currentInventory.map(item => {
      const oldSoldItem = invToDelete.items.find(i => i.itemId === item.id);
      if (oldSoldItem) {
        return { ...item, quantity: item.quantity + oldSoldItem.quantity };
      }
      return item;
    }));

    // Revert customer balance
    const remaining = invToDelete.total - invToDelete.paid;
    if (remaining !== 0) {
      setCustomers(currentCustomers => currentCustomers.map(c => 
        c.id === invToDelete.customerId ? { ...c, balance: c.balance - remaining } : c
      ));
    }

    // Now remove from invoices
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const createPurchase = (purchase: Omit<PurchaseOrder, 'id'>) => {
    const newPurchase: PurchaseOrder = {
      ...purchase,
      id: Date.now().toString()
    };
    
    // Update Inventory
    setInventory(prev => prev.map(item => {
      const boughtItem = purchase.items.find(i => i.itemId === item.id);
      if (boughtItem) {
        return { ...item, quantity: item.quantity + boughtItem.quantity };
      }
      return item;
    }));

    // Update Supplier Balance
    const remaining = purchase.total - purchase.paid;
    if (remaining !== 0) {
      setSuppliers(prev => prev.map(s => 
        s.id === purchase.supplierId ? { ...s, balance: s.balance + remaining } : s
      ));
    }

    setPurchases(prev => [newPurchase, ...prev]);
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
