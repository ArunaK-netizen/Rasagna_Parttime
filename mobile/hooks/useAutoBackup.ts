import { useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { useSales } from '../context/SalesContext';
import { BackupService } from '../utils/backupService';

export const useAutoBackup = () => {
    const { products } = useProducts();
    const { transactions } = useSales();

    // We use a ref to track if it's the initial mount to avoid backing up empty state immediately
    // or to handle the case where data is loading.
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const backupData = {
                version: 1,
                timestamp: Date.now(),
                products,
                transactions,
            };
            BackupService.saveBackup(backupData);
        }, 2000); // Debounce backup for 2 seconds

        return () => clearTimeout(timer);
    }, [products, transactions]);
};
