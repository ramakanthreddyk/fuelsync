const express = require('express');
const router = express.Router();
const { createOwner } = require('../controllers/adminController');
const { authMiddleware, superadminOnly } = require('../middlewares/authMiddleware');

router.post('/create-owner', authMiddleware, superadminOnly, createOwner);

module.exports = router;