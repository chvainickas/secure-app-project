const db = require('../config/database');

// SECURE: Middleware to check admin role
exports.requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.role !== 'admin') {
    // SECURE: Return 403 Forbidden for non-admin users
    return res.status(403).send('Access denied. Admin privileges required.');
  }

  next();
};

exports.getAdminPanel = (req, res) => {
  // Auth check is handled by requireAdmin middleware

  const usersQuery = 'SELECT id, username, email, role, created_at FROM users';
  const tasksQuery = 'SELECT tasks.*, users.username FROM tasks JOIN users ON tasks.user_id = users.id ORDER BY tasks.created_at DESC';

  db.all(usersQuery, (err, users) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      return res.status(500).send('An error occurred');
    }

    db.all(tasksQuery, (err, tasks) => {
      if (err) {
        console.error('Error fetching tasks:', err.message);
        return res.status(500).send('An error occurred');
      }

      res.render('admin', {
        user: req.session.user,
        users: users,
        tasks: tasks,
        csrfToken: req.csrfToken()
      });
    });
  });
};

exports.deleteUser = (req, res) => {
  // Auth check is handled by requireAdmin middleware
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (parseInt(userId) === req.session.user.id) {
    return res.status(400).send('Cannot delete your own account');
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) {
      console.error('Error deleting user:', err.message);
      return res.status(500).send('An error occurred');
    }
    res.redirect('/admin');
  });
};

exports.deleteAnyTask = (req, res) => {
  // Auth check is handled by requireAdmin middleware
  const taskId = req.params.id;

  db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
    if (err) {
      console.error('Error deleting task:', err.message);
      return res.status(500).send('An error occurred');
    }
    res.redirect('/admin');
  });
};
