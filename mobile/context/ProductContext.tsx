import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot, query, where } from '@react-native-firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDb } from '../firebase';
import { useAuth } from './AuthContext';

export type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
};

type ProductContextType = {
    products: Record<string, Product[]>;
    categories: string[];
    loading: boolean;
};


const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Record<string, Product[]>>({});
    const [loading, setLoading] = useState(true);

    // Key for AsyncStorage (per user to avoid leaking old cache)
    const PRODUCTS_CACHE_KEY = user ? `products_cache_${user.uid}` : 'products_cache';

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (user) {
            loadProductsWithCache().then((unsub) => {
                unsubscribe = unsub;
            });
        } else {
            setProducts({});
            setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    // Load from cache first, then Firestore
    const loadProductsWithCache = async () => {
        if (!user) {
            setProducts({});
            setLoading(false);
            return;
        }

        setLoading(true);
        // Try to load from cache (per-user)
        try {
            const cached = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
            if (cached) {
                setProducts(JSON.parse(cached));
                setLoading(false);
            }
        } catch (e) {
            // Ignore cache errors
        }
        // Always listen to Firestore for updates
        return loadProductsFromFirestore();
    };

    const loadProductsFromFirestore = () => {
        if (!user) return () => {};

        const db = getDb();
        // Scope products to the current user for scalability
        const q = query(
            collection(db, 'products'),
            where('userId', '==', user.uid),
        );
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const productsData: Record<string, Product[]> = {};
            querySnapshot.forEach((doc) => {
                const product = { id: doc.id, ...doc.data() } as Product;
                if (!productsData[product.category]) {
                    productsData[product.category] = [];
                }
                productsData[product.category].push(product);
            });
            setProducts(productsData);
            // Update cache
            try {
                await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(productsData));
            } catch (e) {}
            setLoading(false);
        });
        return unsubscribe;
    };



    const categories = Object.keys(products);

    return (
        <ProductContext.Provider value={{ products, categories, loading }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within ProductProvider');
    return context;
};
