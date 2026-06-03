const db = require('./db');

async function migrate() {
  try {
    console.log('Running migration: adding acompanamientos column to platillos table...');
    await db.query('ALTER TABLE platillos ADD COLUMN acompanamientos TEXT NULL');
    console.log('Migration successful!');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column acompanamientos already exists, skipping.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    process.exit();
  }
}

migrate();
