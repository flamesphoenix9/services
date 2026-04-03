const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const redisClient = require("../redisClient");

const removeItem = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { productId } = req.body;
  const cartKey = `cart:${userId}`;
  const deleteCount = await redisClient.hDel(cartKey, productId);
  // If the item was not found in the cart, hDel returns 0
  if (deleteCount === 0) {
    throw new NotFoundError("Item not found in cart");
  }
  const updatedCart = await redisClient.hGetAll(cartKey);
  res.status(StatusCodes.OK).json({ 
    message: "Item removed from Redis cart", 
    cart: updatedCart 
  });
}

module.exports = removeItem;
