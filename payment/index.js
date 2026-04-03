require("dotenv").config();
const connectDB = require("./db/connectdb");
const rabbit = require("./rabbitmq");
const notfound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const express = require("express");
const paymentRoutes = require("./routes/paymentRouter");
const initializePaymentHandler = require("./handlers/initializePayment");

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // Soriginal untouched data
  }
}));
// app.use(express.json());

app.get("", (req, res) => {
  res.send("Payment service is running");
});
app.use("", paymentRoutes);

app.use(notfound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8006;

const startServer = async (port) => {
  try {
    await connectDB.authenticate();
    console.log("Payment DB connected");
    await connectDB.sync({ alter: true });
    await rabbit.connect();
    app.listen(port, () => {
      console.log(`Server listening on the port ${port}`);
    });

    // Consume order.created events to initialize payments
    await rabbit.consume(
      "initialize_payment_queue",
      "order_exchange",
      "order.created",
      initializePaymentHandler,
    );
  } catch (error) {
    console.error("Server startup failed", error);
  }
};

startServer(port);
