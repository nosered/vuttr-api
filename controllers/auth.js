const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const CLIENT_ID = 'webapp';
const CLIENT_SECRET = 'webapp';
const ACCESS_TOKEN_KEY = '4cc3sst0k3ns3cr3tk3y';
const REFRESH_TOKEN_KEY = 'r3fr3sht0k3ns3cr3tk3y';

const validateClient = (encodedClientCredentials) => {
    const clientCredentials = Buffer.from(encodedClientCredentials, 'base64').toString('ascii');
    if(clientCredentials === `${CLIENT_ID}:${CLIENT_SECRET}`) {
        return true;
    }
    return false;
}

const findAndValidateUser = (username, password) => {
    return User.findOne({ where: { email: username } })
    .then(user => {
        if(!user) { 
            return null;
        }
        return bcrypt.compare(password, user.dataValues.password);
    })
    .then(passwordMatch => {
        if(passwordMatch) {
            return {
                email: username
            }
        } else {
            return null;
        }
    })
    .catch(error => {
        console.log(error);
        return null;
    });
}

const generateJsonWebToken = (payload, secretKey, options) => {
    return new Promise((resolve, reject) => {
        try {
            const token = jwt.sign(payload, secretKey, options);
            resolve(token);
        } catch(error) {
            reject(error);
        }
    });
}

const validateJsonWebToken = (token, secretKey, options) => {
    return new Promise((resolve, reject) => {
        try {
            const payload = jwt.verify(token, secretKey, options);
            resolve(payload);
        } catch(error) {
            reject(error);
        }
    });
}

exports.getToken = (request, response, next) => {
    let authorizationHeader = request.get('Authorization');

    if(!authorizationHeader) {
        return response.status(401).send('INVALID CLIENT CREDENTIALS');
    }

    authorizationHeader = authorizationHeader.split(' ');
    const authorizationType = authorizationHeader[0];
    const encodedClientCredentials = authorizationHeader[1];

    if(authorizationType !== 'Basic') {
        return response.status(401).send('INVALID CLIENT CREDENTIALS');
    }

    if(!validateClient(encodedClientCredentials)) {
        return response.status(401).send('INVALID CLIENT CREDENTIALS');
    }

    const grantType = request.query.grant_type;
    if(grantType === 'password') {
        const username = request.body.username;
        const password = request.body.password;

        if(!username || !password) {
            return response.status(401).send('INVALID USERNAME OR PASSWORD');
        }

        let user, accessToken, refreshToken;
        findAndValidateUser(username, password)
        .then(userFind => {
            if(!userFind) {
                throw new Error('401');
            }
            user = userFind;
            return generateJsonWebToken({ email: userFind.email, userId: userFind.id }, ACCESS_TOKEN_KEY, { algorithm: 'HS256', expiresIn: '1h' });
        })
        .then((token) => {
            accessToken = token;
            return generateJsonWebToken({ email: user.email, userId: userFind.id }, REFRESH_TOKEN_KEY, { algorithm: 'HS256', expiresIn: '24h' });
        })
        .then((token) => {
            refreshToken = token;
            response.cookie('refresh_token', refreshToken, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
            return response.status(200).send({ accessToken: accessToken, expiresIn: 60 * 60 });
        })
        .catch(error => {
            console.log(error);
            return response.status(401).send('INVALID USERNAME OR PASSWORD');
        });
    } else if(grantType === 'refresh_token') {
        const cookieRefreshToken = request.cookies['refresh_token'];

        if(!cookieRefreshToken) {
            return response.status(401).send('INVALID TOKEN');
        }

        let payload, accessToken, refreshToken;
        validateJsonWebToken(cookieRefreshToken, REFRESH_TOKEN_KEY, { algorithms: ['HS256'] })
        .then(payloadValidated => {
            payload = payloadValidated;
            return generateJsonWebToken({ email: payload.email, userId: payload.userId }, ACCESS_TOKEN_KEY, { algorithm: 'HS256', expiresIn: '1h' });
        })
        .then(token => {
            accessToken = token;
            return generateJsonWebToken({ email: payload.email, userId: payload.userId }, REFRESH_TOKEN_KEY, { algorithm: 'HS256', expiresIn: '24h' });
        })
        .then(token => {
            refreshToken = token;
            response.cookie('refresh_token', refreshToken, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
            return response.status(200).send({ accessToken: accessToken, expiresIn: 60 * 60 });
        })
        .catch((error) => {
            console.log(error);
            return response.status(401).send('INVALID TOKEN');
        });
    } else if(grantType === 'authorization_code' || grantType === 'client_credentials') {
        return response.status(406).send('GRANT TYPE NOT ACCEPTABLE');
    } else {
        return response.status(400).send('INVALID GRANT TYPE');
    }
}

exports.authenticate = (request, response, next) => {
    let authorizationHeader = request.get('Authorization');

    if(!authorizationHeader) {
        return response.status(401).send('TOKEN IS MISSING');
    }

    authorizationHeader = authorizationHeader.split(' ');
    const authorizationType = authorizationHeader[0];
    const accessToken = authorizationHeader[1];

    if(authorizationType !== 'Bearer') {
        return response.status(401).send('INVALID TOKEN');
    }

    try {
        const payload = jwt.verify(accessToken, ACCESS_TOKEN_KEY, { algorithms: ['HS256'] });
        request.tokenPayload = payload;
    } catch(error) {
        console.log(error);
        return response.status(401).send('INVALID TOKEN');
    }

    next();
}

exports.authorize = () => {
    
}

exports.revokeToken = (request, response, next) => {
    response.clearCookie('refresh_token');
    response.status(200).send();
}