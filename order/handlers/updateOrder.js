const rabbit = require("../rabbitmq");
const Order = require("../model/order");

const updateOrderPaymentHandler = async (msg) => {
    try {
        const orderId = msg.orderId;
        const userId = msg.userId;
        const order = await Order.findOne({ where: { id: orderId, userId: userId } })
        if (!order) {
            throw Error(`Order ${msg.orderId} not found`)
        }
    } catch (e) {
        console.log(`Error , ${e}`);
    }
}

module.exports = updateOrderPaymentHandler;
