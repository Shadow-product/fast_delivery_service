import { getMenuItems } from "./firestore.js";
import { addToCart } from "./cart.js";

const mainOutput = document.querySelector("#main__output");

document.addEventListener("click", e => {
  const btn = e.target.closest(".menu__item-add");
  if (btn) {
    const itemId = btn.dataset.id;
    const priceValue = Number(btn.dataset.price);

    if (isNaN(priceValue)) {
      console.error("Ошибка: цена не число", btn.dataset.price);
      alert("Ошибка: цена не указана корректно");
      return;
    }

    const itemData = {
      name: btn.dataset.name,
      price: priceValue,
      image: btn.dataset.image
    };
    addToCart(itemId, itemData);
  }
});

let lastVisible = null;
let firstVisible = null;
let pageStack = [];
let allItems = [];
let currentPageItems = [];

// Загрузка меню еды (коллекция menuItems Firebase)
export async function loadMenuItemsClient() {

    mainOutput.textContent =
      "Загрузка меню еды...";

    const snapshot = await getMenuItems(12); // загружаем все товары

    allItems = snapshot.docs;

    renderMenu(allItems);
}

/* Первая страница */
export async function loadFirstPage() { 

  mainOutput.textContent =
    "Загрузка меню еды...";

  const snapshot = await getMenuItems(2); // первая страница 2 блюда

  currentPageItems = snapshot.docs;

  renderMenu(currentPageItems);

  firstVisible = snapshot.docs[0];
  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  pageStack = [snapshot.docs];
}

/* Следующая страница */
export async function loadNextPage() {
  if(!lastVisible) {
    console.log("Нет данных для следующей страницы");
    return;
  }

  mainOutput.textContent =
    "Загрузка меню еды...";  

  const snapshot = await getMenuItems(2, lastVisible); // следующая страница 2 блюда

  if (snapshot.docs.length === 0) {
    console.log("Больше страниц нет");
    return;
  }

  allItems = snapshot.docs;
  renderMenu(snapshot.docs);

  firstVisible = snapshot.docs[0];
  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  pageStack.push(snapshot.docs);
}

/*
Можно доработать заменив методом
по предыдущей странице в Firestore
*/
export async function loadPrevPage() {
  if (pageStack.length < 2) {
    console.log("Нет предыдущей страницы");
    return; // нет предыдущей страницы
  } 

  // убираем текущую страницу
  pageStack.pop();
  const prevPage = pageStack[pageStack.length - 1];

  if (!prevPage || prevPage.length === 0) {
    console.log("Нет данных для предыдущей страницы");
    return;
  }

  mainOutput.textContent =
    "Загрузка меню еды...";

  allItems = prevPage;
  renderMenu(allItems);

  console.log("Загружена предыдущая страница, документов:", prevPage.length);

  /* обновляется при возврате */
  lastVisible = prevPage[prevPage.length - 1];
  firstVisible = prevPage[0];
}

/* Поиск */
export function searchItems(queryText) {
  const filtered = allItems.filter(item =>
    item.data().name.toLowerCase().includes(queryText.toLowerCase())
  );
  renderMenu(filtered);
}

/* Загрузка меню */
function renderMenu(items) {
   if (!mainOutput) {
     return;
   }

   try {
     if (!items || items.length === 0) {
      mainOutput.innerHTML = "<p>Нет данных для отображения</p>";
      return;
   }

  mainOutput.innerHTML = "";

  items.forEach(doc => {
    const data = doc.data();

    const safePrice = Number(data.price);
    const finalPrice = isNaN(safePrice) ? 0 : safePrice;

    const menuItemsSection = document.createElement("section");
    menuItemsSection.className = "menu__item";
    menuItemsSection.style.textAlign = "center";
    menuItemsSection.style.padding = "15px";
    menuItemsSection.style.margin = "15px 0";
    menuItemsSection.style.border = "1px solid #ddd";
    menuItemsSection.style.borderRadius = "5px";

    // Базовая информация
    menuItemsSection.innerHTML = `
        <h3 class="menu__item-h3"><strong>Название:</strong> ${data.name || "Без названия"}</h3>
        <p class="menu__item-desc"><strong>Описание:</strong> ${data.description}</p>
        <p class="menu__item-category"><strong>Категория:</strong> ${data.category || "отсутствует категория"}</p>
        <img class="menu__item-img" src="${data.image}" alt="${data.name}">
        <p class="menu__item-price"><strong>Цена:</strong> ${finalPrice} ₸</p>
        <p class="menu__item-ingredients"><strong>Ингредиенты:</strong></p><ul style="list-style: none; padding-left: 0; margin: 5px 0;"> ${data.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
        <p class="menu__item-weight"><strong>Вес:</strong> ${data.weight} г</p>
        <p class="menu__item-restaurantid"><strong>Сервис доставки еды:</strong> ${data.restaurantId || "не указан"}</p>
        <p class="menu__item-rating"><strong>Рейтинг:</strong> ${data.rating} ⭐</p>
        <p class="menu__item-reviewcount"><strong>Количество отзывов:</strong> ${data.reviewCount} шт</p>
        <p class="menu__item-cookingtime"><strong>Время готовки:</strong> ${data.cookingTime} минут</p>
        <p class="menu__item-instock"><strong>В наличии:</strong> ${data.inStock ? "Да" : "Нет"}</p>
        <button class="menu__item-add"
            data-id="${doc.id}"
            data-name="${data.name}"
            data-price="${finalPrice}"
            data-image="${data.image}">
          Добавить в корзину
        </button>
      `;
    mainOutput.appendChild(menuItemsSection);
  });

  console.log("Отрисовано блюд:", items.length);
} catch (errorMenuItems) {
    console.error("Ошибка при отрисовке меню:", errorMenuItems);
    mainOutput.innerHTML = `<p>Ошибка загрузки меню</p>`
  }
}