const Sequelize = require('sequelize');

const sequelize = require('../database/sequelize');

const User = sequelize.define('user',
  {
    id: {
      type:Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING
  },
  {
    freezeTableName: true
  }
);

User.associate = (models) => {
  User.hasMany(models.Tool, { onDelete: 'CASCADE' });
};

module.exports = User;