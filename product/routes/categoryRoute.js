const express = require("express");
const router = express.Router();

const { addCategory,viewCategories,deleteCategory } = require("../controllers/category");

router.route("").post(addCategory).get(viewCategories).delete(deleteCategory);

module.exports = router;