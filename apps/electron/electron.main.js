const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/goals.db');
const db = new Database(dbPath);

try {
  const row = db.prepare('SELECT 1 as result').get();
  console.log('DB SELECT 1 result:', row.result);
} catch (err) {
  console.error('DB test query failed:', err);
}
