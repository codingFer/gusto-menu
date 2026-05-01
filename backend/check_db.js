const db = require('./db');

async function check() {
  try {
    const { rows: users } = await db.query('SELECT id, username, role_id FROM users');
    console.log('Users:', users);
    
    const { rows: rests } = await db.query('SELECT id, nombre, user_id FROM restaurantes');
    console.log('Restaurants:', rests);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
