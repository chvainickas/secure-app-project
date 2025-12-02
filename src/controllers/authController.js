const db = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

exports.getLogin = (req, res) => {
  res.render('login', { error: null, csrfToken: req.csrfToken() });
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  // SECURE: Using parameterized query to prevent SQL injection
  const query = 'SELECT * FROM users WHERE email = ?';

  db.get(query, [email], async (err, user) => {
    if (err) {
      // SECURE: Generic error message, no database details exposed
      console.error('Login error:', err.message);
      return res.render('login', {
        error: 'An error occurred. Please try again.',
        csrfToken: req.csrfToken()
      });
    }

    if (!user) {
      return res.render('login', {
        error: 'Invalid email or password',
        csrfToken: req.csrfToken()
      });
    }

    // SECURE: Compare password with bcrypt hash
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.render('login', {
          error: 'Invalid email or password',
          csrfToken: req.csrfToken()
        });
      }
    } catch (bcryptErr) {
      console.error('Bcrypt error:', bcryptErr.message);
      return res.render('login', {
        error: 'An error occurred. Please try again.',
        csrfToken: req.csrfToken()
      });
    }

    // SECURE: Regenerate session ID to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err.message);
        return res.render('login', {
          error: 'An error occurred. Please try again.',
          csrfToken: req.csrfToken()
        });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      res.redirect('/tasks');
    });
  });
};

exports.getRegister = (req, res) => {
  res.render('register', { error: null, csrfToken: req.csrfToken() });
};

exports.postRegister = async (req, res) => {
  const { username, email, password } = req.body;

  // SECURE: Hash password with bcrypt before storing
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';

    db.run(query, [username, email, hashedPassword, 'user'], function(err) {
      if (err) {
        // SECURE: Generic error message
        console.error('Registration error:', err.message);
        return res.render('register', {
          error: 'Registration failed. Please try again.',
          csrfToken: req.csrfToken()
        });
      }

      // Regenerate session before setting user data
      req.session.regenerate((sessionErr) => {
        if (sessionErr) {
          console.error('Session error:', sessionErr.message);
          return res.redirect('/auth/login');
        }

        req.session.user = {
          id: this.lastID,
          username: username,
          email: email,
          role: 'user'
        };

        res.redirect('/tasks');
      });
    });
  } catch (hashErr) {
    console.error('Hash error:', hashErr.message);
    return res.render('register', {
      error: 'Registration failed. Please try again.',
      csrfToken: req.csrfToken()
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
    }
    res.redirect('/auth/login');
  });
};
