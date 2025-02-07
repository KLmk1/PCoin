import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Mining from "./pages/Mining";

const App = () => {
  return (
    <Router>
      <div className="h-screen bg-gray-900 text-white">
        <nav className="p-4 bg-gray-800 flex justify-between">
          <h1 className="text-xl font-bold">PencilCoin</h1>
          <div>
            <Link to="/#/" className="mr-4">Home</Link>
            <Link to="/#/profile" className="mr-4">Profile</Link>
            <Link to="/#/mining">Get Coins</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/#/" element={<Home />} />
          <Route path="/#/profile" element={<Profile />} />
          <Route path="/#/auth" element={<Auth />} />
          <Route path="/#/mining" element={<Mining />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
