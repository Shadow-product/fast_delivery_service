// js/auth.js
import { auth, db } from "./firestore.js";
import {
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import {
     doc,
     getDoc,
     setDoc,
     updateDoc,
     serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js"

/* Переменные для UI */
const welcomeMessage = document.querySelector("#section__welcome-message");
const showAuthBtn = document.querySelector("#section__show-auth");
const logoutAuthBtn = document.querySelector("#section__logout-btn");
const authContainer = document.querySelector("#form__auth-container");
const userProfile = document.querySelector("#section__user-profile");

/* Показать / скрыть сообщение */
function showError(message) {
    const errorDiv = document.querySelector("#form__auth-error");
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
    document.querySelector("#form__auth-success").classList.add("hidden");
}

function showSuccess(message) {
    const successDiv = document.querySelector("#form__auth-success");
    successDiv.textContent = message;
    successDiv.classList.remove("hidden");
    document.querySelector("#form__auth-error").classList.add("hidden");
}

/* Скрыть сообщение */
function hideMessages() {
    document.querySelector("#form__auth-error").classList.add("hidden");
    document.querySelector("#form__auth-success").classList.add("hidden");
}

onAuthStateChanged(auth, async (user) => {
  console.log(
    "Состояние авторизации изменилось:",
     user ? user.email : "null", 
  );

  if (user) {
    // Пользователь вошёл
    updateUIForLoggedInUser(user);

    // Загружаем данные профиля из Firestore
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists) {
            const userData = userDocSnap.data();
            updateUserProfileUI(user, userData);
        }
      } catch (error) {
          console.error("Ошибка загрузки профиля:", error);
      }
    } else {
        // Пользователь вышел или не авторизован
        updateUIForGuest();
    }
  });

/* Обновление интерфейса */
async function updateUIForLoggedInUser(user) {
  // Обновление шапки
  welcomeMessage.textContent = `Привет, ${user.email.split("@")[0]}!`;
  welcomeMessage.classList.remove("hidden");
  showAuthBtn.classList.add("hidden");
  logoutAuthBtn.classList.remove("hidden");

  // Показываем личный кабинет
  userProfile.classList.remove("hidden");

  // Скрываем форму авторизации
  authContainer.classList.add("hidden");
}

function updateUIForGuest() {
  // Обновление шапки
  welcomeMessage.classList.add("hidden");
  showAuthBtn.classList.remove("hidden");
  logoutAuthBtn.classList.add("hidden");

  // Скрываем личный кабинет
  userProfile.classList.add("hidden");

  // Скрываем форму авторизации
  authContainer.classList.add("hidden");

  // Очищаем поля формы
  document.querySelector("#form__auth-name").value = "";
  document.querySelector("#form__auth-email").value = "";
  document.querySelector("#form__auth-phone").value = "";
  document.querySelector("#form__auth-password").value = "";
  hideMessages();
}

function updateUserProfileUI(user, userData) {
  // Заполнение данных личном кабинете
  document.querySelector("#section__user-email").textContent = user.email;
  document.querySelector("#section__user-id").textContent = user.uid;

  if (userData.createdAt) {
    const date = userData.createdAt.toDate();
    document.querySelector("#section__user-created").textContent =
      date.toLocaleDateString("ru-RU");
  }

  document.querySelector("#section__user-role").textContent =
   userData.role || "user";
}

/* Регистрация пользователя */
export async function registerUser(name, email, phone, password) {
    try {
        // Создаётся пользователь
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            email,
            password,
        );
        const user = userCredential.user;
        
        // Сохранение дополнительных данных Firestore
           await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            name,
            phone,
            isActive: true,
            intercom: null,
            favoriteRestaurants: [],
            lastOrder: null,
            currentLocation: null,
            bonusNumber: 0,
            address: null,
            createdAt: serverTimestamp(),
            role: "user",
            lastLogin: serverTimestamp(),
        });

    showSuccess("Регистрация успешна!");
    // Очищается поля формы
    document.querySelector("#form__auth-name").value = "";
    document.querySelector("#form__auth-email").value = "";
    document.querySelector("#form__auth-phone").value = "";
    document.querySelector("#form__auth-password").value = "";
    } catch (error) {
        console.error("Ошибка регистрации:", error.message);
      
        // Понятные сообщения об ошибках
          switch (authError.code) {
            case "auth/email-already-in-use":
              showError("Этот email уже используется");
              break;
            case "auth/invalid-email":
              showError("Неверный формат email");
              break;
            case "auth/weak-password":
              showError("Пароль должен содержать минимум 6 символов");
              break;
            default:
              showError("Ошибка регистрации: " + authError.message);
          }
    }
}

/* Вход пользователя */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;
        console.log("Пользователь вошёл:", user.email);

        // Обновление времени последнего входа
        await updateDoc(doc(db, "users", user.uid), {
            lastLogin: serverTimestamp(),
        });

        showSuccess("Вход выполнен успешно!");

        // Очищаем поля формы
          document.querySelector("#form__auth-name").value = "";
          document.querySelector("#form__auth-email").value = "";
          document.querySelector("#form__auth-phone").value = "";
          document.querySelector("#form__auth-password").value = "";
        } catch (error) {
          console.error("Ошибка входа:", error.code);

          switch (error.code) {
            case "auth/user-not-found":
              showError("Пользователь не найден");
              break;
            case "auth/wrong-password":
              showError("Неверный пароль");
              break;
            case "auth/invalid-email":
              showError("Неверный формат email");
              break;
            case "auth/user-disabled":
              showError("Аккаунт отключен");
              break;
            default:
              showError("Ошибка входа: " + error.message);
        }
    }
}   

/* Выход пользователя */
export async function logoutUser() {
        try {
          await signOut(auth);
          console.log("Пользователь вышел");
          updateUIForGuest();
        } catch (error) {
          console.error("Ошибка выхода:", error);
          showError("Ошибка при выходе из системы: ", error.message);
        }
}

/* Обработчик событий */
// Кнопка Войти / Регистрация 
if (showAuthBtn) {
showAuthBtn.addEventListener("click", () => {
    authContainer.classList.remove("hidden");
    hideMessages();
  });
} else {
  console.error("Элемент #section__show-auth не найден");
} 

// Кнопка "Отмена в форме"
document
    .querySelector("#form__cancel-btn")
    .addEventListener("click", () => {
        authContainer.classList.add("hidden");
        hideMessages();
});

  // Кнопка "Войти"
  document.querySelector("#form__signin-btn").addEventListener("click", () => {
    const email = document.querySelector("#form__auth-email").value;
    const password = document.querySelector("#form__auth-password").value;

  if (!email || !password) {
      showError("Введите email и пароль");
      return;
  }

  loginUser(email, password);
  });

  // Кнопка "Зарегистрироваться"
  document.querySelector("#form__signup-btn").addEventListener("click", (e) => {
      e.preventDefault(); // отмена стандартного поведения
      const name = document.querySelector("#form__auth-name").value;
      const email = document.querySelector("#form__auth-email").value;
      const phone = document.querySelector("#form__auth-phone").value;
      const password = document.querySelector("#form__auth-password").value;

  const nameRegex = /^[A-Za-zA-Яа-яЁё\s]{2,}$/;
  if (!nameRegex.test(name)) {
    showError("Введите корректное имя (только буквы, минимум 2 символа)");
    return;
  } 

  if (!name || !email || !phone || !password) {
      showError("Введите имя пользователя, email, номер телефона и пароль");
      return;
  }

  if (password.length < 6) {
      showError("Пароль должен содержать минимум 6 символов");
      return;
  }

  const phoneRegex = /^\+7\d{10}$/;
  if (!phoneRegex.test(phone)) {
    showError("Введите номер телефона в формате +7XXXXXXXXXX");
    return;
  }

  registerUser(name, email, phone, password);
  });

  // Кнопка "Выйти"
  logoutAuthBtn.addEventListener("click", (e) => {
      e.preventDefault(); // отмена стандартного поведения
      logoutUser();
  });

  // Нажатие Enter в полях формы
  document
      .querySelector("#form__auth-password")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const email = document.querySelector("#form__auth-email").value;
          const password = document.querySelector("#form__auth-password").value;
          loginUser(email, password);
        }
  });