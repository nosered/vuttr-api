const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

router.post('/token', authController.getToken);

router.delete('/token', authController.revokeToken);

module.exports = router;