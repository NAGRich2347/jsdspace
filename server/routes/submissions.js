const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// POST /api/submissions/upload
router.post('/upload', submissionController.uploadFile);
// POST /api/submissions/metadata
router.post('/metadata', submissionController.submitMetadata);
// GET /api/submissions/review/:id
router.get('/review/:id', submissionController.reviewSubmission);
// POST /api/submissions/publish/:id
router.post('/publish/:id', submissionController.publishSubmission);

module.exports = router;