const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gustomenu_secret_key_123';

app.use(cors());
app.use(express.json());

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role_id !== 1) return res.status(403).json({ error: 'Admin access required' });
  next();
};

// --- Routes ---

app.get('/', (req, res) => {
  res.json({ message: 'GustoMenu API is running 🚀' });
});

// --- Update User (Admin Only) ---
app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, role_id, password } = req.body;
  
  try {
    let query = 'UPDATE users SET username = ?, email = ?, role_id = ?';
    let params = [username, email, role_id];

    // If password is provided, hash it and update
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// --- Restaurantes ---
app.get('/api/restaurantes', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT r.*, u.username as owner_name 
      FROM restaurantes r 
      LEFT JOIN users u ON r.user_id = u.id 
      ORDER BY r.nombre ASC
    `;
    let params = [];

    // If not admin, only show their own restaurants
    if (req.user.role_id !== 1) {
      query = `
        SELECT r.*, u.username as owner_name 
        FROM restaurantes r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.user_id = ? 
        ORDER BY r.nombre ASC
      `;
      params = [req.user.id];
    }

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching restaurants' });
  }
});

app.get('/api/restaurantes/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM restaurantes WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Restaurante not found' });
    
    const dishes = await db.query('SELECT * FROM platillos WHERE restaurante_id = ? ORDER BY orden ASC', [id]);
    res.json({ ...rows[0], platillos: dishes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching restaurant' });
  }
});

app.get('/api/restaurantes/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { rows } = await db.query('SELECT * FROM restaurantes WHERE slug = ?', [slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Restaurante not found' });
    
    const dishes = await db.query('SELECT * FROM platillos WHERE restaurante_id = ? ORDER BY orden ASC', [rows[0].id]);
    res.json({ ...rows[0], platillos: dishes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching restaurant' });
  }
});

app.post('/api/restaurantes', authenticateToken, async (req, res) => {
  const { slug, nombre, whatsapp, whatsapp_opcional, tema, imagen_url } = req.body;
  const user_id = req.user.id;
  try {
    const { rows } = await db.query(
      'INSERT INTO restaurantes (slug, nombre, whatsapp, whatsapp_opcional, tema, imagen_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [slug, nombre, whatsapp, whatsapp_opcional, tema, imagen_url, user_id]
    );
    res.status(201).json({ id: rows.insertId, slug, nombre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating restaurante' });
  }
});

app.put('/api/restaurantes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, whatsapp, slug } = req.body;
  const user_id = req.user.id;

  try {
    // Check ownership
    const { rows: check } = await db.query('SELECT * FROM restaurantes WHERE id = ?', [id]);
    if (check.length === 0) return res.status(404).json({ error: 'Not found' });
    if (check[0].user_id !== user_id && req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.query(
      'UPDATE restaurantes SET nombre = ?, whatsapp = ?, slug = ? WHERE id = ?',
      [nombre, whatsapp, slug, id]
    );
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating' });
  }
});

app.post('/api/restaurantes/full', authenticateToken, async (req, res) => {
  const { restaurante_id, items, name, theme, tagline, promo, direccion, guarniciones } = req.body;
  const user_id = req.user.id;
  
  try {
    // 1. Check ownership
    const { rows: resRows } = await db.query('SELECT user_id FROM restaurantes WHERE id = ?', [restaurante_id]);
    if (resRows.length === 0) return res.status(404).json({ error: 'Restaurante not found' });
    if (resRows[0].user_id !== user_id && req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // 2. Update restaurante metadata
    await db.query(
      'UPDATE restaurantes SET nombre = ?, tema = ?, direccion = ? WHERE id = ?',
      [name, theme, direccion, restaurante_id]
    );

    // 3. Clear existing data
    await db.query('DELETE FROM platillo_guarniciones WHERE platillo_id IN (SELECT id FROM platillos WHERE restaurante_id = ?)', [restaurante_id]);
    await db.query('DELETE FROM platillos WHERE restaurante_id = ?', [restaurante_id]);
    await db.query('DELETE FROM guarniciones WHERE restaurante_id = ?', [restaurante_id]);

    // 4. Insert Guarniciones
    const guarnicionesArray = guarniciones ? guarniciones.split(',').map(s => s.trim()).filter(s => s) : [];
    for (const gName of guarnicionesArray) {
      await db.query('INSERT INTO guarniciones (restaurante_id, nombre) VALUES (?, ?)', [restaurante_id, gName]);
    }

    // 5. Insert Platillos with correct tipo_id
    // Mapping: sopa -> 1, segundo -> 2, segundo suelto -> 3, postre -> 4, bebida -> 5
    const typeMap = { 'sopa': 1, 'segundo': 2, 'segundo suelto': 3, 'postre': 4, 'bebida': 5, 'standard': 2 };
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const tipoId = typeMap[item.type] || 2;
      
      await db.query(
        'INSERT INTO platillos (restaurante_id, tipo_id, nombre, precio, emoji, orden) VALUES (?, ?, ?, ?, ?, ?)',
        [restaurante_id, tipoId, item.name, item.price || 0, item.emoji, i]
      );
    }

    res.json({ message: 'Menu saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving full menu' });
  }
});

// --- Usuarios & Auth ---
app.post('/api/register', async (req, res) => {
  const { username, password, email, role_id, restaurant_name, whatsapp } = req.body;
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Create user
    const { rows: userRows } = await db.query(
      'INSERT INTO users (username, password, email, role_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role_id || 2]
    );
    const newUserId = userRows.insertId;

    // 2. Create restaurant with provided data or defaults
    const defaultSlug = `${username.toLowerCase()}-menu-${Math.floor(Math.random() * 1000)}`;
    await db.query(
      'INSERT INTO restaurantes (user_id, slug, nombre, whatsapp, tema) VALUES (?, ?, ?, ?, ?)',
      [
        newUserId, 
        defaultSlug, 
        restaurant_name || `Menú de ${username}`, 
        whatsapp || '59100000000', 
        'light'
      ]
    );

    res.status(201).json({ id: newUserId, username, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role_id: user.role_id }, JWT_SECRET, { expiresIn: '7d' });
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

app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, username, email, role_id, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/tipos-platillo', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM tipos_platillo ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching types' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
