import { useState, useEffect, useRef, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getBalance, updateBalance, getCoins, updateCoins, restoreCoins } from '../firebase';
import confetti from 'canvas-confetti';

const MAX_COINS = 20;

const Mining = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isErasing, setIsErasing] = useState(false);
  const [coins, setCoins] = useState(0); // текущие монеты
  const [erasedPercentage, setErasedPercentage] = useState(0);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);

  // Функция для обновления монет каждую минуту до 20
  useEffect(() => {
    const coinsInterval = setInterval(() => {
      if (coins > 0) {
        setCoins((prevCoins) => {
          const newCoins = Math.min(prevCoins - 1, MAX_COINS);
          // Обновление монет в Firestore
          if (userId) {
            updateCoins(userId, newCoins);
          }
          return newCoins;
        }); 
      }
    }, 6 * 60 * 1000); // 1 час

    return () => clearInterval(coinsInterval);
  }, [coins, userId]);

  // Получение баланса и монет из Firestore
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        getBalance(user.uid).then(setBalance);
        getCoins(user.uid).then(setCoins); // Получаем монеты при авторизации
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.6;
      drawCanvas();
    }
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.fillStyle = 'gray';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const erase = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  }, []);

  const checkErasedPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let erasedPixels = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) erasedPixels++;
      }
      return (erasedPixels / (canvas.width * canvas.height)) * 100;
    }
    return 0;
  }, []);

  const triggerConfetti = useCallback(() => {
    confetti({ particleCount: 400, angle: 0, spread: 360, origin: { x: 0.5, y: 0.5 } });
  }, []);

  const handleEraseStart = useCallback((e) => {
    setIsErasing(true);
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    const rect = canvasRef.current.getBoundingClientRect();
    erase(clientX - rect.left, clientY - rect.top);
  }, [erase]);

  const handleEraseMove = useCallback((e) => {
    if (isErasing) {
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      const rect = canvasRef.current.getBoundingClientRect();
      erase(clientX - rect.left, clientY - rect.top); // срабатывает быстрее при движении
      const percentage = checkErasedPercentage();
      setErasedPercentage(percentage);

      if (percentage >= 80 && coins < MAX_COINS) {
        setCoins((prevCoins) => {
          const newCoins = Math.min(prevCoins + 1, MAX_COINS);
          if (newCoins <= MAX_COINS) {
            // Обновляем баланс
            setBalance((prevBalance) => {
              const newBalance = prevBalance + 1;
              if (userId) {
                // Обновление баланса на сервере
                updateBalance(userId, newBalance);
                updateCoins(userId, newCoins); // Обновляем монеты в Firestore
              }
              return newBalance;
            });
          }
          return newCoins;
        });
        triggerConfetti();
      }
    }
  }, [isErasing, erase, checkErasedPercentage, userId, triggerConfetti, coins]);

  const handleEraseEnd = useCallback(() => {
    setIsErasing(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    resizeCanvas();
    canvas.addEventListener('mousedown', handleEraseStart);
    canvas.addEventListener('mousemove', handleEraseMove);
    canvas.addEventListener('mouseup', handleEraseEnd);
    canvas.addEventListener('touchstart', handleEraseStart);
    canvas.addEventListener('touchmove', handleEraseMove);
    canvas.addEventListener('touchend', handleEraseEnd);
    return () => {
      canvas.removeEventListener('mousedown', handleEraseStart);
      canvas.removeEventListener('mousemove', handleEraseMove);
      canvas.removeEventListener('mouseup', handleEraseEnd);
      canvas.removeEventListener('touchstart', handleEraseStart);
      canvas.removeEventListener('touchmove', handleEraseMove);
      canvas.removeEventListener('touchend', handleEraseEnd);
    };
  }, [handleEraseStart, handleEraseMove, handleEraseEnd, resizeCanvas]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Заработайте PencilCoins, стирая!</h2>
      <p className="text-xl mb-4 text-gray-800">Ваши монеты: {balance}</p>
      <p className="text-xl mb-4 text-gray-800">Доступные монеты: {MAX_COINS - coins} / {MAX_COINS}</p>
      <div className="w-1/3 bg-gray-200 rounded-full h-4 mb-4 inline-block">
        <div className="bg-yellow-400 h-4 rounded-full" style={{ width: `${erasedPercentage * 1.25}%` }} />
      </div>
      <p className="text-xl mb-4 text-gray-800">Прогресс: {(erasedPercentage * 1.25).toFixed(2)}% / 100%</p>
      <canvas ref={canvasRef} className="border border-black bg-gray-300" style={{ width: '90%', height: '60%' }} />
    </div>
  );
};

export default Mining;
