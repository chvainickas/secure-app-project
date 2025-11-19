const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration (insecure for demonstration)
app.use(session({
  secret: 'insecure-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // No HTTPS requirement
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Home route
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/tasks');
  } else {
    res.redirect('/auth/login');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
