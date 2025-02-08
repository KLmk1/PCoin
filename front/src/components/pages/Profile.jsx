// ProfilePage.js
import { useState, useEffect } from "react";
import { auth, logOut, getBalance } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0); // Баланс пользователя
  const navigate = useNavigate();

  // Отслеживаем состояние пользователя и получаем его баланс
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Получаем баланс с Firebase
        const userBalance = await getBalance(currentUser.uid);
        setBalance(userBalance);  // Обновляем стейт с балансом
      } else {
        navigate("/PCoin/auth"); // Если пользователь не авторизован, перенаправляем на страницу аутентификации
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate("/PCoin/auth"); // После выхода перенаправляем на страницу аутентификации
    } catch (error) {
      console.error("Ошибка выхода:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {user ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-18 h-18 rounded-full mb-4 inline-block mr-5"
              />
            {user.displayName}
          </h2>
          <p className="text-lg text-gray-600 mb-2">Email: {user.email}</p>
          <p className="text-lg text-gray-600 mb-4">Баланс: {balance} PencilCoins</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-400 transition duration-300"
          >
            Выйти
          </button>
        </div>
      ) : (
        <div>
          <p className="text-lg text-gray-600">Загрузка данных...</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
