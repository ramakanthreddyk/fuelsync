const express = require('express');
const router = express.Router();
const { getFuelPrices, setFuelPrices } = require('../controllers/fuelController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getFuelPrices);
router.post('/', authMiddleware, setFuelPrices);

module.exports = router;
