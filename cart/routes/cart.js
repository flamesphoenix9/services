const express = require("express");
const router = express.Router();

const addItem = require("../controllers/addItem");
const checkout = require("../controllers/checkout");
const removeItem = require("../controllers/removeItem");
const getCart = require("../controllers/getCart"); 

router.post("/add", addItem);
router.post("/checkout", checkout);
router.get("/view", getCart); 
router.delete("/remove", removeItem);

module.exports = router;