const connectDB = require("../db/connectDB");
const { DataTypes, Model } = require("sequelize");

class Category extends Model { };

Category.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    sequelize: connectDB,
    timestamps:true
})

module.exports = Category;