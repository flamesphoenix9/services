const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const redisClient = require("../redisClient");

const getCart = async (req, res) => {
    const userId = req.headers["x-user-id"];  
    if (!userId) {
        throw new BadRequestError("Missing user ID");
    }   
    const cartKey = `cart:${userId}`;
    const cart = await redisClient.hGetAll(cartKey);        
    if (Object.keys(cart).length === 0) {
        throw new NotFoundError("Cart empty");  
    }
    res.status(StatusCodes.OK).json({ cart });
}

module.exports = getCart;