import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useContext, useEffect, useState } from 'react';
// Removed theme persistence from AuthContext

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authInstance = auth();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        // Configure Google Sign-In
        GoogleSignin.configure({
          webClientId: '1013804877154-b1qmh4hc2e8kfpnsrqcma0dsj2g44c3n.apps.googleusercontent.com', // From Firebase console
        });

        // Listen to auth state changes
        const unsubscribe = authInstance.onAuthStateChanged(
            (firebaseUser: FirebaseAuthTypes.User | null) => {
              setUser(firebaseUser);
              setLoading(false);
            },
        );

        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
        return undefined;
      }
    }

    const maybeUnsubscribePromise = init();

    return () => {
      // Ensure we clean up the subscription when available.
      maybeUnsubscribePromise.then((maybeUnsubscribe) => {
        if (typeof maybeUnsubscribe === 'function') {
          maybeUnsubscribe();
        }
      });
    };
  }, []);

  // Safety fallback: never stay in "loading" forever.
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token found');
      }
      const googleCredential = auth.GoogleAuthProvider.credential(
        idToken,
        signInResult.data?.serverAuthCode ?? undefined,
      );
      await authInstance.signInWithCredential(googleCredential);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authInstance.signOut();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateDisplayName = async (name: string) => {
    if (!authInstance.currentUser) return;
    try {
      await authInstance.currentUser.updateProfile({ displayName: name });
      // Refresh local user state so UI and hooks see the new name.
      const refreshedUser = authInstance.currentUser;
      setUser(refreshedUser ? { ...refreshedUser } : null);
    } catch (error) {
      console.error('Update display name error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};