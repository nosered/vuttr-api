const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const ACCESS_TOKEN_KEY = '4cc3sst0k3ns3cr3tk3y';
const REFRESH_TOKEN_KEY = 'r3fr3sht0k3ns3cr3tk3y';

exports.getClient = (clientId, clientSecret) => {
  console.log('GET CLIENT');
  if(clientId === 'webapp' && clientSecret === 'webapp') {
    return {
      clientId: clientId,
      clientSecret: clientSecret,
      grants: [ 'password', 'refresh_token' ]
    }
  }
  return;
}

exports.getUser = (email, password) => {
  return User.findOne({ where: { email: email } })
  .then(user => {
    if(!user) {
      return;
    }
    return bcrypt.compare(password, user.dataValues.password);
  })
  .then(passwordMatch => {
    if(passwordMatch) {
      return {
        username: email,
        password: password
      }
    }
    throw new Error('Invalid grant: user credentials are invalid');
  })
  .catch(error => {
    console.log(error);
    return false;
  });
}

exports.getAccessToken = (accessToken) => {
  if(!accessToken || accessToken === 'undefined') {
    return false;
  }
  const payload = jwt.verify(accessToken, ACCESS_TOKEN_KEY, { algorithms: ['HS256'] });
  if(payload) {
    return new Promise(resolve => resolve({
      accessToken: accessToken,
      accessTokenExpiresAt: new Date(),
      client: {},
      user: {}
    }));
  }
  return false;
}

exports.getRefreshToken = (refreshToken) => {
  if(!refreshToken || refreshToken === 'undefined') {
    return false;
  }
  const payload = jwt.verify(refreshToken, REFRESH_TOKEN_KEY, { algorithms: ['HS256'] });
  if(payload) {
    return new Promise(resolve => resolve({
      refreshToken: refreshToken,
      refreshTokenExpiresAt: new Date(),
      client: {},
      user: {}
    }));
  }
  return false;
}

exports.saveToken = (token, client, user) => {
  const tokenResult = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    refreshToken: token.refreshToken,
    //refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    client: client,
    user: user,
    refresh_expires_in: Math.floor(token.refreshTokenExpiresAt / 1000)
  }
  return new Promise(resolve => resolve(tokenResult));
}

exports.revokeToken = (token) => {
  return true;
}

exports.generateAccessToken = (client, user, scope) => {
  return new Promise(resolve => resolve(
    jwt.sign({ email: user.username }, ACCESS_TOKEN_KEY, { algorithm: 'HS256', expiresIn: '1h' })
  ));
}

exports.generateRefreshToken = (client, user, scope) => {
  return new Promise(resolve => resolve(
    jwt.sign({ email: user.username }, REFRESH_TOKEN_KEY, { algorithm: 'HS256', expiresIn: '24h' })
  ));
}