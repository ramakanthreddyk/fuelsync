// routes/nozzleConfigRoutes.js

const express = require('express');
const router = express.Router();
const { updateNozzleConfig, getNozzleConfig } = require('../controllers/nozzleConfigController');
const { authMiddleware, superadminOnly } = require('../middlewares/authMiddleware');

router.post('/config', authMiddleware, superadminOnly, updateNozzleConfig);
router.get('/config/:pump_sno', authMiddleware, getNozzleConfig);

module.exports = router;
