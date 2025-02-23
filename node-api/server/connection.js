const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './../.env' });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
});

sequelize.sync()
    .then(() => console.log("Database synchronized"))
    .catch(err => console.error("Error syncing database:", err));

module.exports = { sequelize };