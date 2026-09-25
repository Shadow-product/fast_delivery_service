// js/admin.js
import { auth, db } from "./firestore.js";

import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
     doc,
     getDoc,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Переменные для UI
const adminPanel = document.querySelector("#main__admin-controls");

onAuthStateChanged(auth, async (user)=> {
   
    if (!user) {
        window.location.href = "pages/auth.html";
        return;
    }

    const userDoc = await getDoc(
        doc(db, "users", user.uid)
    );

    if (!userDoc.exists()) {
        window.location.href = "../index.html";
        return;
    }

    const userData = userDoc.data();

    if (userData.role !== "admin") {
        alert("Доступ запрещён");
        window.location.href = "../index.html";
        return;
    }

    adminPanel.classList.remove("hidden");
});