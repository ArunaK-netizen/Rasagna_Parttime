import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  collection, doc, getDoc, onSnapshot, query,
  setDoc, where
} from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDb } from '../firebase';

export type AccessStatus = 'checking' | 'pending' | 'approved' | 'rejected';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  accessStatus: AccessStatus;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authInstance = auth();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('checking');

  useEffect(() => {
    async function init() {
      try {
        GoogleSignin.configure({
          webClientId: '1013804877154-b1qmh4hc2e8kfpnsrqcma0dsj2g44c3n.apps.googleusercontent.com',
        });

        const unsubscribeAuth = authInstance.onAuthStateChanged(
          (firebaseUser: FirebaseAuthTypes.User | null) => {
            setUser(firebaseUser);
            if (!firebaseUser) {
              setAccessStatus('checking');
              setLoading(false);
            }
            // When user exists, access status is resolved by the
            // subscribeAccessStatus effect below
          },
        );

        return unsubscribeAuth;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
        return undefined;
      }
    }

    const maybeUnsubscribePromise = init();
    return () => {
      maybeUnsubscribePromise.then((maybeUnsubscribe) => {
        if (typeof maybeUnsubscribe === 'function') maybeUnsubscribe();
      });
    };
  }, []);

  // Safety fallback: never stay in "loading" forever.
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(timeout);
  }, [loading]);

  // ── Access status subscription ───────────────────────────────────────────
  // Whenever user changes, check admin_users (fast path) then subscribe to
  // their access_request document for live status updates.
  useEffect(() => {
    if (!user) return;

    const db = getDb();
    let unsubRequest: (() => void) | undefined;

    async function resolveAccess() {
      if (!user) return;

      setLoading(true);
      setAccessStatus('checking');

      // 1. Fast path: already in admin_users (approved)
      const adminQ = query(
        collection(db, 'admin_users'),
        where('uid', '==', user.uid),
      );
      const adminSnap = await adminQ.get().catch(() => null);
      if (adminSnap && !adminSnap.empty) {
        setAccessStatus('approved');
        setLoading(false);
        return;
      }

      // 2. Create or fetch their access_request document (keyed by uid)
      const reqRef = doc(db, 'access_requests', user.uid);
      const existing = await getDoc(reqRef).catch(() => null);
      if (!existing || !existing.exists) {
        // First time: create a pending request
        await setDoc(reqRef, {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || user.email || 'Unknown',
          photoURL: user.photoURL || '',
          requestedAt: Date.now(),
          status: 'pending',
        }).catch(console.error);
      }

      // 3. Subscribe to the document for live updates (approved or rejected)
      unsubRequest = onSnapshot(reqRef, (snap) => {
        const data = snap.data();
        if (!data) return;
        const status = data.status as AccessStatus;
        setAccessStatus(status);
        setLoading(false);
      }, () => {
        setAccessStatus('pending');
        setLoading(false);
      });
    }

    resolveAccess();
    return () => { if (unsubRequest) unsubRequest(); };
  }, [user?.uid]);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) throw new Error('No ID token found');
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
      setAccessStatus('checking');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateDisplayName = async (name: string) => {
    if (!authInstance.currentUser) return;
    try {
      await authInstance.currentUser.updateProfile({ displayName: name });
      const refreshedUser = authInstance.currentUser;
      setUser(refreshedUser ? { ...refreshedUser } : null);
    } catch (error) {
      console.error('Update display name error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessStatus, signInWithGoogle, logout, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};