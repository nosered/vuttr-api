const Sequelize = require('sequelize');

const sequelize = require('../database/sequelize');

const Tool = sequelize.define('tool',
  {
    id: {
      type:Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    title: Sequelize.STRING,
    link: Sequelize.STRING,
    description: Sequelize.STRING,
    tags: Sequelize.STRING,
    userId: Sequelize.INTEGER
  },
  {
    freezeTableName: true
  }
);

Tool.associate = (models) => {
  Tool.belongsTo(models.User, { onDelete: 'CASCADE' });
};

module.exports = Tool;