import { useState, useEffect } from 'react';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

export type Transaction = {
    id: string;
    date: string; // YYYY-MM-DD
    timestamp: number;
    productName: string;
    category: string;
    price: number;
    quantity: number;
    paymentMethod: 'cash' | 'card' | 'upi';
    tip: number;
};

export const useSalesData = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        const data = await loadData(STORAGE_KEYS.TRANSACTIONS);
        if (data) {
            setTransactions(data);
        }
        setLoading(false);
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };
        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        await saveData(STORAGE_KEYS.TRANSACTIONS, updated);
    };

    const deleteTransaction = async (id: string) => {
        const updated = transactions.filter(t => t.id !== id);
        setTransactions(updated);
        await saveData(STORAGE_KEYS.TRANSACTIONS, updated);
    };

    return { transactions, loading, addTransaction, deleteTransaction };
};
