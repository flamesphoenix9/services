const rabbit = require("../rabbitmq");
const Payment = require("../models/payment");

const initializePaymentHandler = async (msg) => {
    try {
        await Payment.create({
            amount: msg.totalAmount,
            orderId: msg.orderId,
            userId: msg.userId,
            email: msg.email
        })
    } catch (error) {
        console.error("Error initializing payment:", error);
    }
}

module.exports = initializePaymentHandler;