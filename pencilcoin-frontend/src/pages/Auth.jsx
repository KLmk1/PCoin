// src/components/AuthPage.js
import { useState, useEffect } from "react";
import { signInWithGoogle, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Отслеживаем состояние пользователя
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate("/profile"); // Перенаправляем на профиль после входа
      }
    });

    // Очищаем подписку при размонтировании компонента
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Ошибка входа:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
        Войдите в PencilCoin
      </h2>
      <button
        onClick={handleSignIn}
        className="bg-blue-500 text-white py-3 px-8 rounded-lg hover:bg-blue-400 transition duration-300"
      >
        Войти через Google
      </button>
    </div>
  );
};

export default AuthPage;
