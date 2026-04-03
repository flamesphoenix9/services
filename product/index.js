require("dotenv").config();
require("express-async-errors");
const express = require("express");
const connectDB = require("./db/connectDB");
const errorHandlerMiddleware = require("./middleware/error-handler")
const notfound = require("./middleware/not-found");

const categoryRouter = require("./routes/categoryRoute");
const productRouter = require("./routes/productRoute");

const app = express();
app.use(express.json());

app.get("", (req, res) => {
    res.send("Product service")
})

app.use("/category", categoryRouter);
app.use("/product", productRouter);

app.use(errorHandlerMiddleware);
app.use(notfound);

const port = process.env.PORT || 8001;
app.listen(port, async () => {
    try {
        await connectDB.authenticate();
        console.log("DB connected");
        await connectDB.sync({ alter: true });
        console.log("Tables synced");
        console.log(`Server listening on port ${port}`)
    } catch (error) {
        console.error("DB connection failed", error);
    }
});