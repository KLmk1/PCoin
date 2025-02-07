// MiningPage.js
import { useState, useEffect } from 'react';
import { auth, getBalance, updateBalance } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
        const balance = await getBalance(currentUser.uid);
        setBalance(balance); // Получаем реальный баланс пользователя
        setDisplayedBalance(balance); // Устанавливаем начальный баланс для отображения
      } else {
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const mineCoins = async () => {
    if (user) {
      setAnimating(true); // Включаем анимацию

      // Постепенно увеличиваем отображаемый баланс на 5 монет
      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          setDisplayedBalance(prev => prev + 1);
        }, i * 100); // Каждое увеличение будет с задержкой 100ms
      }

      // После завершения анимации обновляем баланс в Firebase
      setTimeout(async () => {
        const newBalance = await updateBalance(user.uid, balance + 5); // Добавляем 5 монет в Firebase
        setBalance(newBalance); // Обновляем реальный баланс
        setAnimating(false); // Завершаем анимацию
      }, 500); // Завершаем обновление баланса в Firebase после 0.5 сек.
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
            className="cursor-pointer w-128 h-128 mb-6 transition-transform transform hover:scale-110" 
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
