const Category = require("../../models/category");
const Product = require("../../models/product");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");

const addProduct = async (req, res) => {
  try {
    const { name, price, stock, description, categoryId } = req.body;
    const category = await Category.findByPk(categoryId);
    if (!category) throw new NotFoundError("Category not found");
    const [product , created] = await Product.findOrCreate({
      where: { name, categoryId }, 
      defaults: {
        name,
        price,
        stock,
        description,
        categoryId
      }
    });
    if(!created) throw new BadRequestError("Product already exists");
    res.status(StatusCodes.CREATED).json({ message: "Product added", product });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = addProduct;
