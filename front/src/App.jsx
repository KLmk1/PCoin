import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/pages/Home";
import Profile from "./components/pages/Profile";
import Auth from "./components/pages/Auth";
import Mining from "./components/pages/Mining";
import Error from "./components/pages/404";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Навигация */}
      <nav className="p-4 bg-gray-800 flex justify-between items-center px-4 sm:px-10">
        {/* Логотип и название */}
        <h1 className="text-xl font-bold sm:block">
          <img src="logot.png" alt="logo" className="h-6" />
        </h1>

        {/* Иконки */}
        <div className="flex space-x-6">
          <div className="relative flex items-center">
            <Link to="/PCoin/mining" className="flex items-center hover:text-yellow-400 transform transition-transform hover:scale-105">
              <img
                src="mine.png"
                className="w-6 h-6 rounded-full transition-transform duration-300 filter invert"
                alt="Get Coins Icon"
              />
              <span className="ml-2 hidden sm:block">Get Coins</span>
            </Link>
          </div>

          <Link to="/PCoin/" className="flex items-center hover:text-yellow-400 transform transition-transform hover:scale-105">
            <img
              src="home.png"
              className="w-6 h-6 rounded-full transition-transform duration-300 filter invert"
              alt="Home Icon"
            />
            <span className="ml-2 hidden sm:block">Home</span>
          </Link>
          <Link to="/PCoin/profile" className="flex items-center hover:text-yellow-400 transform transition-transform hover:scale-105">
            <img
              src="profile.png"
              className="w-6 h-6 rounded-full transition-transform duration-300 filter invert"
              alt="Profile Icon"
            />
            <span className="ml-2 hidden sm:block">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="flex-grow">
        <Routes>
          <Route path="/PCoin/" element={<Home />} />
          <Route path="/PCoin/profile" element={<Profile />} />
          <Route path="/PCoin/auth" element={<Auth />} />
          <Route path="/PCoin/mining" element={<Mining />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
