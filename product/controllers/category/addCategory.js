const Category = require("../../models/category");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");

const addCategory = async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName || categoryName.trim() === "") {
        throw new BadRequestError("Category name cannot be empty")
    };
    const [category, created] = await Category.findOrCreate({
        where: {
            name: categoryName
        },
        defaults: {
            name:categoryName
        }
    });
    res.status(StatusCodes.OK).json({
        message: created? "Category added":"Category already exists",
        category
    })
};

module.exports = addCategory;