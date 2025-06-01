const express = require('express');
const router = express.Router();
const { saveNozzleConfig } = require('../controllers/configController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/:pump_sno', authMiddleware, saveNozzleConfig);

module.exports = router;
