const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors()); // Разрешает все источники

const app = express();
const port = 3000;

// Инициализация Firebase Admin SDK
const serviceAccount = require('C:/Users/klima/Documents/secret/pcoin-4b4b5-firebase-adminsdk-fbsvc-10e4182f03.json'); // Путь к вашему файлу с учетными данными
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pcoin-4b4b5.firebaseio.com" // Убедитесь, что это правильный URL для вашего Firebase DB
});

// Middleware для парсинга JSON
app.use(bodyParser.json());

// Middleware для проверки токена
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Получаем токен из заголовка

  if (!token) {
    return res.status(403).send('No token provided');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Добавляем информацию о пользователе в запрос
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};

// Маршрут для получения баланса пользователя
app.get('/balance', verifyToken, async (req, res) => {
  const userId = req.user.uid;  // Получаем uid пользователя из токена

  try {
    const userRef = admin.firestore().doc(`users/${userId}`);
    const doc = await userRef.get();

    if (doc.exists) {
      res.json({ balance: doc.data().balance });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving balance');
  }
});

// Маршрут для обновления баланса
app.post('/update-balance', verifyToken, async (req, res) => {
  const { amount } = req.body; // Получаем amount из тела запроса
  const userId = req.user.uid;  // Получаем uid пользователя из токена

  try {
    const userRef = admin.firestore().doc(`users/${userId}`);
    const doc = await userRef.get();

    if (doc.exists) {
      const currentBalance = doc.data().balance;
      const newBalance = currentBalance + amount;
      await userRef.update({ balance: newBalance });
      res.json({ balance: newBalance });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error updating balance');
  }
});

// Маршрут для регистрации/входа пользователя (через Google)
app.post('/sign-in', async (req, res) => {
  const idToken = req.body.idToken; // Токен, полученный с клиента

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = decodedToken;

    res.json({ message: 'Signed in successfully', user });
  } catch (error) {
    res.status(400).send('Invalid ID token');
  }
});

// Маршрут для выхода
app.post('/log-out', (req, res) => {
  // Логика для выхода (обычно на сервере этого не требуется)
  res.json({ message: 'Logged out' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
