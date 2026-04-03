const Otp = require("../models/otp"); 
const generateToken = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    return randomCode
}

const generateOtp = async (email) => {
    await Otp.destroy({
        where: {
            email
        }
    });
    const otp = await Otp.create({
        email,
        code: generateToken(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) 
    })
    return otp
}
module.exports = generateOtp;