require("dotenv").config();
const rabbit = require("./rabbitmq");
const express = require("express");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notfound = require("./middleware/not-found");
const connectDB = require("./db/connectdb");
const createOrderHandler = require("./handlers/createOrder");
const updateOrderPaymentHandler = require("./handlers/updateOrder");
const orderRouter = require("./routes/orderRoutes");

const app = express();
app.use(express.json());

app.get("", (req, res) => {
    res.send("Order service is running");
});
app.use("", orderRouter);


app.use(notfound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8005;

const startServer = async (port) => { 
    try {
        await connectDB.authenticate();
        console.log("Order DB connected");
        await connectDB.sync({ alter: true });
        await rabbit.connect();
        app.listen(port, () => {
            console.log(`Server listening on the port ${port}`);
        });
        // CREATE ORDER FROM CART
        await rabbit.consume("order_queue", "cart-exchange", "cart.checked_out", createOrderHandler); 
        // UPDATE PAID ORDER 
        await rabbit.consume("update_order_queue", "payment_exchange", "payment.success", updateOrderPaymentHandler);
    } catch(error){
        console.error("Startup failed", error);
    }
}

startServer(port);