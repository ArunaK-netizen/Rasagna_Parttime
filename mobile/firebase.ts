import firestore from '@react-native-firebase/firestore';

// Lazily access native Firebase from React Native runtime only.
// Avoid calling any native Firebase APIs at module top level so that
// static rendering / export (Node environment) does not crash.

export const getDb = () => {
  return firestore();
};

export default {
  getDb,
};