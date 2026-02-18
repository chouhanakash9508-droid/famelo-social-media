import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-Andp1WhNohvaGo06A7IRfRBtMQJkPPI",
  authDomain: "famelosocialmedia.firebaseapp.com",
  projectId: "famelosocialmedia",
  messagingSenderId: "823373759346",
  appId: "1:823373759346:web:693bbc51713cec542a93eb",
  measurementId: "G-808ZH2LQ1W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;