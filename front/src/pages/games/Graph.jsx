import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getBalance, updateBalance } from "../../components/firebase";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";

const LuckyJetGame = () => {
  const [data, setData] = useState([{ time: 0, value: 1 }]);
  const [bet, setBet] = useState(10);
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [isCrashed, setIsCrashed] = useState(false);
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [currentCoefficient, setCurrentCoefficient] = useState(null);
  const [autoWithdrawCoefficient, setAutoWithdrawCoefficient] = useState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        const storedBalance = await getBalance(currentUser.uid);
        setBalance(storedBalance);
      }
    });
    return () => unsubscribe();
  }, []);

  const generateGrowth = (lastValue, time) => {
    return lastValue * (1.02 + time * 0.0005); // Ускоряем рост со временем
  };
  
  const generateCrash = (lastValue) => {
    if (lastValue >= 1 && lastValue <= 1.1) {
      return Math.random() < 0.01 ? 0 : lastValue; // 1% шанс краша на низких коэффициентах
    }
  
    if (lastValue > 1.1 && lastValue <= 3) {
      const crashChance = 0.005 + lastValue * 0.007; // Плавный рост вероятности краша
      return Math.random() < crashChance ? 0 : lastValue;
    }
  
    if (lastValue > 3) {
      const crashChance = 0.01 + lastValue * 0.008; // Ускоренный рост вероятности краша
      return Math.random() < crashChance ? 0 : lastValue;
    }
  
    return lastValue;
  };
  
  useEffect(() => {
    if (isCrashed || isWithdrawn || !gameStarted) return;
  
    const interval = setInterval(() => {
      setData((prevData) => {
        const lastPoint = prevData[prevData.length - 1];
        let newValue = generateGrowth(lastPoint.value, lastPoint.time);
        newValue = generateCrash(newValue);
  
        if (newValue === 0) setIsCrashed(true);
  
        return [...prevData, { time: lastPoint.time + 1, value: newValue }];
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [isCrashed, isWithdrawn, gameStarted]);
  

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
    setIsWithdrawn(false);
    setGameStarted(true);
    setCurrentCoefficient(null);
  };

  const withdraw = () => {
    if (!prediction) return;

    const finalValue = data[data.length - 1].value;
    const coefficient = finalValue / prediction.startValue;
    const winAmount = prediction.betAmount * coefficient;
    const newBalance = balance + winAmount;

    setBalance(newBalance);
    updateBalance(userId, newBalance);

    setIsWithdrawn(true);
  };

  const resetGraph = () => {
    setIsCrashed(false);
    setIsWithdrawn(false);
    setGameStarted(false);
    setData([{ time: 0, value: 1 }]);
    setAutoWithdraw(false);
    setCurrentCoefficient(null);
    setPrediction(null);
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Graph Game</h1>
        <p className="text-center text-xl font-semibold mb-4 text-gray-700">
          Баланс: <span className="text-indigo-600">{Number(balance).toFixed(2)}</span> коинов
        </p>

        <div className="flex justify-center mb-8">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#555" />
              <YAxis domain={[1, "auto"]} stroke="#555" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  color: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Added shadow to the tooltip
                }}
                labelStyle={{ fontWeight: "bold", color: "#fff" }}
                itemStyle={{
                  color: "#4A90E2",
                  fontWeight: "bold",
                }}
                formatter={(value) => value.toFixed(2)}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#gradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A90E2" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#50C878" stopOpacity={0.9} />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Inputs for Bet and Auto-Withdraw */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
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
          {isCrashed && (
            <Button onClick={resetGraph} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg">
              Вы проиграли!
            </Button>
          )}
          {!isCrashed && !isWithdrawn && prediction && currentCoefficient && (
            <Button onClick={withdraw} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">
              Забрать {currentCoefficient}X (+{(currentCoefficient * prediction.betAmount).toFixed(2)})
            </Button>
          )}
          {!isCrashed && (
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
