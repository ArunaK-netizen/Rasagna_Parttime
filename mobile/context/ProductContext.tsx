import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from '@react-native-firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants/Products';
import { db } from '../firebase';
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
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    deleteProduct: (productId: string, category: string) => Promise<void>;
    updateProduct: (product: Product, oldCategory: string) => Promise<void>;
    loading: boolean;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Record<string, Product[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadProducts();
        } else {
            setProducts({});
            setLoading(false);
        }
    }, [user]);

    const loadProducts = () => {
        if (!user) return;

        const q = query(
            collection(db, 'products'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData: Record<string, Product[]> = {};
            querySnapshot.forEach((doc) => {
                const product = { id: doc.id, ...doc.data() } as Product;
                if (!productsData[product.category]) {
                    productsData[product.category] = [];
                }
                productsData[product.category].push(product);
            });

            // If no products, initialize with default products
            if (Object.keys(productsData).length === 0) {
                initializeDefaultProducts();
            } else {
                setProducts(productsData);
                setLoading(false);
            }
        });

        return unsubscribe;
    };

    const initializeDefaultProducts = async () => {
        if (!user) return;

        const defaultProducts: Omit<Product, 'id'>[] = [];
        Object.entries(INITIAL_PRODUCTS).forEach(([category, items]) => {
            items.forEach((item) => {
                defaultProducts.push({
                    ...item,
                    category,
                    userId: user.uid,
                });
            });
        });

        const batch = [];
        for (const product of defaultProducts) {
            batch.push(addDoc(collection(db, 'products'), product));
        }

        await Promise.all(batch);
        // The onSnapshot will update the state
    };

    const addProduct = async (product: Omit<Product, 'id'>) => {
        if (!user) return;

        await addDoc(collection(db, 'products'), { ...product, userId: user.uid });
    };

    const deleteProduct = async (productId: string, category: string) => {
        await deleteDoc(doc(db, 'products', productId));
    };

    const updateProduct = async (updatedProduct: Product, oldCategory: string) => {
        const { id, ...data } = updatedProduct;
        await updateDoc(doc(db, 'products', id), { ...data, userId: user.uid });
    };

    const categories = Object.keys(products);

    return (
        <ProductContext.Provider value={{ products, categories, addProduct, deleteProduct, updateProduct, loading }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within ProductProvider');
    return context;
};
