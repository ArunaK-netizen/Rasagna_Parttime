'use client';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue flex items-center justify-center pulse-blue">
                        <span className="text-white font-bold text-lg">PT</span>
                    </div>
                    <div className="w-6 h-6 border-2 border-surface3 border-t-blue rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto bg-background">
                <div className="pt-14 lg:pt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
