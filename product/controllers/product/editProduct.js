const Category = require("../../models/category");
const Product = require("../../models/product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../../errors");

const editProduct = async (req, res) => {
    let categoryChange;
    const { productId } = req.params;
    const {  name, price, stock, description, newCategoryId } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) throw new NotFoundError("Product not found");
    if (categoryId) {
        if (categoryId != product.categoryId) {
            const newCategory = await Category.findByPk(newCategoryId);
            if (!newCategory) {
                categoryChange = false;
            } else {
                categoryChange = true;
            }
        }
    }
    const newProduct = {
        productId: productId,
        name: name || product.name,
        price: price || product.price,
        stock: stock || product.stock,
        description: description || product.description,
        categoryId: categoryChange ? newCategoryId : product.categoryId
    };

   res .status(StatusCodes.OK).json({
       message: "Product updated",
       categoryChange: categoryChange ? "Catgory changedd" : `${categoryChange} Catgory not changed`,
       product: {
           productId: newProduct.productId,
           name: newProduct.name,
           price: newProduct.price,
           stock: newProduct.stock,
           description: newProduct.description,
           categoryId:newProduct.categoryId
       }
   })   
}

module.exports = editProduct;