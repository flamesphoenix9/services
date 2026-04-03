require("dotenv").config();
require("express-async-errors");
const express = require("express");
const connectDB = require("./db/connectDB");
const errorHandlerMiddleware = require("./middleware/error-handler")
const notfound = require("./middleware/not-found");

const authRouter = require("./routes/route");
const app = express();
app.use(express.json());

app.get("", (req, res) => {
    res.send("User service")
})
app.use("", authRouter);


app.use(errorHandlerMiddleware);
app.use(notfound);
const port = process.env.PORT || 8000;
app.listen(port, async () => {
        try {
            await connectDB.authenticate();
            console.log("User DB connected");
            await connectDB.sync({ alter: true });
            console.log("Tables synced");
            console.log(`User service runningat port ${port}`)
        } catch (error) {
            console.error("DB connection failed", error);
        }
    })
;


