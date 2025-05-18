// server.js
require('dotenv').config();           // 1) Load .env variables into process.env
const express = require('express');
const mysql   = require('mysql2');
const bcrypt  = require('bcrypt');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// 2) Middleware
app.use(cors());
app.use(express.json());              // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// 3) Serve your static front‐end
app.use(express.static(path.join(__dirname)));  

// 4) MySQL connection pool
const db = mysql.createPool({
  host:     process.env.DB_SERVER,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     3306,
  ssl:      { rejectUnauthorized: false }  // false if you haven’t set up certs
});

// Optional health check & debug
db.getConnection((err, conn) => {
  if (err)  console.error('DB Connection Error ❌', err);
  else {
    console.log('DB Connected ✅');
    conn.release();
  }
});

// 5) Sign‑up endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Missing username or password' });

    const hash = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO Users (Username, PasswordHash) VALUES (?, ?)',
      [username, hash],
      (err) => {
        if (err) {
          console.error('Signup Error:', err);      // ← logs exact DB error
          if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'Username already exists' });
          return res.status(500).json({ error: 'Signup failed' });
        }
        res.status(201).json({ message: 'Signup successful' });
      }
    );
  } catch (err) {
    console.error('Signup Handler Error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// 6) Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Missing username or password' });

    db.query(
      'SELECT PasswordHash FROM Users WHERE Username = ?',
      [username],
      (err, results) => {
        if (err) {
          console.error('Login Error:', err);
          return res.status(500).json({ error: 'Login failed' });
        }
        if (!results.length)
          return res.status(401).json({ error: 'Invalid credentials' });

        bcrypt.compare(password, results[0].PasswordHash, (err, match) => {
          if (err || !match)
            return res.status(401).json({ error: 'Invalid credentials' });
          res.json({ message: 'Login successful' });
        });
      }
    );
  } catch (err) {
    console.error('Login Handler Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 7) Serve your main page(s)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// 8) Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});
