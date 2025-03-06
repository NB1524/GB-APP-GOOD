import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6kov3lrnVLpcyW-92UAshTqnczCzOkRM",
  authDomain: "cursor-fit-app.firebaseapp.com",
  projectId: "cursor-fit-app",
  storageBucket: "cursor-fit-app.firebasestorage.app",
  messagingSenderId: "429983420843",
  appId: "1:429983420843:web:69efcf71dde378839c82ee"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 