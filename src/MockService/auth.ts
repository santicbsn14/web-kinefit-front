import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Otras importaciones que necesites

const firebaseConfig = {
  apiKey: "AIzaSyDwm80-j49n5yaqBczTcLvnbaZxXnwv3GY",
  authDomain: "sistema-kinefit.firebaseapp.com",
  projectId: "sistema-kinefit",
  storageBucket: "sistema-kinefit.appspot.com",
  messagingSenderId: "761072580640",
  appId: "1:761072580640:web:a4d5d9adb4e2e643716445"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);  // Ejemplo para la autenticación