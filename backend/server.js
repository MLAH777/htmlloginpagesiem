const express = require('express');
const { Connection, Request } = require('tedious');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Azure SQL Database configuration
const config = {
  server: azurethreatdetectionproject-server,
  authentication: {
    type: 'default',
    options: {
      userName: bllvowpspx,
      password: aTX4jSbrbZttFI$H,
    },
  },
  options: {
    database: azurethreatdetectionproject-database,
    encrypt: true,
    trustServerCertificate: false,
    port: 1433,
  },
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const connection = new Connection(config);
    connection.connect((err) => {
      if (err) {
        console.error('Connection error:', err);
        return res.status(500).json({ error: 'Database connection failed' });
      }

      const query = `INSERT INTO Users (Username, PasswordHash) VALUES (@username, @passwordHash)`;
      const request = new Request(query, (err) => {
        if (err) {
          console.error('Query error:', err);
          if (err.code === 'EREQUEST' && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Signup failed' });
        }
        res.status(201).json({ message: 'Signup successful' });
      });

      request.addParameter('username', TYPES.NVarChar, username);
      request.addParameter('passwordHash', TYPES.NVarChar, passwordHash);
      connection.execSql(request);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const query = `SELECT PasswordHash FROM Users WHERE Username = @username`;
    const request = new Request(query, (err, rowCount) => {
      if (err) {
        console.error('Query error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      if (rowCount === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    });

    request.addParameter('username', TYPES.NVarChar, username);
    request.on('row', (columns) => {
      const passwordHash = columns[0].value;
      bcrypt.compare(password, passwordHash, (err, result) => {
        if (err || !result) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }
        res.json({ message: 'Login successful' });
      });
    });

    connection.execSql(request);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
