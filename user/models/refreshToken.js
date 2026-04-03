const { DataTypes, Model } = require("sequelize");
const connectDB = require("../db/connectDB");
const User = require("./user");
const jwt = require("jsonwebtoken");

const generateRefreshToken = (email) => {
    return jwt.sign({ email },process.env.REFRESH_SECRET, {expiresIn:"7d" })
}

class RefreshToken extends Model{ }

RefreshToken.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: "email",
      },
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue() {
            return generateRefreshToken(this.email);
      },
    }
}, {
    sequelize: connectDB,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
})

module.exports = RefreshToken;