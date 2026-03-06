'use client';
import { getAdminEmails } from '@/lib/db';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signIn: () => Promise<void>;
    logout: () => Promise<void>;
    unauthorized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Check if this user's email is in admin list
                try {
                    const adminEmails = await getAdminEmails();
                    const email = firebaseUser.email?.toLowerCase() ?? '';
                    if (adminEmails.length === 0 || adminEmails.map(e => e.toLowerCase()).includes(email)) {
                        // If no admin emails configured yet, allow any signed-in user (setup mode)
                        setUser(firebaseUser);
                        setIsAdmin(true);
                        setUnauthorized(false);
                    } else {
                        setUnauthorized(true);
                        setIsAdmin(false);
                        setUser(null);
                        await signOut(auth);
                    }
                } catch {
                    // If we can't read admin config (e.g. permissions not set up), allow first login
                    setUser(firebaseUser);
                    setIsAdmin(true);
                    setUnauthorized(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setUnauthorized(false);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const signIn = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (e) {
            setLoading(false);
            throw e;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, signIn, logout, unauthorized }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
