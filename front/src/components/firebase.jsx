import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB9D4TEfh51wkouAney3bGYWs-qZy0BO0o",
  authDomain: "pcoin-4b4b5.firebaseapp.com",
  projectId: "pcoin-4b4b5",
  storageBucket: "pcoin-4b4b5.firebasestorage.app",
  messagingSenderId: "927446081534",
  appId: "1:927446081534:web:4764b8300b0415d8556aaf",
  measurementId: "G-SNS37JZF7Y"
};

// Инициализация приложения Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/**
 * Вход через Google.
 * @returns {Promise<User>} Объект пользователя Firebase.
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('User signed in:', user);
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }
};

/**
 * Выход пользователя.
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out:', error.message);
    throw error;
  }
};

/**
 * Получение баланса пользователя.
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<number>} Баланс пользователя.
 */
export const getBalance = async (userId) => {
  if (!userId) {
    console.error('User ID is required');
    return 0;
  }

  try {
    const userRef = doc(db, "users", userId); // Ссылка на документ пользователя
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().balance || 0; // Возвращаем баланс, если документ существует
    } else {
      // Если документ не существует, создаем его с балансом 0
      await setDoc(userRef, { balance: 0 });
      return 0;
    }
  } catch (error) {
    console.error('Ошибка при получении баланса:', error);
    return 0;
  }
};

/**
 * Обновление баланса пользователя.
 * @param {string} userId - Идентификатор пользователя.
 * @param {number} newBalance - Новый баланс.
 * @returns {Promise<number>} Обновленный баланс.
 */
export const updateBalance = async (userId, newBalance) => {
  if (!userId) {
    console.error('User ID is required');
    return null;
  }

  if (typeof newBalance !== 'number') {
    console.error('New balance must be a number');
    return null;
  }

  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { balance: newBalance }, { merge: true }); // Обновляем баланс
    return newBalance;
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    return null;
  }
};

/**
 * Получение времени последнего начисления монет.
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<number>} Время последнего начисления монет.
 */
export const getLastRewardTime = async (userId) => {
  if (!userId) {
    console.error('User ID is required');
    return null;
  }

  try {
    const userRef = doc(db, "users", userId); // Ссылка на документ пользователя
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().lastRewardTime || null; // Возвращаем время последнего начисления, если оно существует
    } else {
      // Если документа нет, возвращаем null
      console.error('Документ не найден');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при получении времени последнего начисления:', error);
    return null;
  }
};

/**
 * Обновление времени последнего начисления монет.
 * @param {string} userId - Идентификатор пользователя.
 * @param {number} timestamp - Время последнего начисления (время в миллисекундах).
 * @returns {Promise<void>} Обновление времени последнего начисления.
 */
export const updateLastRewardTime = async (userId, timestamp) => {
  if (!userId || typeof timestamp !== 'number') {
    console.error('Invalid user ID or timestamp');
    return;
  }

  try {
    const userRef = doc(db, "users", userId); // Ссылка на документ пользователя
    await setDoc(userRef, { lastRewardTime: timestamp }, { merge: true }); // Обновляем время последнего начисления
  } catch (error) {
    console.error('Ошибка при обновлении времени последнего начисления:', error);
  }
};

// Экспорт констант для использования в других частях приложения
export { db, auth, app };
