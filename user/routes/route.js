const express = require("express");
const router = express.Router();

const register = require("../controllers/register");
const verify = require("../controllers/verify");
const getOtp = require("../controllers/getOtp");
const login = require("../controllers/login");

router.route("/register").post(register);
router.route("/verify").post(verify);
router.route("/get-otp").post(getOtp);
router.route("/login").post(login);

module.exports = router;