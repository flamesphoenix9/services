const { DataTypes, Model } = require("sequelize")
const connectDB = require("../db/connectDB")
class User extends Model { }

User.init({
     id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull:false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull:false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    picture: {
        type: DataTypes.STRING,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "user",
        allowNull: false,
        validate: {
            isIn:[["user", "admin", "moderator"]]
        }
    }
}, {
   sequelize: connectDB,
    modelName: "User",
    tableName: "users", 
    timestamps: true
  })

  module.exports= User