const db = require('../config/database');

exports.getLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  // VULNERABILITY: SQL Injection - using string concatenation instead of parameterized queries
  const query = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;

  db.get(query, (err, user) => {
    if (err) {
      // VULNERABILITY: Exposing detailed database errors
      return res.render('login', {
        error: `Database error: ${err.message}`
      });
    }

    if (!user) {
      return res.render('login', {
        error: 'Invalid email or password'
      });
    }

    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.redirect('/tasks');
  });
};

exports.getRegister = (req, res) => {
  res.render('register', { error: null });
};

exports.postRegister = (req, res) => {
  const { username, email, password } = req.body;

  // VULNERABILITY: Storing password in plain text (no hashing)
  const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')`;

  db.run(query, [username, email, password], function(err) {
    if (err) {
      // VULNERABILITY: Exposing detailed error messages
      return res.render('register', {
        error: `Registration failed: ${err.message}`
      });
    }

    // Auto-login after registration
    req.session.user = {
      id: this.lastID,
      username: username,
      email: email,
      role: 'user'
    };

    res.redirect('/tasks');
  });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
};
