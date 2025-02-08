// src/api/api.js

// Функция для получения баланса с сервера
export const getBalanceFromAPI = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/balance?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.balance;
      } else {
        throw new Error('Не удалось получить баланс');
      }
    } catch (error) {
      console.error('Ошибка при получении баланса:', error);
      return 0;
    }
  };
  
  // Функция для обновления баланса на сервере
  export const updateBalanceOnAPI = async (userId, amount) => {
    try {
      const response = await fetch('http://localhost:3000/update-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount }),
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.balance;
      } else {
        throw new Error('Не удалось обновить баланс');
      }
    } catch (error) {
      console.error('Ошибка при обновлении баланса:', error);
      return null;
    }
  };
  