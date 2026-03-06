import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB_O7RUFnaYx_n3eJuQaTiMDdYHx99WDR4",
    authDomain: "rasagnaparttime.firebaseapp.com",
    projectId: "rasagnaparttime",
    storageBucket: "rasagnaparttime.firebasestorage.app",
    messagingSenderId: "1013804877154",
    // TODO: Add your Web App's appId from Firebase Console → Project Settings → Web Apps
    appId: "1:1013804877154:web:000000000000000000000000",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
