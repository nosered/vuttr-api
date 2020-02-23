const { body } = require('express-validator/check');

exports.validators = [
    body('firstName').notEmpty().isAlpha().isLength({ max: 255 }),
    body('lastName').notEmpty().isAlpha().isLength({ max: 255 }),
    body('email').notEmpty().normalizeEmail().isEmail().isLength({ max: 255 }),
    body('password').notEmpty().isLength({ min: 4, max: 8 })
]