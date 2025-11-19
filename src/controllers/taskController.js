const db = require('../config/database');

exports.getTasks = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';

  db.all(query, [req.session.user.id], (err, tasks) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching tasks');
    }
    res.render('tasks', { user: req.session.user, tasks: tasks });
  });
};

exports.searchTasks = (req, res) => {
  // Will implement with XSS vulnerability
  res.send('Search endpoint - to be implemented');
};

exports.getNewTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('new-task', { user: req.session.user });
};

exports.postNewTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { title, description } = req.body;
  const query = 'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)';

  db.run(query, [req.session.user.id, title, description], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error creating task');
    }
    res.redirect('/tasks');
  });
};

exports.getEditTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const taskId = req.params.id;
  const query = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';

  db.get(query, [taskId, req.session.user.id], (err, task) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching task');
    }
    if (!task) {
      return res.status(404).send('Task not found');
    }
    res.render('edit-task', { user: req.session.user, task: task });
  });
};

exports.postEditTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const taskId = req.params.id;
  const { title, description } = req.body;
  const query = 'UPDATE tasks SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';

  db.run(query, [title, description, taskId, req.session.user.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating task');
    }
    res.redirect('/tasks');
  });
};

exports.deleteTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const taskId = req.params.id;
  const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';

  db.run(query, [taskId, req.session.user.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error deleting task');
    }
    res.redirect('/tasks');
  });
};
