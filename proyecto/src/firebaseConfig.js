import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCaHLPIgtJ3m-XH5BwvdCvYlzrC-kRhtW8",
  authDomain: "digimonapinosql.firebaseapp.com",
  projectId: "digimonapinosql",
  storageBucket: "digimonapinosql.firebasestorage.app",
  messagingSenderId: "580479114925",
  appId: "1:580479114925:web:e3586d75658d82f55c3024",
  measurementId: "G-85GRGKYPS7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ ¡Esto es necesario!

export { auth, db };