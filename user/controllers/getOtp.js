const { NotFoundError } = require("../errors");
const {StatusCodes}= require("http-status-codes")
const User = require("../models/user");
const generateOtp = require("../utils/gentoken");


const getOtp = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email, verified: false } });
    if (!user) {
        throw new NotFoundError("User verified")
    }
    const otp = await generateOtp(email);
    res.status(StatusCodes.OK).json({ meaaage: "OTP sent to mail" });
};

module.exports = getOtp;