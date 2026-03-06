import React, { createContext, useContext, useEffect, useState } from 'react';
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
    const colorScheme: Theme = 'dark';
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Theme is strictly dark, no loading from storage needed
        setIsLoading(false);
    }, [user]);

    // toggleColorScheme is a no-op
    const toggleColorScheme = async () => { };

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
