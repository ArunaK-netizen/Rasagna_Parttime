import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants/Products';

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
    loading: boolean;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = '@parttime_products';

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    // Transform initial products to match Product type
    const transformedInitialProducts: Record<string, Product[]> = Object.entries(INITIAL_PRODUCTS).reduce((acc, [category, items]) => {
        acc[category] = items.map((item, index) => ({
            ...item,
            id: `${category}-${index}`,
            category: category
        }));
        return acc;
    }, {} as Record<string, Product[]>);

    const [products, setProducts] = useState<Record<string, Product[]>>(transformedInitialProducts);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Record<string, Product[]>;

                // Migrate stored prices to match current `INITIAL_PRODUCTS` list by name/category.
                const migrated: Record<string, Product[]> = {};

                Object.entries(parsed).forEach(([category, items]) => {
                    // Find the initial products for this category (if any)
                    const initialForCategory = (INITIAL_PRODUCTS as Record<string, { name: string; price: number }[]>)[category];

                    migrated[category] = items.map(item => {
                        if (initialForCategory) {
                            const match = initialForCategory.find(p => p.name === item.name);
                            if (match) {
                                // Keep id and other fields, but update price to the current initial value
                                return { ...item, price: match.price };
                            }
                        }
                        return item;
                    });
                });

                setProducts(migrated);
                // Persist migrated data so subsequent runs use the corrected prices
                await saveProducts(migrated);
            }
        } catch (e) {
            console.error('Failed to load products', e);
        } finally {
            setLoading(false);
        }
    };

    const saveProducts = async (newProducts: Record<string, Product[]>) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        } catch (e) {
            console.error('Failed to save products', e);
        }
    };

    const addProduct = async (product: Omit<Product, 'id'>) => {
        const newProduct = { ...product, id: Date.now().toString() };
        const category = product.category;

        const updatedProducts = { ...products };
        if (!updatedProducts[category]) {
            updatedProducts[category] = [];
        }

        updatedProducts[category] = [...updatedProducts[category], newProduct];

        setProducts(updatedProducts);
        await saveProducts(updatedProducts);
    };

    const deleteProduct = async (productId: string, category: string) => {
        const updatedProducts = { ...products };
        if (updatedProducts[category]) {
            updatedProducts[category] = updatedProducts[category].filter(p => p.id !== productId);
            if (updatedProducts[category].length === 0) {
                delete updatedProducts[category];
            }
            setProducts(updatedProducts);
            await saveProducts(updatedProducts);
        }
    };

    const categories = Object.keys(products);

    return (
        <ProductContext.Provider value={{ products, categories, addProduct, deleteProduct, loading }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within ProductProvider');
    return context;
};
