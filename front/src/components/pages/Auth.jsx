import { useState, useEffect } from "react";
import { signInWithGoogle, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) navigate("/profile");
    });

    const timer = setTimeout(() => setLoaded(true), 100);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Ошибка входа:", error.message);
    }
  };

  const fixedPositions = [
    { top: "5%", left: "10%" },
    { top: "20%", left: "75%" },
    { top: "80%", left: "5%" },
    { top: "80%", left: "80%" },
    { top: "65%", left: "25%" },
    { top: "10%", left: "50%" },
    { top: "85%", left: "10%" },
    { top: "30%", left: "85%" },
  ];

  const images = ["reg1.png", "reg2.png", "reg3.png", "reg1.png", "reg2.png", "reg3.png"];

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gray-50 overflow-hidden">
      <button
        className="text-4xl text-white font-bold text-gray-800 bg-blue-500 py-3 px-8 rounded-lg hover:bg-blue-400 transition duration-300 flex items-center z-50 max-w-3/4"
        onClick={handleSignIn}
      >
        <img src="reg4.png" alt="Image reg" className="w-20 h-20 object-contain transition-transform duration-500 mr-5" />
        Войдите в PencilCoin
      </button>

      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Image ${index}`}
          className={`w-16 h-16 object-contain absolute transition-all duration-1000 ease-out 
            ${loaded ? "opacity-100 scale-100 animate-pulse" : "opacity-0 scale-75"}`}
          style={fixedPositions[index]}
        />
      ))}
    </div>
  );
};

export default AuthPage;
