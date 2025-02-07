import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Mining from "./pages/Mining";

const App = () => {
  return (
    <div className="h-screen bg-gray-900 text-white">
      <nav className="p-4 bg-gray-800 flex justify-between">
        <h1 className="text-xl font-bold">PencilCoin</h1>
        <div>
          <Link to="/PCoin" className="mr-4">Home</Link>
          <Link to="/PCoin/profile" className="mr-4">Profile</Link>
          <Link to="/PCoin/mining">Get Coins</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/PCoin/" element={<Home />} />
        <Route path="/PCoin/profile/" element={<Profile />} />
        <Route path="/PCoin/auth/" element={<Auth />} />
        <Route path="/PCoin/mining/" element={<Mining />} />
      </Routes>
    </div>
  );
};

export default App;
