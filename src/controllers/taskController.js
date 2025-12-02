const db = require('../config/database');

exports.getTasks = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';

  db.all(query, [req.session.user.id], (err, tasks) => {
    if (err) {
      console.error('Error fetching tasks:', err.message);
      return res.status(500).send('An error occurred');
    }
    res.render('tasks', { user: req.session.user, tasks: tasks, csrfToken: req.csrfToken() });
  });
};

exports.searchTasks = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.redirect('/tasks');
  }

  // SECURE: Using parameterized query to prevent SQL injection
  const query = 'SELECT * FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)';
  const searchPattern = `%${searchQuery}%`;

  db.all(query, [req.session.user.id, searchPattern, searchPattern], (err, tasks) => {
    if (err) {
      // SECURE: Generic error message
      console.error('Search error:', err.message);
      return res.render('search-results', {
        user: req.session.user,
        searchQuery: searchQuery,
        tasks: [],
        error: 'An error occurred while searching',
        csrfToken: req.csrfToken()
      });
    }

    res.render('search-results', {
      user: req.session.user,
      searchQuery: searchQuery,
      tasks: tasks,
      error: null,
      csrfToken: req.csrfToken()
    });
  });
};

exports.getNewTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('new-task', { user: req.session.user, csrfToken: req.csrfToken() });
};

exports.postNewTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { title, description } = req.body;
  const query = 'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)';

  db.run(query, [req.session.user.id, title, description], (err) => {
    if (err) {
      console.error('Error creating task:', err.message);
      return res.status(500).send('An error occurred');
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
      console.error('Error fetching task:', err.message);
      return res.status(500).send('An error occurred');
    }
    if (!task) {
      return res.status(404).send('Task not found');
    }
    res.render('edit-task', { user: req.session.user, task: task, csrfToken: req.csrfToken() });
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
      console.error('Error updating task:', err.message);
      return res.status(500).send('An error occurred');
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
      console.error('Error deleting task:', err.message);
      return res.status(500).send('An error occurred');
    }
    res.redirect('/tasks');
  });
};
