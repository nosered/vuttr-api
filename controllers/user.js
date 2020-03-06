const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const Op = require('sequelize').Op;

const User = require('../models/user');
const { UserAlreadyExistsError } = require('../errors/errors');

exports.getUsers = (request, response, next) => {
    User.findAll({ where: { email: { [Op.iLike]: request.query.email ? `${request.query.email}` : ''} } })
    .then(users => {
        for(user of users) {
            delete user.dataValues.password;
        }
        response.status(200).json(users);
    })
    .catch(error => {
        next(error.message);
        response.status(500).json({ statusCode: 500, message: 'INTERNAL SERVER ERROR' });
    });
}

exports.postUsers = (request, response, next) => {
    const result = validationResult(request);
    if(!result.isEmpty()) {
        return response.status(400).json({ statusCode: 400, message: 'BAD REQUEST', errors: result.errors });
    }
    
    User.findOne({ where: { email: request.body.email } })
    .then(user => {
        if(user) {
            throw new UserAlreadyExistsError();
        }

        User.create({
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
            password: bcrypt.hashSync(request.body.password)
        })
        .then(user => {
            delete user.dataValues.password;
            response.status(201).json(user);
        });
    })
    .catch(UserAlreadyExistsError, error => {
        response.status(409).json({ statusCode: 409, message: error.message });
    })
    .catch(error => {
        next(error.message);
        response.status(500).json({ statusCode: 500, message: 'INTERNAL SERVER ERROR' });
    });
}