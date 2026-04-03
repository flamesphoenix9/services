const { DataTypes, Model } = require('sequelize');
const connectDB = require('../db/connectdb');

class Payment extends Model { }

Payment.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        min: 0.01,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['pending', 'paid', 'failed']]  
        },
        defaultValue: 'pending',
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique:true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
    type: DataTypes.STRING,
    allowNull: false
    }
}, {
    sequelize: connectDB,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
})

module.exports = Payment;