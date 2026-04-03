const Payment = require("../models/payment");
const { NotFoundError } = require("../errors");
const rabbit = require("../rabbitmq");
const crypto = require("crypto");

const paystackWebhook = async (req, res) => {
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(req.rawBody)
        .digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) {
        return res.sendStatus(400);
    };
    const event = req.body;
    const reference = event.data?.reference;
    const paymentId = reference.split("_")[1];
    const paymentRecord = await Payment.findOne({ where: { id: paymentId } });
    if (!paymentRecord) {
        throw new NotFoundError("Payment record not found");
    };
    
    if (event.event === "charge.success") {
        paymentRecord.status = "paid";
        await paymentRecord.save();
        await rabbit.publish("payment_exchange", "payment.success", message = {
            orderId: paymentRecord.orderId,
            userId: paymentRecord.userId,
            email: paymentRecord.email,
            totalAmount: paymentRecord.amount,
            status: paymentRecord.status
        });
        res.sendStatus(200);
    } else {
        paymentRecord.status= "failed";
        await paymentRecord.save();
        await rabbit.publish("payment_exchange", "payment.failure", message = {
            orderId: paymentRecord.orderId,
            userId: paymentRecord.userId,
            email: paymentRecord.email,
            totalAmount: paymentRecord.amount,
            status: paymentRecord.status
        });
        res.status(200).json({ message: "Payment failed" });
    }
};

module.exports = paystackWebhook;