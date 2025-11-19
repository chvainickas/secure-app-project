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
  // Will implement with plain text password storage
  res.send('Register endpoint - to be implemented');
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
};
