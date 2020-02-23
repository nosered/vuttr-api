const path = require('path');

const express = require('express');
const swaggerUi = require('swagger-ui-express');
// const Oauth2Server = require('express-oauth-server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Umzug = require('umzug');

const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tool');
const userRoutes = require('./routes/user');
const umzugConfig = require('./config/umzug-config');
// const oauth2Model = require('./oauth2/model');
const corsFilter = require('./util/cors');
const apiDocs = require(path.join(__dirname, 'api-docs.json'));

const expressApp = express();
const umzug = new Umzug(umzugConfig);
/*
const oauth2Server = new Oauth2Server({
	model: oauth2Model,
	grants: ['password', 'refresh_token'],
	accessTokenLifetime: 60 * 60 * 24,
	// refreshTokenLifeTime: 60 * 60 * 24,
	allowEmptyState: true,
  	allowExtendedTokenAttributes: true
});
*/

expressApp.use(corsFilter);
expressApp.use(cookieParser());
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));
/*
expressApp.post('/token', oauth2Server.token());
expressApp.use(oauth2Server.authenticate());
*/

expressApp.use('/auth', authRoutes);
expressApp.use('/tools', toolRoutes);
expressApp.use('/users', userRoutes);
expressApp.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs));
expressApp.use((request, response, next) => {
    response.status(404).send('RESOURCE NOT FOUND');
});

umzug.up().then((migrations) => {
	expressApp.listen(3000, () => {
		console.log('Server is listening on port 3000...');
	});
});