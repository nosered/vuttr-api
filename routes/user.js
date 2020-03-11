const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');
const userValidator = require('../validators/user');
const userController = require('../controllers/user');

router.post('/', authController.authenticateClient, userValidator.validators, userController.postUsers);

module.exports = router;