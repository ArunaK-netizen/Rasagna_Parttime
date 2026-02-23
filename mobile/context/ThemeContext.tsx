import { doc, onSnapshot, setDoc } from '@react-native-firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
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
        if (user) {
            loadTheme();
        } else {
            setColorScheme('light');
            setIsLoading(false);
        }
    }, [user]);

    const loadTheme = () => {
        if (!user) return;

        const themeDoc = doc(db, 'userPreferences', user.uid);
        const unsubscribe = onSnapshot(themeDoc, (doc) => {
            if (doc.exists) {
                const data = doc.data();
                setColorScheme(data.theme || 'light');
            } else {
                setColorScheme('light');
            }
            setIsLoading(false);
        });

        return unsubscribe;
    };

    const toggleColorScheme = async () => {
        if (!user) return;

        const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(newScheme);

        try {
            await setDoc(doc(db, 'userPreferences', user.uid), { theme: newScheme }, { merge: true });
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
