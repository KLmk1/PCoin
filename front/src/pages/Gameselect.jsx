import { Link } from "react-router-dom";
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from "react-router-dom";

const fixedPositions = [
  { top: "5%", left: "4%" },
  { top: "25%", left: "70%" },
  { top: "65%", left: "75%" },
  { top: "70%", left: "8%" },
  { top: "25%", left: "10%" },
];

const GameSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      if (!currentUser) {
        navigate("/auth/signin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const games = [
    { 
      name: "Slider Game", 
      path: "/gameselection/slider", 
      description: "Зарабатывайте монеты, стирая!", 
      image: "erase.png" 
    },    
    { 
      name: "Graph Game", 
      path: "/gameselection/graph", 
      description: "Зарабатывайте монеты, предсказывая!", 
      image: "graphgame.png" 
    },
    /*
    { 
      name: "Tetris Game", 
      path: "/mining/tetris", 
      description: "Зарабатывайте монеты, уничтожая кубики!", 
      image: "erase.png" 
    },
    */
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 ">
      <h1 className="text-3xl font-bold mb-6">Выберите игру</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-1">
        {games.map((game, index) => (
          <Link
            key={index}
            to={game.path}
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-105 text-center flex flex-col items-center"
          >
            <img src={game.image} alt={game.name} className="w-40 h-40 object-cover rounded-md mb-4 filter invert" />
            <h2 className="text-2xl font-semibold mb-2">{game.name}</h2>
            <p className="text-gray-300">{game.description}</p>
          </Link>
        ))}
      </div>
      <div className="absolute w-full h-full">
        {fixedPositions.map((pos, index) => (
          <img
            key={index}
            src="pencillogo.png"
            alt="Крипто"
            className="absolute object-contain opacity-80 transition-transform duration-500 z-10 animate-scale"
            style={{
              top: pos.top,
              left: pos.left,
              width: "min(30vw, 30vh)",
              height: "min(30vw, 30vh)",
            }}
          />
        ))}
    </div>
    </div>      
  );
};

export default GameSelection;
