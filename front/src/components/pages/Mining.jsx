import { useState, useEffect, useRef, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getBalance, updateBalance, getCoins, updateCoins } from '../firebase';
import confetti from 'canvas-confetti';
import { useNavigate } from "react-router-dom";

const MAX_COINS = 20;

const Mining = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [miningData, setMiningData] = useState({ coins: 0, balance: 0 });
  const [erasedPercentage, setErasedPercentage] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        const [storedBalance, storedCoins] = await Promise.all([
          getBalance(currentUser.uid),
          getCoins(currentUser.uid)
        ]);
        setMiningData({ balance: storedBalance, coins: storedCoins });
      } else {
        navigate("/PCoin/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    const miningInterval = setInterval(() => {
      setMiningData(prevData => {
        const newCoins = Math.max(prevData.coins - 1, 0);
        updateCoins(userId, newCoins);
        return { ...prevData, coins: newCoins };
      });
    }, 60 * 1000);

    return () => clearInterval(miningInterval);
  }, [userId]);

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
      erase(clientX - rect.left, clientY - rect.top);
      const percentage = checkErasedPercentage();
      setErasedPercentage(percentage);

      if (percentage >= 80 && miningData.coins < MAX_COINS) {
        setMiningData(prevData => {
          const newCoins = Math.min(prevData.coins + 1, MAX_COINS);
          if (newCoins !== prevData.coins) {
            setMiningData(prevData => ({ ...prevData, coins: newCoins }));
            updateCoins(userId, newCoins);
            updateBalance(userId, prevData.balance + 1);
            triggerConfetti();
          }
          return prevData;
        });
      }
    }
  }, [isErasing, erase, checkErasedPercentage, userId, miningData, triggerConfetti]);

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
      <p className="text-xl mb-4 text-gray-800">Ваши монеты: {miningData.balance}</p>
      <p className="text-xl mb-4 text-gray-800">Доступные монеты: {MAX_COINS - miningData.coins} / {MAX_COINS}</p>
      <div className="w-1/3 bg-gray-200 rounded-full h-4 mb-4 inline-block">
        <div className="bg-yellow-400 h-4 rounded-full" style={{ width: `${erasedPercentage * 1.25}%` }} />
      </div>
      <p className="text-xl mb-4 text-gray-800">Прогресс: {(erasedPercentage * 1.25).toFixed(2)}% / 100%</p>
      <canvas ref={canvasRef} className="border border-black bg-gray-300" style={{ width: '90%', height: '60%' }} />
    </div>
  );
};

export default Mining;
