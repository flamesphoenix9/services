const { Sequelize } = require('sequelize');

const connectDB = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see the raw SQL being generated
});

module.exports = connectDB;