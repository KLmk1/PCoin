import { useState, useEffect, useRef, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Импортируем нужные функции из Firebase v9
import { getBalance, updateBalance } from '../firebase'; // Импортируем функции для работы с балансом
import confetti from 'canvas-confetti'; // Импортируем библиотеку для конфетти

const Mining = () => {
  const canvasRef = useRef(null); // Ссылка на канвас
  const ctxRef = useRef(null); // Ссылка на контекст канваса
  const [isErasing, setIsErasing] = useState(false); // Состояние для отслеживания, стираем ли мы
  const [coins, setCoins] = useState(0); // Состояние для отслеживания монет
  const [erasedPercentage, setErasedPercentage] = useState(0); // Состояние для отслеживания прогресса стирания
  const [balance, setBalance] = useState(0); // Баланс пользователя
  const [userId, setUserId] = useState(null); // Идентификатор пользователя

  // Регулировка размера канваса при изменении размера окна
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Устанавливаем размеры канваса на основе окна браузера
      canvas.width = window.innerWidth * 0.9; // 90% от ширины окна
      canvas.height = window.innerHeight * 0.6; // 60% от высоты окна
      drawCanvas(); // Перерисовываем канвас после изменения размера
    }
  }, []);

  // Рисование на канвасе (фон)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (canvas && ctx) {
      // Рисуем серый фон на канвасе
      ctx.fillStyle = 'gray';
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Рисуем прямоугольник, который заполняет весь канвас
    }
  }, []);

  // Функция стирания
  const erase = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (canvas && ctx) {
      // Устанавливаем режим стирания
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2); // Радиус ластика
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; // Восстанавливаем нормальный режим рисования
    }
  }, []);

  // Проверка процента стертой области
  const checkErasedPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (canvas && ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let erasedPixels = 0;

      // Считаем количество прозрачных пикселей (стертых)
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) erasedPixels++;
      }

      const totalPixels = canvas.width * canvas.height;
      const percentage = (erasedPixels / totalPixels) * 100;

      return percentage;
    }

    return 0;
  }, []);

  // Добавляем конфетти
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 400,
      angle: 0,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
    });
  }, []);

  // Обработчики событий для мыши и касаний
  const handleEraseStart = useCallback((e) => {
    setIsErasing(true);
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    erase(x, y);
  }, [erase]);

  const handleEraseMove = useCallback((e) => {
    if (isErasing) {
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      erase(x, y);

      // Проверяем прогресс стирания
      const percentage = checkErasedPercentage();
      setErasedPercentage(percentage);

      // Если стирано 80%, начисляем монеты, сбрасываем канвас и запускаем конфетти
      if (percentage >= 80) {
        const earnedCoins = 1; // Начисляем 1 монету
        setCoins((prev) => prev + earnedCoins); // Начисляем монеты
        setBalance((prev) => prev + earnedCoins); // Обновляем баланс
        setErasedPercentage(0); // Сбрасываем прогресс
        drawCanvas(); // Перерисовываем канвас

        // Добавляем эффект конфетти
        triggerConfetti();

        // Обновляем баланс в Firebase
        if (userId) {
          updateBalance(userId, balance + earnedCoins)
            .then(() => console.log('Balance updated successfully'))
            .catch((error) => console.error('Error updating balance:', error));
        }
      }
    }
  }, [isErasing, erase, checkErasedPercentage, drawCanvas, userId, balance, triggerConfetti]);

  const handleEraseEnd = useCallback(() => {
    setIsErasing(false);
  }, []);

  // Инициализация канваса и добавление слушателей событий
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx; // Сохраняем контекст
    resizeCanvas(); // Устанавливаем начальные размеры канваса

    // Добавляем слушатели событий для мыши и касаний
    canvas.addEventListener('mousedown', handleEraseStart);
    canvas.addEventListener('mousemove', handleEraseMove);
    canvas.addEventListener('mouseup', handleEraseEnd);
    canvas.addEventListener('touchstart', handleEraseStart);
    canvas.addEventListener('touchmove', handleEraseMove);
    canvas.addEventListener('touchend', handleEraseEnd);

    // Очистка слушателей при размонтировании компонента
    return () => {
      canvas.removeEventListener('mousedown', handleEraseStart);
      canvas.removeEventListener('mousemove', handleEraseMove);
      canvas.removeEventListener('mouseup', handleEraseEnd);
      canvas.removeEventListener('touchstart', handleEraseStart);
      canvas.removeEventListener('touchmove', handleEraseMove);
      canvas.removeEventListener('touchend', handleEraseEnd);
    };
  }, [handleEraseStart, handleEraseMove, handleEraseEnd, resizeCanvas]);

  // Загрузка баланса при монтировании компонента
  useEffect(() => {
    const auth = getAuth(); // Получаем экземпляр auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    // Загружаем баланс после того, как userId установлен
    if (userId) {
      const fetchData = async () => {
        const userBalance = await getBalance(userId);
        setBalance(userBalance);
      };

      fetchData();
    }

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Заработайте PencilCoins, стирая!</h2>
      <p className="text-xl mb-4 text-gray-800">Ваши монеты: {balance}</p>
      <p className="text-xl mb-4 text-gray-800">
        Прогресс: {(erasedPercentage * 1.25).toFixed(2)}% / 100%
      </p>
      {/* Канвас для рисования */}
      <canvas
        ref={canvasRef}
        className="border border-black bg-gray-300"
        style={{ width: '90%', height: '60%' }}
      />
    </div>
  );
};

export default Mining;
