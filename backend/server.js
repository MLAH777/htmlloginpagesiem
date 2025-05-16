const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (like home.html, login.html, etc.)
app.use(express.static(path.join(__dirname, '..')));

// Create MySQL connection
const db = mysql.createPool({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: {
    rejectUnauthorized: true
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const insertQuery = 'INSERT INTO Users (Username, PasswordHash) VALUES (?, ?)';
    db.query(insertQuery, [username, passwordHash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username already exists' });
        }
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Signup failed' });
      }
      res.status(201).json({ message: 'Signup successful' });
    });
  } catch (err) {
    console.error('Hashing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const selectQuery = 'SELECT PasswordHash FROM Users WHERE Username = ?';
  db.query(selectQuery, [username], (err, results) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordHash = results[0].PasswordHash;
    bcrypt.compare(password, passwordHash, (err, match) => {
      if (err || !match) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      res.json({ message: 'Login successful' });
    });
  });
});

// 👇 This should be at the bottom, only once
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
