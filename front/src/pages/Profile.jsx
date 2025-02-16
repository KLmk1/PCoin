import { useState, useEffect, useCallback } from "react";
import { auth, logOut, getBalance, getLeaderboard, getUserRank, getName } from "../components/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { updateUserName } from "../components/firebase";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [name, setName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [errorn, setErrorn] = useState(null);
  

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newParticle = {
        id: Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setParticles((prev) => [...prev, newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/auth/signin");
        return;
      }

      setUser(currentUser);

      try {
        const [userBalance, topUsers, userName] = await Promise.all([getBalance(currentUser.uid), getLeaderboard(), getName(currentUser.uid)]);

        setBalance(userBalance.toFixed(2));
        setLeaderboard(topUsers);
        setName(userName);

        const rank = topUsers.findIndex(u => u.uid === currentUser.uid);
        setUserRank(rank !== -1 ? rank + 1 : await getUserRank(currentUser.uid));

      } catch {
        setError("Ошибка загрузки данных. Попробуйте снова.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleNameChange = async () => {
    const trimmedName = newName.trim();
  
    if (!trimmedName) {
      setErrorn("Введите ник перед входом.");
      return;
    }
  
    if (trimmedName.length < 3) {
      setErrorn("Никнейм должен содержать минимум 3 символа.");
      return;
    }
  
    if (trimmedName.length > 15) {
      setErrorn("Никнейм должен содержать максимум 15 символов.");
      return;
    }
  
    const nicknameRegex = /^[a-zA-Z0-9_а-яА-я]+$/; // Только буквы, цифры и "_"
    if (!nicknameRegex.test(trimmedName)) {
      setErrorn("Никнейм может содержать только буквы, цифры и _.");
      return;
    }
  
    try {
      await updateUserName(user.uid, trimmedName);
      
      // Обновляем локальное состояние
      setName(trimmedName);
      setUser({ ...user, displayName: trimmedName });
  
      // Обновляем никнейм в лидерборде
      setLeaderboard((prevLeaderboard) =>
        prevLeaderboard.map((entry) =>
          entry.uid === user.uid ? { ...entry, name: trimmedName } : entry
        )
      );
  
      setErrorn(null);
      setIsEditing(false);
    } catch (error) {
      setErrorn("Ошибка обновления никнейма. Попробуйте снова.");
      console.error("Ошибка изменения имени:", error);
    }
  };
  
  
  
  
  const handleSignOut = useCallback(async () => {
    try {
      await logOut();
      navigate("/auth/signin");
    } catch (err) {
      setError(`Ошибка выхода: ${err.message}`);
    }
  }, [navigate, setError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (    
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 md:px-8">    
    <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden">
          {particles.map((particle) => (
          <motion.img
            key={particle.id}
            src="pencil.png"
            alt="ton"
            className="w-6 h-6 absolute"
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: 0,
              scale: 2,
              y: [0, -30],
            }}
            transition={{ duration: 1 }}
            style={{ left: particle.x, top: particle.y }}
          />
        ))}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white p-6 rounded-xl shadow-md w-full mt-10 sm:w-96"
        >
          <motion.img
            src={user.photoURL || "default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-4 mx-auto"
            whileHover={{ scale: 1.1 }}
          />          
          <div className="flex items-center justify-center">
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border px-2 py-1 rounded-lg text-black"
              />
            ) : (
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{name || "Аноним"}</h2>
            )}
            <button
              onClick={() => (isEditing ? handleNameChange() : setIsEditing(true))}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              {isEditing ? "✅" : "✏️"}
            </button>
          </div>
          {errorn && <p className="text-red-500 mb-4 block">{errorn}</p>}
          <p className="text-lg text-gray-600">Email: {user.email}</p>
          <p className="text-lg text-gray-600 mb-4">Баланс: {balance} <img src="pencil.png" alt="pencil" className="h-5 inline-block" /> </p>
          <motion.button
            onClick={handleSignOut}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-400 transition duration-300"
            whileTap={{ scale: 0.9 }}
          >
            Выйти
          </motion.button>
        </motion.div>
      )}

      {/* Лидерборд */}
      <motion.div
        className="mt-6 mb-10 bg-white text-black p-6 rounded-xl shadow-md w-full sm:w-96"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">🏆 Лидерборд</h2>
        {leaderboard?.length > 0 ? (
          leaderboard.map((entry, index) => (
            <motion.div
              key={entry.uid}
              className="flex justify-between p-2 border-b"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }} // Staggered animation
            >
              <span>#{index + 1} {entry.name || "Аноним"}</span>
              <span>{entry.balance} <img src="pencil.png" alt="pencil" className="h-5 inline-block" /></span>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500">Лидерборд пуст</p>
        )}
        {user && userRank > 10 && (
          <div className="mt-4 p-2 bg-yellow-100 rounded-lg">
            <p className="font-bold">Вы: #{userRank}</p>
            <p>Баланс: {balance} <img src="pencil.png" alt="pencil" className="h-5 inline-block" /></p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
