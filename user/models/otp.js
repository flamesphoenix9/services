const { DataTypes, Model } = require("sequelize");
const connectDB = require("../db/connectDB");
const User = require("./user");
class Otp extends Model {}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 6], // must be exactly 6 characters
        isNumeric: true, // must be digits only
      },
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
    expiresAt: {
      type: DataTypes.DATE,
      // allowNull: false,
      defaultValue: () => new Date(Date.now() + 10 * 60 * 1000)
    },
  },
  {
    sequelize: connectDB,
    modelName: "Otp",
    tableName: "otps",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Otp;
