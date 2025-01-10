// backend/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the SQLite DB
const dbPath = path.join(__dirname, '..', 'employment.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if not exist
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  // EmploymentRecords table
  db.run(`
    CREATE TABLE IF NOT EXISTS EmploymentRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      ssn TEXT,
      job_start_date TEXT,
      job_end_date TEXT,
      status TEXT,
      job_type TEXT,
      organization_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Preload 2 org users, 1 worker user, and 1 admin user if not exist
  const usersToPreload = [
    { email: 'org1@example.com',    password: 'orgpass1',    role: 'org' },
    { email: 'org2@example.com',    password: 'orgpass2',    role: 'org' },
    { email: 'worker1@example.com', password: 'workerpass',  role: 'worker' },
    { email: 'admin@example.com',   password: 'adminpass',   role: 'admin' } // ADMIN
  ];

  usersToPreload.forEach((user) => {
    db.run(
      `INSERT OR IGNORE INTO Users (email, password, role) VALUES (?, ?, ?)`,
      [user.email, user.password, user.role]
    );
  });
});

module.exports = db;
