const admin = require("firebase-admin");

// Инициализируем Firebase Admin SDK (укажите путь к вашему serviceAccountKey.json)
const serviceAccount = require('C:/Users/klima/Documents/secret/pcoin-4b4b5-firebase-adminsdk-fbsvc-10e4182f03.json'); // Путь к вашему файлу с учетными данными
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pcoin-4b4b5.firebaseio.com" // Убедитесь, что это правильный URL для вашего Firebase DB
});


const listAdmins = async () => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const admins = listUsersResult.users.filter(user => user.customClaims && user.customClaims.admin);
    
    if (admins.length === 0) {
      console.log("Администраторов не найдено.");
    } else {
      console.log("Список администраторов:");
      admins.forEach(user => console.log(`UID: ${user.uid}, Email: ${user.email}`));
    }
  } catch (error) {
    console.error("Ошибка получения списка администраторов:", error);
  }
};

listAdmins();
