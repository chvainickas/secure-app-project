const db = require('../config/database');

exports.getLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.postLogin = (req, res) => {
  // Will implement with SQL injection vulnerability
  res.send('Login endpoint - to be implemented');
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
