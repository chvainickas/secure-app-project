const db = require('../config/database');

exports.getAdminPanel = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  // VULNERABILITY: Weak authorization - only checking if user exists, not if they're admin
  // Any logged-in user can access admin panel by visiting the URL

  const usersQuery = 'SELECT id, username, email, role, created_at FROM users';
  const tasksQuery = 'SELECT tasks.*, users.username FROM tasks JOIN users ON tasks.user_id = users.id ORDER BY tasks.created_at DESC';

  db.all(usersQuery, (err, users) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }

    db.all(tasksQuery, (err, tasks) => {
      if (err) {
        return res.status(500).send('Error fetching tasks');
      }

      res.render('admin', {
        user: req.session.user,
        users: users,
        tasks: tasks
      });
    });
  });
};

exports.deleteUser = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  // VULNERABILITY: No admin role verification - any logged-in user can delete others
  const userId = req.params.id;

  db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) {
      return res.status(500).send('Error deleting user');
    }
    res.redirect('/admin');
  });
};

exports.deleteAnyTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  // VULNERABILITY: No admin role verification - any logged-in user can delete any task
  const taskId = req.params.id;

  db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
    if (err) {
      return res.status(500).send('Error deleting task');
    }
    res.redirect('/admin');
  });
};
