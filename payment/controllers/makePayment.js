const axios = require("axios");
const Payment = require("../models/payment");
const { NotFoundError, BadRequestError } = require("../errors");


const makePayment = async (req, res) => {
  try {
    let { paymentId } = req.params;
    paymentId = paymentId.trim();
    const userId = req.headers["x-user-id"];
    if (!paymentId || !userId) {
      throw new BadRequestError("Payment ID and User ID are required");
    }
    const paymentRecord = await Payment.findOne({ where: { id:paymentId, userId } });
    if (!paymentRecord) {
      throw new NotFoundError("Payment not found");
    }

    if (paymentRecord.status === "paid") {
      throw new BadRequestError("Payment already made for this order");
    }
    // payment processing
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: paymentRecord.email,
        amount: Math.round(paymentRecord.amount * 100),
        reference: `pay_${paymentRecord.id}_${Date.now()}`,
        callback_url: process.env.PAYMENT_CALLBACK_URL
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        },
      },
    );
    res.json({ Authorization_url: response.data.data.authorization_url })
  } catch (error) {
    console.error("Payment initialization error:", error);  
    res.status(error.statusCode || 500).json({ error: error.message || "An error occurred while processing payment" });
  }
};

module.exports = makePayment;