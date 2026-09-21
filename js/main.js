// js/main.js
import {
     collection,
     getDocs,

 } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import {
    db
} from "./firestore.js";

/* Переменные для UI */
const mainOutput = document.querySelector(".main__output");

// Загрузка меню еды (коллекция menuItems Firebase)
export async function loadMenuItems() {
    if (mainOutput) {
        mainOutput.innerHTML = "Загрузка меню еды...";

    try {
        const snapshot = await getDocs(collection(db, "menuItems"));
        mainOutput.innerHTML = "";

        if (snapshot.empty) {
            mainOutput.innerHTML = "<p>Меню еды не найдены</p>"
            return;
        }

    snapshot.forEach((doc) => {
        const data = doc.data();

        // Создаётся блок меню еды
        const menuItemsDiv = document.createElement("div");
        menuItemsDiv.className = "menu__item";
        menuItemsDiv.style.textAlign = "center";
        menuItemsDiv.style.padding = "15px";
        menuItemsDiv.style.margin = "15px 0";
        menuItemsDiv.style.border = "1px solid #ddd";
        menuItemsDiv.style.borderRadius = "5px";

        // Базовая информация 
        menuItemsDiv.innerHTML = `
                <h3 class="menu__item-h3"><strong>Название:</strong> ${data.name || "Без названия"}</h3>
                <p class="menu__item-desc"><strong>Описание:</strong> ${data.description}</p>
                <p class="menu__item-category"><strong>Категория:</strong> ${data.category || "отсутствует категория"}</p>
                <img class="menu__item-img" src="${data.image}" alt="${data.name}">
                <p class="menu__item-ingredients"><strong>Ингредиенты:</strong></p><ul style="list-style: none; padding-left: 0; margin: 5px 0;"> ${data.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
                <p class="menu__item-weight"><strong>Вес:</strong> ${data.weight} г</p>
                <p class="menu__item-restaurantid"><strong>Сервис доставки еды:</strong> ${data.restaurantId || "не указан"}</p>
                <p class="menu__item-rating"><strong>Рейтинг:</strong> ${data.rating} ⭐</p>
                <p class="menu__item-reviewcount"><strong>Количество отзывов:</strong> ${data.reviewCount} шт</p>
                <p class="menu__item-cookingtime"><strong>Время готовки:</strong> ${data.cookingTime} минут</p>
                <p class="menu__item-instock"><strong>В наличии:</strong> ${data.inStock ? "Да" : "Нет"}</p>
            `;

            mainOutput.appendChild(menuItemsDiv);
            }); 
        } catch(errorMenuItems) {
            console.error("Ошибка загрузки меню еды:", errorMenuItems);
            mainOutput.innerHTML = 
                `<p>Ошибка загрузки меню еды</p>`
        }
    }
}

// Загрузка меню еды при старте
document.addEventListener("DOMContentLoaded", () => {
    console.log("Страница загружена");
    loadMenuItems();
});