import { getFirestore, updateDoc, doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

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
export const SignInWithGoogle = async (nickname) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);

    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await signOut(auth);
      return { error: "Аккаунт уже существует. Используйте LogIn." };
    }

    await setDoc(userRef, {
      name: nickname,
      balance: 0,
      coins: 0
    });

    return { user };
  } catch (error) {
    await signOut(auth);
    return { error: error.message };
  }
};

export const LogInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);

    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await signOut(auth);
      return { error: "Аккаунт не существует. Используйте SignIn." };
    }

    return { user };
  } catch (error) {
    await signOut(auth);
    return { error: error.message };
  }
};

export const updateUserName = async (userId, newName) => {
  if (!userId || !newName) return;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { name: newName });
  } catch (error) {
    console.error("Ошибка обновления имени:", error);
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
      return parseFloat(userDoc.data().balance.toFixed(2)) || 0;
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
    await updateDoc(userRef, { balance: newBalance }); // Обновляем баланс
    return newBalance;
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    return null;
  }
};

/**
 * Получение количества монет пользователя.
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<number>} Количество монет пользователя.
 */
export const getCoins = async (userId) => {
  const userRef = doc(db, "users", userId); // Ссылка на документ пользователя
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data().coins || 0; // Возвращаем количество монет
  } else {
    // Если документа нет, создаем его с 0 монетами
    await setDoc(userRef, { coins: 0 }, { merge: true });
    return 0;
  }
};

/**
 * Обновить количество монет пользователя.
 * @param {string} userId - Идентификатор пользователя.
 * @param {number} newCoins - Новое количество монет.
 * @returns {Promise<number>} Обновленное количество монет.
 */
export const updateCoins = async (userId, newCoins) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { coins: newCoins }); // Обновляем монеты
  return newCoins;
};

/**
 * Восстановить монеты до 20 для пользователя.
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<number>} Обновленное количество монет.
 */
export const restoreCoins = async (userId) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { coins: 20 }); // Восстанавливаем монеты до 20
  return 20;
};

// Экспорт констант для использования в других частях приложения
export { db, auth, app };

/**
 * Получить топ-10 пользователей по количеству коинов.
 * @returns {Promise<Array>} Список из 10 лучших пользователей.
 */
export const getLeaderboard = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(usersRef, orderBy("balance", "desc"), limit(10)));
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      name: doc.data().name || "Аноним",
      balance: Number(Number(doc.data().balance).toFixed()) || 0
    }));
  } catch (error) {
    console.error("Ошибка получения лидерборда:", error);
    return [];
  }
};

/**
 * Получить место текущего пользователя в рейтинге.
 * @param {string} userId - ID пользователя.
 * @returns {Promise<number>} Место пользователя в рейтинге.
 */
export const getUserRank = async (userId) => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(usersRef, orderBy("balance", "desc")));
    
    const users = querySnapshot.docs.map((doc, index) => ({
      uid: doc.id,
      rank: index + 1
    }));

    const userEntry = users.find(user => user.uid === userId);
    return userEntry ? userEntry.rank : users.length + 1; // Если не найден, значит он последний
  } catch (error) {
    console.error("Ошибка получения ранга пользователя:", error);
    return null;
  }
};

// Получить количество использований функции в текущий день
export const getDailyUsageCount = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    const currentDate = new Date().toLocaleDateString(); // Получаем текущую дату в формате "ДД.ММ.ГГГГ"
    const lastUsageDate = data.lastUsageDate;
    const usageCount = data.dailyUsageCount || 0;

    // Если дата изменилась (то есть новый день), сбрасываем счетчик
    if (lastUsageDate !== currentDate) {
      await updateDoc(userRef, { lastUsageDate: currentDate, dailyUsageCount: 0 });
      return 0; // Новый день, сбрасываем счетчик
    }

    return usageCount; // Возвращаем количество использований в текущий день
  } else {
    // Если документа нет, создаем его с 0 использований
    await setDoc(userRef, { dailyUsageCount: 0, lastUsageDate: new Date().toLocaleDateString() }, { merge: true });
    return 0;
  }
};

// Обновить количество использований
export const updateDailyUsageCount = async (userId, usageCount) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { dailyUsageCount: usageCount });
};