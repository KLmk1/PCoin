import { useState, useEffect, useCallback } from "react";
import { auth, logOut, getBalance } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true); // Показывает, идет ли загрузка
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userBalance = await getBalance(currentUser.uid);
          setBalance(userBalance);
        } catch (err) {
          setError("Ошибка загрузки баланса. Попробуйте снова.");
        }
      } else {
        navigate("/PCoin/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await logOut();
      navigate("/PCoin/auth");
    } catch (err) {
      setError(`Ошибка выхода: ${err.message}`);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center bg-white p-6 rounded-xl shadow-md w-11/12 sm:w-96"
        >
          <motion.img
            src={user.photoURL || "default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-4 mx-auto"
            whileHover={{ scale: 1.1 }}
          />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {user.displayName || "Аноним"}
          </h2>
          <p className="text-lg text-gray-600">Email: {user.email}</p>
          <p className="text-lg text-gray-600 mb-4">Баланс: {balance} PencilCoins</p>
          <motion.button
            onClick={handleSignOut}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-400 transition duration-300"
            whileTap={{ scale: 0.9 }}
          >
            Выйти
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
