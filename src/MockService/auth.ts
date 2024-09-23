import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import dotenv from 'dotenv'
dotenv.config()
// Otras importaciones que necesites

const firebaseConfig = {
  apiKey: process.env.API_KEY_FIREBASE,
  authDomain: "sistema-kinefit.firebaseapp.com",
  projectId: process.env.PROJECT_ID,
  storageBucket: "sistema-kinefit.appspot.com",
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);  // Ejemplo para la autenticación