import { Link } from "react-router-dom";

// Фиксированные позиции для картинок
const fixedPositions = [
  { top: "5%", left: "15%" }, // Тонкой 1
  { top: "25%", left: "70%" }, // Тонкой 2
  { top: "65%", left: "75%" }, // Тонкой 3
  { top: "70%", left: "15%" }, // График 1
  { top: "25%", left: "30%" }, // График 2
];

const Home = () => {
  return (
    <div className="relative h-full flex flex-col items-center justify-center bg-gray-900 text-white overflow-hidden">
      {/* Заголовок поверх всего */}
      <div className="absolute z-50 text-center flex flex-col items-center">
        <Link
          to="/PCoin/profile"
          className="transition-transform transform hover:scale-110 hover:shadow-black hover:shadow-md p-4 rounded-lg"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">Добро пожаловать в PencilCoin</h2>
          <p className="mt-2 text-lg md:text-xl">Играй и зарабатывай с нашей криптовалютой!</p>
        </Link>
      </div>

      {/* Случайные изображения с фиксированными позициями */}
      <div className="absolute w-full h-full">
        {fixedPositions.map((pos, index) => (
          <img
            key={index}
            src={index < 3 ? "toncoin.png" : "graf1.png"} // 3 TonCoin, 2 графика
            alt="Крипто"
            className="absolute object-contain opacity-80 transition-transform duration-500 z-10 animate-scale"
            style={{
              top: pos.top,
              left: pos.left,
              width: "min(15vw, 15vh)",
              height: "min(15vw, 15vh)",
            }}
          />
        ))}
      </div>

      {/* Светящиеся фигуры */}
      <div className="absolute w-full h-full overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-blue-500 opacity-30 blur-3xl rounded-full animate-pulse z-1"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
