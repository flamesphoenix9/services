const router = require("express").Router()

const adminUpdateOrder = require("../controllers/adminUpdateOrder");

router.route("update-status").post(adminUpdateOrder);

module.exports = router;