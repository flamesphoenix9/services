const Product = require("../../models/product");
const { StatusCodes } = require("http-status-codes");

const viewProducts = async (req, res) => {
    const products = await Product.findAll();
    res.status(StatusCodes.OK).json({
        count:products.length,
        products,
    })
}

module.exports = viewProducts;