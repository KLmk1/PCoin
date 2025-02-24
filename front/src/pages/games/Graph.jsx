import { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, AreaChart, ResponsiveContainer, Scatter, Area, LabelList } from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getBalance, updateBalance } from "../../components/firebase";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LuckyJetGame = () => {
  const [data, setData] = useState([{ time: 0, value: 1 }]);
  const [bet, setBet] = useState(10);
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [isBtactive, setBtactive] = useState(true);
  const [isCrashed, setIsCrashed] = useState(false);
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [currentCoefficient, setCurrentCoefficient] = useState(null);
  const [finalCoefficient, setfinalCoefficient] = useState(null);
  const [autoWithdrawCoefficient, setAutoWithdrawCoefficient] = useState();
  const [loading, setLoading] = useState(true);
  const [betHistory, setBetHistory] = useState([]);
  const [getCoef, setCoef] = useState(null);
  const [isgoup, setGoup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {

      if (currentUser) {
        try {
          setUserId(currentUser.uid);
          const storedBalance = await getBalance(currentUser.uid);
          setBalance(storedBalance);
        } catch (error) {
          console.error("Ошибка загрузки данных:", error);
        } finally {
          setLoading(false);}
      } else {
        navigate("/auth/signin");
      }
    });
    return () => unsubscribe();
  }, []);

  const generateGrowth = (lastValue, time) => {
    return lastValue * (1.02 + time * 0.0005); // Ускоряем рост со временем
  };

  const generateType = () => {
    return Math.random(); // Ускоряем рост со временем
  };
  
  const generateCrash = (lastValue, type) => {
    if (type > 0.2 || !isWithdrawn && prediction) {
      console.warn(isgoup);
      if (lastValue >= 1 && lastValue <= 1.1) {
        return Math.random() < 0.03 ? 0 : lastValue; // 1% шанс краша на низких коэффициентах
      }
    
      if (lastValue > 1.1 && lastValue <= 3) {
        const crashChance = 0.005 + lastValue * 0.01; // Плавный рост вероятности краша
        return Math.random() < crashChance ? 0 : lastValue;
      }
    
      if (lastValue > 3) {
        const crashChance = 0.02 + lastValue * 0.015; // Ускоренный рост вероятности краша
        return Math.random() < crashChance ? 0 : lastValue;
      }
    } else {
      console.log("caca");
      if (lastValue < 5) {
        return lastValue;
      } else if (lastValue > 10 && lastValue < 20) {
        const crashChance = 0.002 + lastValue * 0.0007; // Ускоренный рост вероятности краша
        return Math.random() < crashChance ? 0 : lastValue;
      } else {
        const crashChance = 0.002 + lastValue * 0.0007; // Ускоренный рост вероятности краша
        return Math.random() < crashChance ? 0 : lastValue;
      }
    }
  }

  useEffect(() => {
    let type = generateType();  
    if (isCrashed || !gameStarted) return;
    const interval = setInterval(() => {
      setData((prevData) => {
        const lastPoint = prevData[prevData.length - 1];
        let newValue = generateGrowth(lastPoint.value, lastPoint.time);
        newValue = generateCrash(newValue, type);
        setCoef(newValue);
        if (newValue === 0) {
          setIsCrashed(true);
          setGameStarted(false); // Игра заканчивается только при краше
          setfinalCoefficient(lastPoint.value);
        }
  
        return [...prevData, { time: lastPoint.time + 1, value: newValue }];
      });
    }, 500);
  
    return () => clearInterval(interval);
  }, [isCrashed, gameStarted]);

  useEffect(() => {
    if (prediction && gameStarted && !isCrashed && !isWithdrawn) {
      const lastValue = data[data.length - 1].value;
      const coefficient = lastValue / prediction.startValue;
      setCurrentCoefficient(coefficient.toFixed(2));
    }
  }, [data, prediction, gameStarted, isCrashed, isWithdrawn]);

  useEffect(() => {
    if (
      autoWithdraw &&
      currentCoefficient &&
      Number(currentCoefficient) >= autoWithdrawCoefficient &&
      !isWithdrawn
    ) {
      withdraw();
      setAutoWithdraw(false);
    }
  }, [autoWithdraw, currentCoefficient, autoWithdrawCoefficient, isWithdrawn]);

  const placeBet = () => {
    if (bet <= 0 || bet > balance) {
      alert("Недостаточно коинов или ставка некорректна");
      return;
    }

    const newBalance = balance - bet;
    setBalance(newBalance);
    updateBalance(userId, newBalance);

    setData([{ time: 0, value: 1 }]);
    setPrediction({ startValue: 1, betAmount: bet });
    setIsCrashed(false);
    setGameStarted(true);
    setCurrentCoefficient(null);
    setBtactive(false);
    
    setIsWithdrawn(false);
    
    setGoup(false);
  };

  const withdraw = () => {

    const finalValue = data[data.length - 1].value;
    const coefficient = finalValue / prediction.startValue;
    const winAmount = prediction.betAmount * coefficient;
    const newBalance = balance + winAmount;

    setGoup(true);
    setBalance(newBalance);
    updateBalance(userId, newBalance);
    setIsWithdrawn(true);
  };

  useEffect(() => {
    if (isCrashed) {
      setBetHistory([...betHistory, { coefficient: finalCoefficient.toFixed(2), claimcoef: currentCoefficient, bet: prediction.betAmount, won: isWithdrawn }]);
    }
  }, [isCrashed]);


  const resetGraph = () => {
    setIsCrashed(false);
    setGameStarted(false);
    setData([{ time: 0, value: 1 }]);
    setAutoWithdraw(false);
    setCurrentCoefficient(null);
    setPrediction(null);
    setBtactive(true);
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 flex items-center justify-center p-8">
        <motion.div
          className="absolute top-20 left-0 w-96 h-32 bg-white opacity-70 rounded-full blur-lg"
          animate={{ 
            x: ["-50vh", "200vh"], 
            y: [0, -20, 0, 10, 0] // Покачивание вверх-вниз
          }}
          transition={{ 
            x: { duration: 35, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" } // Независимая анимация покачивания
          }}
        />
        <motion.div
          className="absolute bottom-10 right-0 w-90 h-28 bg-white opacity-70 rounded-full blur-lg"
          animate={{ 
            x: ["80vh", "-200vh"], 
            y: [0, 15, 0, -10, 0] // Покачивание вверх-вниз
          }}
          transition={{ 
            x: { duration: 30, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" } // Независимая анимация покачивания
          }}
        />        
        <motion.div
        className="absolute bottom-120 right-0 w-60 h-28 bg-white opacity-70 rounded-full blur-lg"
        animate={{ 
          x: ["30vh", "-200vh"], 
          y: [0, 10, 0, -15, 0] // Покачивание вверх-вниз
        }}
        transition={{ 
          x: { duration: 20, repeat: Infinity, ease: "linear" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" } // Независимая анимация покачивания
        }}
      />
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl  z-50">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Graph Game</h1>
        <p className="text-center text-xl font-semibold mb-4 text-gray-700">
          Баланс: <span className="text-indigo-600">{Number(balance).toFixed(2)}</span> <img src="pencil.png" alt="pencil" className="h-5 inline-block" />
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {betHistory.slice().reverse().slice(0, 12).map((bet, index) => (
            <div
              key={index}
              className={`p-2 rounded-3xl text-white cursor-pointer ${bet.coefficient < 2 ? 
                'bg-blue-500' : bet.coefficient < 5 ?
                 'bg-purple-500' : bet.coefficient < 20 ?
                  'bg-pink-500' : bet.coefficient < 50 ?
                  'bg-red-500' : bet.coefficient < 100 ?
                  'bg-orange-500' : 'bg-yellow-500'}`}
              title={`Ставка: ${bet.bet}, ${bet.won ? `Выигрыш: ${bet.claimcoef * bet.bet}` : 'Проигрыш'}`}
            >
              {bet.coefficient}X
            </div>
          ))}
        </div>

  <div className="flex justify-center mb-8 relative">
  <ResponsiveContainer width="100%" height={350}>
    <AreaChart data={data}>
      {/* Убираем сетку и оси с числами */}
      <CartesianGrid stroke="none" />
      
      <LabelList dataKey="uv" position="top" />
      {/* Ось X без меток */}
      <XAxis 
        dataKey="time" 
        stroke="#555" 
        tick={false}  // Убираем метки на оси X
      />
      
      {/* Ось Y без меток, добавляем точки */}
      <YAxis 
        domain={["auto", "auto"]} 
        stroke="#555" 
      />
      
      {/* Добавляем точки на графике */}
      <Scatter
        data={data}
        fill="#000"
        line={{ stroke: "#000", strokeWidth: 1 }}
      />

      {/* Анимация графика */}
      <Area
        type="monotone"
        dataKey="value"
        stroke="url(#lineGradient)"
        fill="url(#backgroundGradient)"
        strokeWidth={3}
        dot={false}
        activeDot={{ r: 8 }}
        isAnimationActive={true}  // Включаем анимацию
        animationDuration={1000}  // Длительность анимации
      />
      
      <defs>
            <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="40%" stopColor="rgba(0, 142, 207, 0.75)" />
              <stop offset="60%" stopColor="rgba(0, 189, 63, 0.7)" />
              <stop offset="70%" stopColor="rgba(19, 167, 0, 0.89)" />
              <stop offset="100%" stopColor="rgba(158, 175, 0, 0.68)" />
            </linearGradient>            
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="40%" stopColor="rgb(0, 174, 255)" />
              <stop offset="60%" stopColor="rgb(0, 255, 85)" />
              <stop offset="70%" stopColor="rgb(30, 255, 0)" />
              <stop offset="100%" stopColor="rgb(229, 255, 0)" />
            </linearGradient>
      </defs>
      
    </AreaChart>  
  </ResponsiveContainer>          
  <div className="absolute top-5 right-auto text-3xl font-bold text-black bg-white p-2 rounded-lg shadow-md">
            x{(getCoef && getCoef.toFixed(2)) || "1.00"}
  </div>
</div>



        {/* Inputs for Bet and Auto-Withdraw */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mb-6">
          <div className="flex flex-col items-center">
            <label className="mb-2 font-medium text-gray-800">Ставка</label>
            <Input
              type="number"
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="mb-2 font-medium text-gray-800">Коэффициент для авто-выдачи</label>
            <div className="flex items-center space-x-4 w-full">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoWithdraw}
                  onChange={(e) => setAutoWithdraw(e.target.checked)}
                  className="w-12 h-12 mr-2 border border-gray-300 rounded-lg"
                />
              </div>
              <Input
                type="number"
                step="0.1"
                value={autoWithdrawCoefficient}
                onChange={(e) => setAutoWithdrawCoefficient(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
                disabled={!autoWithdraw}  // Disable input if autoWithdraw is false
                style={{ backgroundColor: !autoWithdraw ? '#f0f0f0' : 'white' }} // Apply grey background when disabled
              />
            </div>
          </div>
        </div>
                
        {/* Place Bet Button */}
        {/* Withdrawal Button */}
        <div className="flex flex-col items-center space-y-4">
          {isCrashed  && !isWithdrawn && (
            <Button onClick={resetGraph} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg">
              Вы проиграли!
            </Button>
          )}
          {isCrashed && isWithdrawn && (
            <Button onClick={resetGraph} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg">
              Сыграть ещё раз
            </Button>
          )}
          {!isCrashed && !isWithdrawn && prediction && currentCoefficient && (
            <Button onClick={withdraw} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">
              Забрать {currentCoefficient}X (+{(currentCoefficient * prediction.betAmount).toFixed(2)} ) <img src="pencil.png" alt="pencil" className="h-5 inline-block" />
            </Button>
          )}
          {isBtactive && (
            <Button
              onClick={placeBet}
              className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg"
            >
              Сделать ставку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyJetGame;
