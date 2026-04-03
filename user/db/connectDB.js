const { Sequelize } = require('sequelize');

const connectDB = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, 
});

module.exports = connectDB;