require('dotenv').config();   // Load .env

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Hardcoded test users
const users = [
  { username: 'admin', password: '1234' },
  { username: 'test', password: 'abcd' }
];

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    return res.json({ success: true, message: 'Login successful!' });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/', (req, res) => res.send('Backend running!'));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
