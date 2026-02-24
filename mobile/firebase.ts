// Import the functions you need from the SDKs you need
import { getAnalytics } from '@react-native-firebase/analytics';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import app from '@react-native-firebase/app';
export const auth = getAuth();
export const db = getFirestore();
export const analytics = getAnalytics();

export default app;