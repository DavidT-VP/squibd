const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// CSV upload
router.post('/upload', recordController.uploadCSV);

// Search by SSN
router.get('/search/:ssn', recordController.searchBySSN);

// PDF Generation
router.get('/evr/pdf/:ssn', recordController.generatePDF);

module.exports = router;
