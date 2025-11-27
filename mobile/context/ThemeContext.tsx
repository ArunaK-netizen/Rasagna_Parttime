import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    colorScheme: Theme;
    toggleColorScheme: () => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [colorScheme, setColorScheme] = useState<Theme>('light');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setColorScheme(savedTheme);
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleColorScheme = async () => {
        const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(newScheme);
        try {
            await AsyncStorage.setItem(THEME_KEY, newScheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
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
