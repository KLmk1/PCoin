// admin.js
const admin = require('firebase-admin');

// Инициализируем Firebase Admin SDK
const serviceAccount = require('C:/Users/klima/Documents/secret/pcoin-4b4b5-firebase-adminsdk-fbsvc-10e4182f03.json'); // Путь к вашему файлу с учетными данными
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pcoin-4b4b5.firebaseio.com" // Убедитесь, что это правильный URL для вашего Firebase DB
});

const addAdminRole = async (uid) => {
  try {
    // Устанавливаем custom claim для пользователя
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Пользователь ${uid} теперь является администратором.`);
  } catch (error) {
    console.error('Ошибка назначения роли администратора:', error);
  }
};

// Пример использования
const uid = 'cmyALNFCAkeDESvciJM9Sf1owIG2'; // Укажите UID пользователя
addAdminRole(uid);
