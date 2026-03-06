'use client';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
    const { signIn, loading, unauthorized } = useAuth();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        try {
            setSigningIn(true);
            setError('');
            await signIn();
        } catch (e: unknown) {
            setError('Sign-in failed. Please try again.');
            console.error(e);
        } finally {
            setSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-purple/10 rounded-full blur-3xl pointer-events-none" />

            <div className="glass-card w-full max-w-md p-8 fade-in relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue flex items-center justify-center mb-4 pulse-blue shadow-lg shadow-blue/30">
                        <span className="text-white font-bold text-2xl">PT</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">PartTime Admin</h1>
                    <p className="text-textSecondary text-sm mt-1">Sign in to manage your team</p>
                </div>

                {/* Divider */}
                <div className="border-t border-border mb-8" />

                {/* Stats preview */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'Employees', emoji: '👥' },
                        { label: 'Sales Data', emoji: '📊' },
                        { label: 'Products', emoji: '📦' },
                    ].map(({ label, emoji }) => (
                        <div key={label} className="bg-surface2 rounded-xl p-3 text-center">
                            <p className="text-2xl mb-1">{emoji}</p>
                            <p className="text-textSecondary text-xs font-medium">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Errors */}
                {unauthorized && (
                    <div className="bg-red/10 border border-red/30 rounded-xl p-3 mb-4">
                        <p className="text-red text-sm text-center font-medium">
                            ⛔ Access denied. Your account is not authorized as an admin.
                        </p>
                    </div>
                )}
                {error && (
                    <div className="bg-red/10 border border-red/30 rounded-xl p-3 mb-4">
                        <p className="text-red text-sm text-center font-medium">{error}</p>
                    </div>
                )}

                {/* Sign In Button */}
                <button
                    onClick={handleSignIn}
                    disabled={signingIn || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {signingIn ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                    ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    {signingIn ? 'Signing in...' : 'Continue with Google'}
                </button>

                <p className="text-textTertiary text-xs text-center mt-4">
                    Admin access only. Unauthorized sign-ins will be rejected.
                </p>
            </div>
        </div>
    );
}
