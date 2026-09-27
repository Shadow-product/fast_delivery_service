// js/admin.js
import { auth, db } from "./firestore.js";

import {
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
     doc,
     getDoc,
     collection,
     getDocs,
     updateDoc,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Переменные для UI
const adminPanel = document.querySelector("#main__admin-controls");
const usersContainer = document.querySelector("#admin__users-list");

// Функции
async function loadUsers() {

    try {

        const querySnapshot =
            await getDocs(
                collection(db, "users")
            );

        usersContainer.innerHTML = "";

        querySnapshot.forEach((userDoc) => {

            const userData = userDoc.data();

            const userCard =
                document.createElement("div");

            userCard.classList.add("admin-user-card");

            userCard.innerHTML = `
                <p>
                    <strong>Имя:</strong>
                    ${userData.name || "-"}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${userData.email || "-"}
                </p>

                <p>
                    <strong>Роль:</strong>
                    ${userData.role || "customer"}
                </p>

                <p>
                    <strong>Статус:</strong>
                    ${userData.isActive ? "Активен" : "Заблокирован"}
                </p>

                <button 
                 class="button__make-admin"
                 onclick="updateUserRole('${userDoc.id}', 'admin')"
                >
                    Сделать администратором
                </button>

                <button
                  class="button__make-customer"
                  onclick="updateUserRole('${userDoc.id}', 'customer')"
                >
                    Сделать клиентом
                </button>

                <button
                  class="button__block"
                  onclick="blockUser('${userDoc.id}')"
                >
                    Заблокировать
                </button>

                <button
                  class="button__unblock"
                  onclick="unblockUser('${userDoc.id}')"
                >
                  Разблокировать
                </button>
            `;

            usersContainer.appendChild(
                userCard
            );
        });

    } catch (error) {

        console.error(
            "Ошибка загрузки пользователей:",
            error
        );

        usersContainer.innerHTML =
            "Ошибка загрузки пользователей";
    }
}

async function updateUserRole(uid, role) {

    try {

        await updateDoc(
            doc(db, "users", uid),
            {
                role: role
            }
        );

        await loadUsers();

    } catch (error) {

        console.error(
            "Ошибка обновление роли:",
            error
        );
    }
}

async function blockUser(uid) {

    try {

        await updateDoc(
            doc(db, "users", uid),
            {
                isActive: false
            }
        );

        await loadUsers();

    } catch (error) {

        console.error(
            "Ошибка блокировки:",
            error
        );
    }
}

async function unblockUser(uid) {

    try {

        await updateDoc(
            doc(db, "users", uid),
            {
                isActive: true
            }
        );

        await loadUsers();

    } catch (error) {

        console.error(
            "Ошибка разблокировки:",
            error
        );
    }
}

window.updateUserRole = updateUserRole;
window.blockUser = blockUser;
window.unblockUser = unblockUser;

// Логика авторизации
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

    await loadUsers();
});