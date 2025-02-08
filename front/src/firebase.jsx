import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

// Функция для входа через Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('User signed in: ', user);
    return user;
  } catch (error) {
    console.error('Error signing in with Google: ', error.message);
    throw error;
  }
};

// Функция для выхода пользователя
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out: ', error.message);
    throw error;
  }
};

// Функция для получения баланса пользователя
export const getBalance = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data().balance;
    } else {
      // Если документа нет, создаем его с начальным балансом
      await setDoc(userRef, { balance: 0 });
      return 0;
    }
  } catch (error) {
    console.error('Error getting balance: ', error);
  }
};

// Функция для обновления баланса пользователя
export const updateBalance = async (userId, amount) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const newBalance = docSnap.data().balance + amount;
      await updateDoc(userRef, { balance: newBalance });
      return newBalance;
    } else {
      console.error('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error updating balance: ', error);
  }
};

export { db, auth };
