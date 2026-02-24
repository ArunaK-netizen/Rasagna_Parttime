import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS, loadData, saveData } from '../utils/storage';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    colorScheme: Theme;
    toggleColorScheme: () => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [colorScheme, setColorScheme] = useState<Theme>('light');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await loadThemeFromStorage();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Only use AsyncStorage for theme
    const loadThemeFromStorage = async () => {
        const storedTheme = await loadData(STORAGE_KEYS.THEME);
        setColorScheme(storedTheme === 'dark' ? 'dark' : 'light');
        setIsLoading(false);
    };

    // Toggle theme and persist to AsyncStorage only
    const toggleColorScheme = async () => {
        const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(newScheme);
        await saveData(STORAGE_KEYS.THEME, newScheme);
    };

    return (
        <ThemeContext.Provider value={{ colorScheme, toggleColorScheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}
