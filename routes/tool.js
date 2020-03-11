const express = require('express');

const router = express.Router();

const toolValidator = require('../validators/tool');
const authController = require('../controllers/auth');
const toolController = require('../controllers/tool');

router.get('/', authController.authenticateUser, toolController.getTools);

router.post('/', authController.authenticateUser, toolValidator.validators, toolController.postTools);

module.exports = router;