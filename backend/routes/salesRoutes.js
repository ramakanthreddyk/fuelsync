const express = require('express');
const router = express.Router();
const { calculateSale, getPumpSnos, getSalesSummary } = require('../controllers/salesController');


const { authMiddleware } = require('../middlewares/authMiddleware');


// 🚩 Route Definitions (order matters!)
router.get('/pumps', authMiddleware, getPumpSnos);           // GET /api/v1/sales/pumps
router.get('/:pump_sno', authMiddleware, calculateSale);     // GET /api/v1/sales/:pump_sno
router.get('/summary', authMiddleware, getSalesSummary);


module.exports = router;
