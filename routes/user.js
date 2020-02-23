const express = require('express');

const router = express.Router();

const userValidator = require('../validators/user');
const userController = require('../controllers/user');

router.get('/', userController.getUsers);

router.post('/', userValidator.validators, userController.postUsers);

module.exports = router;