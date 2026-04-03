const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { BadRequestError } = require("../errors");
const generateOtp = require("../utils/gentoken");

const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new BadRequestError("Email exists");
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    const otp = await generateOtp(email);

    res.status(StatusCodes.OK).json({
      message: "User created",
      code: otp.code,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = register;
