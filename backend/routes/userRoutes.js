const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Correct ✅

const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authMiddleware, userController.profile);


module.exports = router;