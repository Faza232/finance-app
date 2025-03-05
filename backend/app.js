// backend/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// bcrypt
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/register', async (req, res) => {
    const { nama, email, password } = req.body;
  
    // Cek apakah email sudah terdaftar
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking email:', err);
        return res.status(500).send('Error checking email');
      }
  
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Simpan user baru ke database
      const insertUserQuery = 'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [nama, email, hashedPassword], (err, results) => {
        if (err) {
          console.error('Error registering user:', err);
          return res.status(500).send('Error registering user');
        }
        res.status(201).json({ message: 'Registrasi berhasil' });
      });
    });
  });
  
  // backend/app.js
  app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;
    
      // Cari user berdasarkan email
      const findUserQuery = 'SELECT * FROM users WHERE email = ?';
      db.query(findUserQuery, [email], async (err, results) => {
        if (err) {
          console.error('Error finding user:', err);
          return res.status(500).send('Error finding user');
        }
    
        if (results.length === 0) {
          return res.status(400).json({ message: 'Email atau password salah' });
        }
    
        const user = results[0];
    
        // Bandingkan password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Email atau password salah' });
        }
    
        // Buat token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, 'secret_key', { expiresIn: '1h' });
    
        res.json({ token });
      });
    });

// backend/app.js
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }
  
    jwt.verify(token, 'secret_key', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token tidak valid' });
      }
      req.user = user;
      next();
    });
  };
  
  // Contoh endpoint yang diproteksi
  app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Ini adalah endpoint yang diproteksi', user: req.user });
  });

// backend/app.js
app.get('/api/transactions', (req, res) => {
    const query = 'SELECT * FROM transactions';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).send('Error fetching transactions');
        return;
      }
      res.json(results);
    });
  });

  // backend/app.js
app.post('/api/transactions', (req, res) => {
    const { tanggal, deskripsi, jenis_transaksi, jumlah } = req.body;
  
    const query = `
      INSERT INTO transactions (tanggal, deskripsi, jenis_transaksi, jumlah)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [tanggal, deskripsi, jenis_transaksi, jumlah], (err, results) => {
      if (err) {
        console.error('Error creating transaction:', err);
        res.status(500).send('Error creating transaction');
        return;
      }
      res.status(201).json({ id: results.insertId, tanggal, deskripsi, jenis_transaksi, jumlah });
    });
  });

  // backend/app.js
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { tanggal, deskripsi, jenis_transaksi, jumlah } = req.body;
  
    const query = `
      UPDATE transactions
      SET tanggal = ?, deskripsi = ?, jenis_transaksi = ?, jumlah = ?
      WHERE id = ?
    `;
    db.query(query, [tanggal, deskripsi, jenis_transaksi, jumlah, id], (err, results) => {
      if (err) {
        console.error('Error updating transaction:', err);
        res.status(500).send('Error updating transaction');
        return;
      }
      res.json({ id, tanggal, deskripsi, jenis_transaksi, jumlah });
    });
  });

  // backend/app.js
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
  
    const query = 'DELETE FROM transactions WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).send('Error deleting transaction');
        return;
      }
      res.status(204).send();
    });
  });