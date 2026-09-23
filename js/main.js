// js/main.js
import {
    loadMenuItemsClient,
    loadFirstPage,
    loadNextPage,
    loadPrevPage,
    searchItems,
} from "./catalog.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Страница загружена");
  await loadMenuItemsClient(); // загружаются все товары в allItems
  loadFirstPage(); // показывается первую страницу (2 блюда)

  document.querySelector("#button__next-page").addEventListener("click",
    loadNextPage); // кнопка "следующая страница"
  document.querySelector("#button__prev-page").addEventListener("click",
    loadPrevPage); // кнопка "предыдущая страница"

  const searchInput = document.querySelector(".input__search");

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // отмена стандартного поведения
      searchItems(searchInput.value); // поиск по ввёденному тексту
    }
  });
});