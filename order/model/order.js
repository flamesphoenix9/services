const {DataTypes, Model} = require('sequelize');
const connectDB = require('../db/connectdb');

class Order extends Model {}

Order.init({
     id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
    type: DataTypes.STRING,
    allowNull: false
    },
    email: {
    type: DataTypes.STRING,
    allowNull: false
    },
    items: {
    type: DataTypes.JSONB,
    allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        allowNull: false,
         validate: {
            isIn:[["pending", "cancelled", "shipped", "delivered"]]
        }
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull:false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    }
}, {
    sequelize: connectDB,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true
})

module.exports = Order;