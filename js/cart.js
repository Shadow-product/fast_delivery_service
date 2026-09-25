import { db } from "./firestore.js";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Добавление меню (блюда) в корзину
export async function addToCart(itemId, itemData) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Сначала войдите в систему!");
    return;
  }

  await addDoc(collection(db, "cartItems"), {
    userId: user.uid,            // UID авторизованного пользователя
    productId: itemId,           // id блюда
    productName: itemData.name,  // название блюда
    price: itemData.price,       // цена
    image: itemData.image || "",
    quantity: 1,
    addedAt: serverTimestamp()
  });

  alert("Товар добавлен в корзину!");
}

// Загрузка корзины
async function loadCart(userId) {
  
  const cartItemsSection = document.querySelector("#div__cart-items");
  if (!cartItemsSection) {
    return;
  } 

  cartItemsSection.textContent = 
    "Загрузка корзины...";
    
  try {
    const q = query(collection(db, "cartItems"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      cartItemsSection.innerHTML = "<p>Корзина пуста</p>";
      return;
    }

    cartItemsSection.innerHTML = "";

    let totalPrice = 0;
    let totalQuantity = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      const itemPrice = Number(data.price) || 0;
      const itemQuantity = Number(data.quantity) || 0;
      const itemTotal = itemPrice * itemQuantity;

      totalPrice += itemPrice * itemQuantity;
      totalQuantity += itemQuantity;  
      
      const itemDiv = document.createElement("section");
      itemDiv.className = "cart__item";
      itemDiv.style.border = "2px solid #ddd";
      itemDiv.style.padding = "10px";
      itemDiv.style.margin = "10px 0";
      itemDiv.style.borderRadius = "5px";

      itemDiv.innerHTML = `
        <h3>${data.productName || "Без названия"}</h3>
        <p>Цена: ${data.price} ₸</p>
        <p>Количество: ${data.quantity}</p>
        <p>Сумма позиции: ${itemTotal} ₸</p>

        <div class="div__button-container">
          <button class="button__increase" data-id="${docSnap.id}">+</button>
          <button class="button__decrease" data-id="${docSnap.id}">-</button>
          <button class="button__remove" data-id="${docSnap.id}">Удалить</button>
        </div>  
      `;

      cartItemsSection.appendChild(itemDiv);
    });

    // Общий итог суммы в корзине
    const totalDiv = document.createElement("section");
    totalDiv.className = "cart__total";
    totalDiv.style.marginTop = "20px";
    totalDiv.style.padding = "15px";
    totalDiv.style.borderTop = "2px solid #ddd";

    totalDiv.innerHTML = `
      <h3>Итого:</h3>
      <p>Товаров в корзине: ${totalQuantity}</p>
      <p>Общая сумма: ${totalPrice} ₸</p>
    `;

    cartItemsSection.appendChild(totalDiv);

    // обработчики кнопок
    document.querySelectorAll(".button__remove").forEach(btn => {
      btn.addEventListener("click", async e => {
        await deleteDoc(doc(db, "cartItems", e.target.dataset.id));
        loadCart(userId);
      });
    });

    document.querySelectorAll(".button__increase").forEach(btn => {
      btn.addEventListener("click", async e => {
        const ref = doc(db, "cartItems", e.target.dataset.id);
        const itemSnap = await getDoc(ref);
        const currentQty = itemSnap.data().quantity;
        await updateDoc(ref, { quantity: currentQty + 1 });
        loadCart(userId);
      });
    });

    document.querySelectorAll(".button__decrease").forEach(btn => {
      btn.addEventListener("click", async e => {
        const ref = doc(db, "cartItems", e.target.dataset.id);
        const itemSnap = await getDoc(ref);
        const currentQty = itemSnap.data().quantity;
        if (currentQty > 1) {
          await updateDoc(ref, { quantity: currentQty - 1 });
        } else {
          await deleteDoc(ref);
        }
        loadCart(userId);
      });
    });

  } catch (error) {
    console.error("Ошибка загрузки корзины:", error);
    cartItemsSection.innerHTML = "<p>Ошибка при загрузке корзины</p>";
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
   const cartItemsSection = document.querySelector("#div__cart-items");
   if (!cartItemsSection)  return; 

    const auth = getAuth();
    auth.onAuthStateChanged(user => {
        if (user) {
            loadCart(user.uid); // авторизованный пользователь uid
        } else {
            cartItemsSection.innerHTML = "<p>Сначала войдите в систему!</p>";
        }
    });
});