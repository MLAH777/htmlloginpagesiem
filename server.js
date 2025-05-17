const express = require('express');
const mysql   = require('mysql2');
const bcrypt  = require('bcrypt');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML/CSS/JS)
app.use(express.static(path.join(__dirname)));

// JSON parsing + CORS
app.use(express.json());
app.use(cors());

// MySQL Azure connection
const db = mysql.createPool({
  host:     process.env.DB_SERVER,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     3306,
  ssl:      { rejectUnauthorized: true }
});

// Signup route
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO Users (Username, PasswordHash) VALUES (?, ?)',
      [username, hash],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY')
            return res.status(400).json({ error: 'Username already exists' });
          return res.status(500).json({ error: 'Signup failed' });
        }
        res.status(201).json({ message: 'Signup successful' });
      }
    );
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  db.query(
    'SELECT PasswordHash FROM Users WHERE Username = ?',
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      if (!results.length) return res.status(401).json({ error: 'Invalid username or password' });

      bcrypt.compare(password, results[0].PasswordHash, (err, match) => {
        if (err || !match)
          return res.status(401).json({ error: 'Invalid username or password' });
        res.json({ message: 'Login successful' });
      });
    }
  );
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
