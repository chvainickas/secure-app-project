const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// SECURE: Apply requireAdmin middleware to all admin routes
router.get('/', adminController.requireAdmin, adminController.getAdminPanel);
router.post('/users/:id/delete', adminController.requireAdmin, adminController.deleteUser);
router.post('/tasks/:id/delete', adminController.requireAdmin, adminController.deleteAnyTask);

module.exports = router;
