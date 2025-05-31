const express = require('express');
const router = express.Router();
const { uploadFile, getUploads } = require('../controllers/uploadController');
const multer = require('multer');
const { authMiddleware } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('image'), uploadFile);
router.get('/uploads', authMiddleware, getUploads); // ✅ Correct: function, not object

module.exports = router;