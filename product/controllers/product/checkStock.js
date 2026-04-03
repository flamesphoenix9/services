const Category = require("../../models/category");
const Product = require("../../models/product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../../errors");

const checkStock = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  res.status(StatusCodes.OK).json({
    id: product.id,
    stock: product.stock,
    price: product.price
  })
};
module.exports= checkStock