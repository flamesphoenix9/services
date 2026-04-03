const { NotFoundError } = require("../../errors");
const Product = require("../../models/product");
const { StatusCodes } = require("http-status-codes");

const getProduct = async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);
    if (!product) {
        throw new NotFoundError("Product not found");
    }
    res.status(StatusCodes.OK).json({
        product
    });
};

module.exports = getProduct;