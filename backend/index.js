require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gustomenu_secret_key_123';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role_id === 1) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'GustoMenu API is running 🚀' });
});

// --- Restaurantes ---
app.get('/api/restaurantes', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM restaurantes ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/restaurantes/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { rows } = await db.query('SELECT * FROM restaurantes WHERE slug = ?', [slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Restaurante not found' });
    
    // Get dishes for this restaurant
    const dishes = await db.query('SELECT * FROM platillos WHERE restaurante_id = ? ORDER BY orden ASC', [rows[0].id]);
    
    res.json({ ...rows[0], platillos: dishes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/restaurantes', authenticateToken, async (req, res) => {
  const { slug, nombre, whatsapp, whatsapp_opcional, tema, imagen_url } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO restaurantes (slug, nombre, whatsapp, whatsapp_opcional, tema, imagen_url) VALUES (?, ?, ?, ?, ?, ?)',
      [slug, nombre, whatsapp, whatsapp_opcional, tema, imagen_url]
    );
    res.status(201).json({ id: rows.insertId, slug, nombre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating restaurante' });
  }
});

// --- Platillos ---
app.post('/api/platillos', authenticateToken, async (req, res) => {
  const { restaurante_id, nombre, precio, emoji, orden } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO platillos (restaurante_id, nombre, precio, emoji, orden) VALUES (?, ?, ?, ?, ?)',
      [restaurante_id, nombre, precio, emoji, orden]
    );
    res.status(201).json({ id: rows.insertId, restaurante_id, nombre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating platillo' });
  }
});

// --- Usuarios & Auth ---
app.post('/api/register', authenticateToken, isAdmin, async (req, res) => {
  const { username, password, email, role_id } = req.body;
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      'INSERT INTO users (username, password, email, role_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role_id || 2]
    );
    res.status(201).json({ id: rows.insertId, username, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, username: user.username, role_id: user.role_id } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login error' });
  }
});

// --- Users List (Admin Only) ---
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, username, email, role_id, created_at FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
