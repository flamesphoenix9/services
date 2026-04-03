const Category = require("../../models/category");
const { StatusCodes } = require("http-status-codes");

const viewCategories = async (req, res) => {
    const categories = await Category.findAll();
    res.status(StatusCodes.OK).json({
        count: categories.length,
        categories
    })
};

module.exports = viewCategories;