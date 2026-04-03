const Category = require("../../models/category");
const Product = require("../../models/product");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");

const deleteCategory = async (req, res) => {
  const { categoryId } = req.body;

  const category = await Category.findByPk(categoryId);
  if (!category) throw new BadRequestError("Category does not exist");
  const [uncategorized] = await Category.findOrCreate({
      where: { name: "Uncategorized" },
      defaults: {
          name:"Uncategorized"
      }
  });
  await Product.update(
    { categoryId: uncategorized.id },
    {
      where: {
        categoryId: categoryId,
      },
    }
  );

  await category.destroy();
  res.status(StatusCodes.OK).json({
    message: `Category deleted. Products moved to "Uncategorized".`,
  });
};

module.exports = deleteCategory;
