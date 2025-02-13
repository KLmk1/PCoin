import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Error from "./pages/404";
import MiniGames from "./pages/Mining";
import SliderGame from "./pages/games/slider";
import GraphGame from "./pages/games/Graph";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="p-4 bg-gray-800 flex justify-between items-center px-4 sm:px-10">
        
        <h1 className="text-xl font-bold sm:block">
          <Link to="/" className="flex items-center hover:text-yellow-400 transform transition-transform hover:scale-105">
            <img src="logot.png" alt="logo" className="h-6" />
          </Link>
        </h1>

        <div className="flex space-x-6">
        <Link to="/mining" className="flex items-center hover:text-yellow-400 transform transition-transform hover:scale-105">
          <img src="home.png" className="w-6 h-6 rounded-full transition-transform duration-300 filter invert" alt="Home Icon" />
          <span className="ml-2 hidden sm:block">Home</span>
        </Link>

        <Link to="/profile" className="flex items-center hover:text-yellow-400 transform transition-transform hover:scale-105">
          <img src="profile.png" className="w-6 h-6 rounded-full transition-transform duration-300 filter invert" alt="Profile Icon" />
          <span className="ml-2 hidden sm:block">Profile</span>
        </Link>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/mining" element={<MiniGames />} />
          <Route path="/mining/slider" element={<SliderGame />} />
          <Route path="/mining/graph" element={<GraphGame />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
