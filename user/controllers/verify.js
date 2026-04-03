const { BadRequestError, NotFoundError } = require("../errors");
const {StatusCodes}= require("http-status-codes")
const Otp = require("../models/otp");
const User = require("../models/user");

const verify = async (req, res) => {
    const { email, code } = req.body;
    const otp = await Otp.findOne({ where: { email, code } })
    if (!otp) throw new BadRequestError("Invalid OTP");
    //Check expiry
    if (Date.now() > otp.expiresAt.getTime()) {
        throw new BadRequestError("Otp expired")
    }
    const user = await User.findOne({ where: { email, verified: false } })
    if (!user) {
        throw new NotFoundError("User verified")
    }
    user.verified = true;
    await user.save();
    await otp.destroy();
    res.status(StatusCodes.OK).json({ message: "account verified" })
}

module.exports = verify;