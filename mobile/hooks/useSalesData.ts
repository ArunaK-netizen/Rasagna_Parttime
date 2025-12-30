import { useState, useEffect } from 'react';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

export type TransactionItem = {
    id: string;
    productName: string;
    category: string;
    price: number;
    quantity: number;
};

export type Transaction = {
    id: string;
    date: string; // YYYY-MM-DD
    timestamp: number;
    items: TransactionItem[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'upi';
    tip: number;
    // Legacy fields for backward compatibility (optional)
    productName?: string;
    category?: string;
    price?: number;
    quantity?: number;
};

export const useSalesData = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [cart, setCart] = useState<TransactionItem[]>([]);
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

    const addToCart = (item: Omit<TransactionItem, 'id'>) => {
        const newItem = { ...item, id: Date.now().toString() };
        setCart(prev => [...prev, newItem]);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };
        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        await saveData(STORAGE_KEYS.TRANSACTIONS, updated);
        clearCart(); // Clear cart after successful transaction
    };

    const deleteTransaction = async (id: string) => {
        const updated = transactions.filter(t => t.id !== id);
        setTransactions(updated);
        await saveData(STORAGE_KEYS.TRANSACTIONS, updated);
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        const updated = transactions.map(t =>
            t.id === updatedTransaction.id ? updatedTransaction : t
        );
        setTransactions(updated);
        await saveData(STORAGE_KEYS.TRANSACTIONS, updated);
    };

    return {
        transactions,
        loading,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        cart,
        addToCart,
        removeFromCart,
        clearCart
    };
};
