const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");

const { BadRequestError } = require("../errors");
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw new BadRequestError("User does not exist");
  if (!user.verified) throw new BadRequestError("User not vrified");

  const passwordCheck = await bcrypt.compare(password, user.password);
  if (!passwordCheck) throw new BadRequestError("Invalid password");
  const refreshToken = await RefreshToken.findOne({
    where:{
      email
    }
  });
  if (refreshToken) {
    await RefreshToken.destroy({where:{email}})
  }
  await RefreshToken.create({ email });
  const accessToken = jwt.sign(
    {
      userId: user.id,
      role:user.role,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      picture: user.picture,
      verified: user.verified,
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_EXPIRY,
    }
  );
  res.status(StatusCodes.OK).json({
    message: "Login successful",
    refreshToken: refreshToken.token,
    accessToken,
  });
};

module.exports = login;