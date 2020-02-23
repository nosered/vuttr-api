const { body } = require('express-validator/check');

exports.validators = [
    body('title').notEmpty().isAlphanumeric().isLength({ max: 50 }),
    body('link').notEmpty().isURL(),
    body('description').notEmpty().isString().isLength({ max: 255 }),
    body('tags').isArray({ min: 0 })
]