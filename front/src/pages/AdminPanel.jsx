import { useState, useEffect } from "react";
import { db, auth } from "../components/firebase";
import { getIdTokenResult } from "firebase/auth";
import { doc, runTransaction } from "firebase/firestore";

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [bonus, setBonus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Для отображения успешных сообщений

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      try {
        await user.getIdToken(true); // Принудительно обновляем токен
        const token = await getIdTokenResult(user);
        setIsAdmin(token.claims.admin === true);
      } catch (error) {
        console.error("Ошибка при проверке админа:", error);
        setIsAdmin(false);
      }
    };
  
    checkAdmin();
  }, []);
  

  const createPromoCode = async () => {
    if (!promoCode || !bonus) return alert("Введите промокод и сумму!");
    if (isNaN(bonus) || bonus <= 0) return alert("Сумма бонуса должна быть положительным числом!");

    setLoading(true);
    setError("");
    setSuccessMessage(""); // Очистить сообщение об успехе перед новой попыткой

    try {
      const promoRef = doc(db, "promoCodes", promoCode);

      // Используем транзакцию для безопасного создания промокода
      await runTransaction(db, async (transaction) => {
        const promoSnapshot = await transaction.get(promoRef);
        if (promoSnapshot.exists()) {
          throw new Error("Промокод с таким названием уже существует.");
        }

        // Если промокод не существует, создаем новый
        transaction.set(promoRef, {
          bonus: parseFloat(bonus),
          createdAt: new Date(),
        });
      });

      setSuccessMessage(`Промокод ${promoCode} успешно создан!`);
      setPromoCode("");
      setBonus("");
    } catch (error) {
      console.error("Ошибка создания промокода:", error);
      setError(error.message || "Ошибка при создании промокода. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <p>У вас нет доступа к этой странице.</p>;

  return (
    <div>
      <h2>Панель Администратора</h2>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Введите промокод"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
      />
      <input
        type="number"
        placeholder="Бонус"
        value={bonus}
        onChange={(e) => setBonus(e.target.value)}
      />
      <button onClick={createPromoCode} disabled={loading}>
        {loading ? "Создание..." : "Создать промокод"}
      </button>
    </div>
  );
};

export default AdminPanel;
