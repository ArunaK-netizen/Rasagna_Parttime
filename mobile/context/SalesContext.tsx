import React, { createContext, useContext } from 'react';
import { useSalesData, Transaction } from '../hooks/useSalesData';

type SalesContextType = {
    transactions: Transaction[];
    loading: boolean;
    addTransaction: (t: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: React.ReactNode }) => {
    const salesData = useSalesData();
    return <SalesContext.Provider value={salesData}>{children}</SalesContext.Provider>;
};

export const useSales = () => {
    const context = useContext(SalesContext);
    if (!context) throw new Error('useSales must be used within SalesProvider');
    return context;
};
