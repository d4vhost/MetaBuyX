// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIHhroG8jFwKFkmtg76p1GxxIsh1tEDUM",
  authDomain: "metabuyx.firebaseapp.com",
  projectId: "metabuyx",
  storageBucket: "metabuyx.firebasestorage.app",
  messagingSenderId: "514195091382",
  appId: "1:514195091382:web:3d9615ad94027b8224db17",
  measurementId: "G-LXL2M6HBN0",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar auth y firestore para usar en toda la app
export const auth = getAuth(app);
export const db = getFirestore(app);