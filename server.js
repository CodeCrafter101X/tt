import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// إعداد قاعدة البيانات
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers (id)
      )
    `);
  });
});

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// إضافة عميل جديد
app.post('/customers', (req, res) => {
  const { firstName, lastName, phone, address } = req.body;
  db.run(
    'INSERT INTO customers (firstName, lastName, phone, address) VALUES (?, ?, ?, ?)',
    [firstName, lastName, phone, address],
    function(err) {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// الحصول على قائمة العملاء
app.get('/customers', (req, res) => {
  db.all('SELECT * FROM customers', (err, rows) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json(rows);
  });
});

// إضافة مشتريات
app.post('/purchases', (req, res) => {
  const { customerId, amount, description } = req.body;
  db.run(
    'INSERT INTO purchases (customerId, amount, description) VALUES (?, ?, ?)',
    [customerId, amount, description],
    function(err) {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// الحصول على مشتريات عميل معين
app.get('/customers/:id/purchases', (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM purchases WHERE customerId = ? ORDER BY date DESC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});