/* firestore.js */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

 const firebaseConfig = {
    apiKey: "AIzaSyB918IlhrUfhhavUY2boIRsmQyXso28FwU",
    authDomain: "fast-delivery-service-ac421.firebaseapp.com",
    projectId: "fast-delivery-service-ac421",
    storageBucket: "fast-delivery-service-ac421.firebasestorage.app",
    messagingSenderId: "610544275567",
    appId: "1:610544275567:web:67a425cdc79e03296a3d9a"
  };

// Инициализация Firebase (Firestore)
const app = initializeApp(firebaseConfig);

/* Объект аутенфикации */
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase инициализирован!");