const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getAdminPanel);
router.post('/users/:id/delete', adminController.deleteUser);
router.post('/tasks/:id/delete', adminController.deleteAnyTask);

module.exports = router;
