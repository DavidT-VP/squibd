// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin endpoints
router.get('/all-users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);

// REMOVED: router.post('/users-create', adminController.createUser);

router.get('/all-records', adminController.getAllRecords);
router.put('/records/:id', adminController.updateRecord);

router.post('/reset-db', adminController.resetDatabase);

module.exports = router;
