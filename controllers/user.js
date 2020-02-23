const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const Op = require('sequelize').Op;

const User = require('../models/user');

exports.getUsers = (request, response, next) => {
    User.findAll({ where: { email: { [Op.iLike]: request.query.email ? `${request.query.email}` : ''} } })
    .then(users => {
        for(user of users) {
            delete user.dataValues.password;
        }
        response.status(200).json(users);
    })
    .catch(error => {
        console.log(error);
        response.status(500).json(error);
    });
}

exports.postUsers = (request, response, next) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
        return response.status(400).json(errors);
    }
    
    User.findOne({ where: { email: request.body.email } })
    .then(user => {
        return user;
    })
    .then(user => {
        if(user) {
            throw Error('User already exists');
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
        })
    })
    .catch(error => {
        console.log(error);
        response.status(500).json(error);
    });
}