import React from 'react';

const Clicker = () => {
  const [coins, setCoins] = React.useState(0);

  const handleClick = () => {
    setCoins(coins + 1);
  };

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">PencilCoin Clicker</h1>
      <p className="text-xl mt-4">Монеты: <span className="font-bold">{coins}</span></p>
      <button
        onClick={handleClick}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Кликни меня!
      </button>
    </div>
  );
};

export default Clicker;