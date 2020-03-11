const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

router.post('/token', authController.authenticateClient, authController.getToken);

router.delete('/token', authController.authenticateClient, authController.revokeToken);

module.exports = router;