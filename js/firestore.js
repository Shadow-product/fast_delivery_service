/* firestore.js */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } 
  from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

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

export async function getMenuItems(limitCount = 6, lastDoc = null) {
  let q = query(collection(db, "menuItems"), orderBy("name"), limit(limitCount));
  if (lastDoc) {
    q = query(collection(db, "menuItems"), orderBy("name"), startAfter(lastDoc), limit(limitCount));
  }
  return await getDocs(q);
}

console.log("Firebase инициализирован!");