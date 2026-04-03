const express = require("express");
const Router = express.Router();
const { viewProducts, addProduct, checkStock, getProduct, editProduct } = require("../controllers/product")

Router.route("").get(viewProducts).post(addProduct);
Router.route("/:productId/stock").get(checkStock);
Router.route("/:productId").get(getProduct).patch(editProduct);

module.exports = Router;