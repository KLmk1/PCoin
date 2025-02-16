import { useState, useEffect } from "react";
import { LogInWithGoogle, auth } from "../../components/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) navigate("/profile");
    });

    const timer = setTimeout(() => setLoaded(true), 100);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleSignIn = async () => {
    setLoading(true);
    setError(""); // Очищаем прошлую ошибку перед началом
  
    try {
      const response = await LogInWithGoogle(); // Выполняем вход
  
      if (response.error) {
        setError(response.error); // Показываем реальную ошибку
        return;
      }
  
      console.log("Успешный вход:", response.user);
    } catch (error) {
      console.error("Ошибка входа:", error.message);
      setError(error.message || "Ошибка при входе. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };
  

  const fixedPositions = [
    { top: "5%", left: "10%" },
    { top: "20%", left: "75%" },
    { top: "80%", left: "5%" },
    { top: "80%", left: "80%" },
    { top: "70%", left: "25%" },
    { top: "10%", left: "50%" },
    { top: "85%", left: "10%" },
    { top: "30%", left: "85%" },
  ];

  const images = ["reg1.png", "reg2.png", "reg3.png", "reg1.png", "reg2.png", "reg3.png"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gray-50 overflow-hidden">
      <button
        className="text-2xl w-86 text-white font-bold text-gray-800 bg-blue-500 py-1 px-3 rounded-lg hover:bg-blue-400 transition duration-300 flex items-center z-50 max-w-3/4"
        onClick={handleSignIn}
        disabled={loading} // Отключаем кнопку при загрузке
      >
        <img
          src="reg4.png"
          alt="Image reg"
          className={`w-15 h-20 object-contain transition-transform duration-500 mr-5 ${loading ? "animate-spin" : ""}`}
        />
        <p className="ml-auto mr-auto">
            Войдите в PencilCoin
        </p>
      </button>
      <p className="text-black mt-4">Нет аккаунта? <Link to="/auth/signin" className="text-blue-500">Создать</Link></p>

      {error && <p className="text-red-500 mt-4">{error}</p>}
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

export default LoginPage;
