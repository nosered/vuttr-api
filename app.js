require('dotenv').config();
const path = require('path');

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const expressWinston = require('express-winston');
const helmet = require('helmet');
const compression = require('compression');
const Umzug = require('umzug');

const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tool');
const userRoutes = require('./routes/user');
const umzugConfig = require('./config/umzug-config');
const corsFilter = require('./util/cors');
const apiDocs = require(path.join(__dirname, 'api-docs.json'));

const PORT = process.env.PORT || 3000;
const expressApp = express();
const umzug = new Umzug(umzugConfig);

expressApp.use(helmet());
expressApp.use(compression());
expressApp.use(corsFilter);
expressApp.use(cookieParser());
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(expressWinston.logger({
	exitOnError: false,
	format: winston.format.combine(
		winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
		winston.format.printf(info => {
			return `[ ${info.level.toUpperCase()} ] [ ${info.timestamp} ] [ ${info.meta.req.method} ${info.meta.req.url} ] statusCode: ${info.meta.res.statusCode}`
		})
	),
	transports: [
		new winston.transports.Console({ level: 'info' })
	]
}));
expressApp.use('/auth', authRoutes);
expressApp.use('/tools', toolRoutes);
expressApp.use('/users', userRoutes);
expressApp.use(expressWinston.errorLogger({
	exitOnError: false,
	format: winston.format.combine(
		winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
		winston.format.printf(info => {
			return `[ ${info.level.toUpperCase()} ] [ ${info.timestamp} ] [ ${info.meta.req.method} ${info.meta.req.url} ]\nstack: ${info.meta.stack}\n${info.meta.error.parent.detail}\n\n`
		})
	),
	transports: [
		new winston.transports.File({
			level: 'error',
			filename: path.join(__dirname, 'error.log')
		})
	]
}));
expressApp.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs));
expressApp.use((request, response, next) => {
    response.status(404).json({ statusCode: 404, message: 'NOT FOUND' });
});

umzug.up().then((migrations) => {
	expressApp.listen(PORT, () => {
		console.log(`Server is listening on port ${PORT}...`);
	});
});