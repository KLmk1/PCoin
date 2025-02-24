import { useState } from "react";
import { createPromoCode } from "../components/firebase";

const AdminPanel = () => {
  const [promoCode, setPromoCode] = useState("");
  const [bonus, setBonus] = useState(100);
  const [message, setMessage] = useState("");

  const handleCreatePromo = async () => {
    if (!promoCode.trim()) {
      setMessage("Введите промокод!");
      return;
    }

    const result = await createPromoCode(promoCode, Number(bonus));
    setMessage(result.message);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Создать промокод</h2>
      <input
        type="text"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
        placeholder="Введите промокод"
        className="border p-2 mr-2"
      />
      <input
        type="number"
        value={bonus}
        onChange={(e) => setBonus(e.target.value)}
        placeholder="Бонус"
        className="border p-2 mr-2"
      />
      <button
        onClick={handleCreatePromo}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Создать
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
};

export default AdminPanel;
