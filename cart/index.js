require("dotenv").config();
const rabbit = require("./rabbitmq");
const express = require("express");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notfound = require("./middleware/not-found");
const redisClient = require("./redisClient");
const cartRouter = require("./routes/cart"); 

const app = express();
app.use(express.json());

app.get("", (req, res) => {
    res.send("Cart service is running");
});
app.use("", cartRouter);


app.use(notfound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8002;

app.listen(port, async () => {
    try {
        await rabbit.connect();
        console.log(`Server listening on the port ${port}`);
    } catch (error) {
        console.error("Startup failed", error);
    }
});

process.on("SIGINT", async () => {
  console.log("Closing connections...");
  await redisClient.quit();
  // If your rabbitmq util has a close method, call it here too
  process.exit(0);
});