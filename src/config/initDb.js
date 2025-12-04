const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite3');
const SALT_ROUNDS = 12;

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create tables
db.serialize(async () => {
  // Users table - SECURE: passwords will be stored as bcrypt hashes
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      failed_login_attempts INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created successfully');
    }
  });

  // Tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating tasks table:', err.message);
    } else {
      console.log('Tasks table created successfully');
    }
  });

  // Sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating sessions table:', err.message);
    } else {
      console.log('Sessions table created successfully');
    }
  });

  // Logs table for security event logging
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      level TEXT NOT NULL,
      user_id INTEGER,
      action TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating logs table:', err.message);
    } else {
      console.log('Logs table created successfully');
    }
  });

  // SECURE: Create admin user with bcrypt hashed password
  try {
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    db.run(`
      INSERT OR IGNORE INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `, ['admin', 'admin@example.com', hashedPassword, 'admin'], (err) => {
      if (err) {
        console.error('Error creating admin user:', err.message);
      } else {
        console.log('Default admin user created (username: admin, password: admin123)');
        console.log('Note: Password is securely hashed with bcrypt');
      }

      console.log('\nDatabase initialization complete!');
      console.log('Run "npm start" to start the application\n');

      db.close();
    });
  } catch (hashErr) {
    console.error('Error hashing password:', hashErr.message);
    db.close();
  }
});
