const { Sequelize } = require('sequelize');
const { HTTP_STATUS } = require("../conifg/constants.js");
const dotenv = require('dotenv');
const path = require('path');

const envFile = process.env.NODE_ENV === 'docker' ? '.env.docker' : '.env.dev';
dotenv.config({ path: path.join(__dirname, '../', envFile) });

const sequelizeConfig = {
    dialect: 'mysql',
    logging: false,
    retry: {
        max: 5,
        match: [/ECONNREFUSED/, /ETIMEDOUT/],
    },
};

if (process.env.NODE_ENV === 'docker') {
    sequelizeConfig.host = process.env.DB_HOST;
    sequelizeConfig.port = process.env.DB_PORT || 3306;
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    sequelizeConfig
);

async function syncDB() {
    for (let i = 1; i <= 5; i++) {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            console.log("✅ Database synchronized");
            break;
        } catch (error) {
            console.error(`Attempt ${i}: Database sync failed`, error.message);
            if (i === 5) process.exit(1);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}

syncDB();

module.exports = { sequelize };
