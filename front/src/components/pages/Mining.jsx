// src/components/Mining.js
import { useState, useEffect } from 'react';
import { auth } from '../../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getBalanceFromAPI, updateBalanceOnAPI } from '../../api/api'; // Импортируем функции

const Mining = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [displayedBalance, setDisplayedBalance] = useState(0); // Баланс для отображения
  const [animating, setAnimating] = useState(false); // Стейт для анимации
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const balance = await getBalanceFromAPI(currentUser.uid);
        setBalance(balance); // Получаем реальный баланс пользователя
        setDisplayedBalance(balance); // Устанавливаем начальный баланс для отображения
      } else {
        navigate('/PCoin/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const mineCoins = async () => {
    if (user && !animating) { // Проверяем, не идет ли анимация
      setAnimating(true);

      // Загружаем актуальный баланс один раз
      const currentBalance = await getBalanceFromAPI(user.uid);

      // Анимация увеличения баланса
      let i = 1;
      const animate = () => {
        if (i <= 5) {
          setDisplayedBalance(prev => prev + 1); // Увеличиваем отображаемый баланс
          i++;
          requestAnimationFrame(animate); // Повторяем анимацию
        } else {
          // После завершения анимации обновляем баланс на сервере
          setTimeout(async () => {
            const newBalance = currentBalance + 5; // Добавляем 5 монет
            const updatedBalance = await updateBalanceOnAPI(user.uid, newBalance);
            if (updatedBalance !== null) {
              setBalance(updatedBalance); // Обновляем реальный баланс
            }
            setAnimating(false); // Останавливаем анимацию
          }, 100);
        }
      };

      requestAnimationFrame(animate); // Начинаем анимацию
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {user ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Привет! Кликайте по PencilCoin, чтобы получить монеты!</h2>
          
          {/* Изображение, которое выполняет роль кнопки */}
          <img 
            src="PencilCoin.png"  // Убедитесь, что путь правильный
            alt="Pencil Coin"
            onClick={mineCoins}
            className="cursor-pointer mb-6 transition-transform transform hover:scale-110 ml-auto mr-auto" 
          />
          <p className="text-lg text-gray-600 mb-4">
            Ваш баланс: 
            <span className={`coin-animation ${animating ? 'coin-animation' : ''}`}>
              {displayedBalance} PencilCoins
            </span>
          </p>
        </div>
      ) : (
        <p className="text-lg text-gray-600">Загрузка данных...</p>
      )}
    </div>
  );
};

export default Mining;
