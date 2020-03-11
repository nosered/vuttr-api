const fs = require('fs');
const path = require('path');

const Sequelize = require('sequelize');

const basename  = path.basename(__filename);
const models = {};
const sequelize = new Sequelize(
    process.env.DB_NAME || 'vuttr_db',
    process.env.DB_USERNAME || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        dialect: process.env.DB_DIALECT || 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        logging: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'prod',
        pool: {
            min: +process.env.DB_CONNECTION_POOL_MIN || 1,
            max: +process.env.DB_CONNECTION_POOL_MAX || 5
        }
    }
);

// Call the associate functions from models
fs
.readdirSync(__dirname)
.filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
.forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    models[model.name] = model;
});
    
Object.keys(models).forEach(modelName => {
    if(models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = sequelize;