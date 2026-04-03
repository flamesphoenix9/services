const rabbit = require("../rabbitmq");

const Order = require("../model/order");

const createOrder = async (msg) => {
   
    try {
        const savedOrder = await Order.create({
            userId: msg.userId,
            email: msg.email,
            items: msg.items, // Ensure your model has DataType.JSONB for this
            totalAmount: msg.totalAmount
        });
        console.log("Order created with ID:", savedOrder.id);
        rabbit.publish("order_exchange", "order.created", {
            orderId: savedOrder.id,
            userId: savedOrder.userId,
            email: savedOrder.email,
            totalAmount: savedOrder.totalAmount,
            status: savedOrder.status
        });
    } catch (error) {
        console.error("Error creating order:", error);
    };
}
module.exports = createOrder;