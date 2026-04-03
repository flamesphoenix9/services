const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 8008;

app.use("/validate", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).send("Unauthorized");

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.setHeader("x-user-id", payload.userId);
    res.setHeader("x-user-role", payload.role);
    res.setHeader("x-verified", payload.verified);
    res.setHeader("x-email", payload.email);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(401); // token invalid
  }
});

app.listen(port, () => console.log(`Auth service listening on ${port}`));
