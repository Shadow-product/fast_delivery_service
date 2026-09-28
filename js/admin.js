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
     addDoc,
     updateDoc,
     deleteDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Переменные для UI
const adminPanel = document.querySelector("#main__admin-controls");
const usersContainer = document.querySelector("#admin__users-list");
const menuContainer = document.querySelector("#admin__menu-list");
let editingMenuItemId = null;

// Users
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

// Menu
async function loadMenuItems() {

    try {

        const querySnapshot =
            await getDocs(
                collection(
                    db,
                    "menuItems"
                )
            );

        menuContainer.innerHTML = "";

        querySnapshot.forEach((menuDoc) => {

            const menuData =
                menuDoc.data();

            const menuCard =
                document.createElement(
                    "section"
                );

            menuCard.classList.add(
                "admin-menu-card"
            );

            menuCard.innerHTML = `

                <!-- Название -->
                <h4 class="admin-menu-title">
                    ${menuData.name || "-"}
                </h4>

                <!-- Фото -->
                ${
                    menuData.image &&
                    menuData.image.trim() !== ""

                    ? `
                        <img
                            class="p__admin-image"
                            src="${menuData.image}"
                            alt="${menuData.name || "Блюдо"}"
                    `

                : `
                    <div class="admin-image-empty">
                        Изображение отсутствует
                    </div>
                `
                }

                <!-- Описание -->
                <div class="admin-menu-description">
                    ${menuData.description || "Описание отсутствует"}
                </div>

                <!-- Основная информация -->
                <div class="admin-menu-info">

                <div>
                    <strong>Категория</strong>
                    <span>${menuData.category || "-"}</span>
                </div>

                <div>
                    <strong>Цена</strong>
                    <span>${menuData.price || 0} ₸</span>
                </div>

                <div>
                    <strong>Вес</strong>
                    <span>${menuData.weight || 0} г</span>
                </div>

                <div>
                    <strong>Готовка</strong>
                    <span>${menuData.cookingTime || 0} мин</span>
                </div>

                <div>
                    <strong>Рейтинг</strong>
                    <span>${menuData.rating || 0} ⭐</span>
                </div>

                <div>
                    <strong>Отзывы</strong>
                    <span>${menuData.reviewCount || 0} шт</span>
                </div>

                <div>
                    <strong>Наличие</strong>
                <span>
                    ${menuData.inStock ? "Да" : "Нет"}
                </span>
            </div>

        </div>

        <!-- Ингредиенты -->
        <div class="admin-menu-ingredients">

            <strong>Ингредиенты</strong>

            <ul>
                ${(menuData.ingredients || [])
                    .map(
                        i => `<li>${i}</li>`
                    )
                    .join("")
                }
            </ul>

        </div>

        <!-- Кнопки -->
        <div class="admin-menu-actions">

            <button
                class="button__edit-menu"
                onclick="editMenuItem('${menuDoc.id}')"
            >
                Редактировать
            </button>

            <button
                class="button__delete-menu"
                onclick="deleteMenuItem('${menuDoc.id}')"
            >
                Удалить
            </button>

        </div>
    `;

            menuContainer.appendChild(
                menuCard
            );
        });

    } catch (error) {

        console.error(
            "Ошибка загрузки меню:",
            error
        );

        menuContainer.innerHTML =
            "Ошибка загрузки меню";
    }
}

async function createMenuItem() {

    try {

        const name =
            document.querySelector(
                "#input__menu-name"
            ).value.trim();

        const description =
            document.querySelector(
                "#input__menu-description"
            ).value.trim();

        const category =
            document.querySelector(
                "#input__menu-category"
            ).value.trim();

        const image =
            document.querySelector(
                "#input__menu-image"
            ).value.trim();

        const ingredients =
            document.querySelector(
                "#input__menu-ingredients"
            ).value
            .split(",")

            .map(item => item.trim())

            .filter(item => item);

        const weight =
            Number(
                document.querySelector(
                    "#input__menu-weight"
                ).value
            );

        const rating =
            Number(
                document.querySelector(
                    "#input__menu-rating"
                ).value
            );

        const reviewCount =
            Number(
                document.querySelector(
                    "#input__menu-reviewCount"
                ).value
            );

        const cookingTime =
            Number(
                document.querySelector(
                    "#input__menu-cookingTime"
                ).value
            );

        const price =
            Number(
                document.querySelector(
                    "#input__menu-price"
                ).value
            );

        if (!name) {

            alert(
                "Введите название блюда"
            );

            return;
        }

        if (price <= 0) {

            alert(
                "Введите корректную цену"
            );

            return;
        }

        await addDoc(
            collection(
                db,
                "menuItems"
            ),
            {

                name,
                description,
                category,
                image,
                ingredients,
                weight,

                restaurantId:
                    "Fast Delivery Service",

                rating: rating || 0,

                reviewCount: reviewCount || 0,

                cookingTime,

                inStock: true,

                price,

                createdAt: new Date()
            }
        );

        // Очистка формы
        document.querySelector("#input__menu-name").value = "";
        document.querySelector("#input__menu-description").value = "";
        document.querySelector("#input__menu-category").value = "";
        document.querySelector("#input__menu-image").value = "";
        document.querySelector("#input__menu-ingredients").value = "";
        document.querySelector("#input__menu-weight").value = "";
        document.querySelector("#input__menu-rating").value = "";
        document.querySelector("#input__menu-reviewCount").value = "";
        document.querySelector("#input__menu-cookingTime").value = "";
        document.querySelector("#input__menu-price").value = "";

        await loadMenuItems();

    } catch (error) {

        console.error(
            "Ошибка добавления блюда:",
            error
        );
    }
}

// Функция заполнения формы
async function editMenuItem(id) {

    try {

        const menuDoc = await getDoc(
            doc(
                db,
                "menuItems",
                id
            )
        );

        if (!menuDoc.exists()) {
            return;
        }

        const data = menuDoc.data();

        editingMenuItemId = id;

        document.querySelector(
            "#input__menu-name"
        ).value = data.name || "";

        document.querySelector(
            "#input__menu-description"
        ).value = data.description || "";

        document.querySelector(
            "#input__menu-category"
        ).value = data.category || "";

        document.querySelector(
            "#input__menu-image"
        ).value = data.image || "";

        document.querySelector(
            "#input__menu-ingredients"
        ).value =
            (data.ingredients || [])
            .join(", ");

        document.querySelector(
            "#input__menu-weight"
        ).value = data.weight || "";

        document.querySelector(
            "#input__menu-rating"
        ).value = data.rating || "";

        document.querySelector(
            "#input__menu-reviewCount"
        ).value = data.reviewCount || "";

        document.querySelector(
            "#input__menu-cookingTime"
        ).value =
            data.cookingTime || "";

        document.querySelector(
            "#input__menu-price"
        ).value =
            data.price || "";

        document.querySelector(
            "#button__create-menu"
        ).textContent =
            "Сохранить изменения";

    } catch (error) {

        console.error(
            "Ошибка редактирования:",
            error
        );
    }
}

async function updateMenuItem() {

    try {

        const ingredients =
            document.querySelector(
                "#input__menu-ingredients"
            )
            .value
            .split(",")
            .map(item => item.trim())
            .filter(item => item);

        await updateDoc(
            doc(
                db,
                "menuItems",
                editingMenuItemId
            ),
            {
                name:
                    document.querySelector(
                        "#input__menu-name"
                    ).value.trim(),

                description:
                    document.querySelector(
                        "#input__menu-description"
                    ).value.trim(),

                category:
                    document.querySelector(
                        "#input__menu-category"
                    ).value.trim(),

                image:
                    document.querySelector(
                        "#input__menu-image"
                    ).value.trim(),

                ingredients,

                weight:
                    Number(
                        document.querySelector(
                            "#input__menu-weight"
                        ).value
                    ),

                rating:
                    Number(
                        document.querySelector(
                            "#input__menu-rating"
                        ).value
                    ),

                reviewCount:
                    Number(
                        document.querySelector(
                            "#input__menu-reviewCount"
                        ).value
                    ),

                cookingTime:
                    Number(
                        document.querySelector(
                            "#input__menu-cookingTime"
                        ).value
                    ),

                price:
                    Number(
                        document.querySelector(
                            "#input__menu-price"
                        ).value
                    )
            }
        );

        editingMenuItemId = null;

        document.querySelector(
            "#button__create-menu"
        ).textContent =
            "Добавить блюдо в меню";

        await loadMenuItems();

        resetMenuForm();

    } catch (error) {

        console.error(
            "Ошибка обновления блюда:",
            error
        );
    }
}

/* Очистка формы меню */
function resetMenuForm() {

    document.querySelector("#form__admin-menu")
    .reset();

    editingMenuItemId = null;

    document.querySelector(
        "#button__create-menu"
    ).textContent = 
        "Добавить блюдо в меню";

    document.querySelector(
        "#form__admin-menu"
    ).scrollIntoView({
        behavior: "smooth"
    });
}

async function deleteMenuItem(id) {

    try {

        await deleteDoc(
            doc(
                db,
                "menuItems",
                id
            )
        );

        await loadMenuItems();

    } catch (error) {

        console.error(
            "Ошибка удаления блюда:",
            error
        );
    }
}

// Кнопка "Добавить блюдо"
const createMenuBtn = document.querySelector("#button__create-menu");

if (createMenuBtn) {
    
    createMenuBtn.addEventListener(
        "click",
        async () => {

            if (editingMenuItemId) {

                await updateMenuItem();

            } else {
                await createMenuItem();
            }
        }
    );
}

// Доступ для onclick
window.deleteMenuItem =
    deleteMenuItem;

window.editMenuItem = 
    editMenuItem;

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
    await loadMenuItems();
});