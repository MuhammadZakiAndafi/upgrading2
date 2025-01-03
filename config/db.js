//config/db.js
const { Sequelize } = require("sequelize");
require('dotenv/config')

const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        timezone: "+07:00",
    }
)

module.exports = db