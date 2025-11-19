const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getTasks);
router.get('/search', taskController.searchTasks);
router.get('/new', taskController.getNewTask);
router.post('/new', taskController.postNewTask);
router.get('/:id/edit', taskController.getEditTask);
router.post('/:id/edit', taskController.postEditTask);
router.post('/:id/delete', taskController.deleteTask);

module.exports = router;
