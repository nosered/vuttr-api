const sequelize = require('../database/sequelize');

const umzugConfig = {
	storage: 'sequelize',
	storageOptions: {
		sequelize: sequelize
	},
	logging: () => {
        console.log.apply(null, arguments);
    },
	upName: 'up',
	downName: 'down',
	migrations: {
		params: [
			sequelize.getQueryInterface(),
			sequelize.constructor,
			() => {
                throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
            }
		],
		path: 'migrations',
		pattern: /^\d+[\w-]+\.js$/
	}
};

module.exports = umzugConfig;