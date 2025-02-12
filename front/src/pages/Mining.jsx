import { Link } from "react-router-dom";

const GameSelection = () => {
  const games = [
    { 
      name: "Slider Game", 
      path: "/mining/slider", 
      description: "Зарабатывайте монеты, стирая!", 
      image: "erase.png" 
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Выберите игру</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <Link
            key={index}
            to={game.path}
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-105 text-center flex flex-col items-center"
          >
            <img src={game.image} alt={game.name} className="w-40 h-40 object-cover rounded-md mb-4 filter invert" />
            <h2 className="text-2xl font-semibold mb-2">{game.name}</h2>
            <p className="text-gray-400">{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameSelection;
