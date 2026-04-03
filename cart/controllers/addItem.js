const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const redisClient = require("../redisClient");

async function checkAvailability(productId, quantity) {
  const res = await axios.get(
    `${process.env.PRODUCT_SERVICE_URL}/${productId}/stock`
  );
  if (!res.data || res.data.stock < quantity) {
    return false;
  }
  return true;
}

const addItem = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { productId, quantity } = req.body;
  if (!userId) {
    throw new BadRequestError("Missing user ID");
  }
  if (!productId || !quantity || quantity <= 0) {
    throw new BadRequestError("Missing user ID or quantity");
  }
  const availability = await checkAvailability(productId, quantity);
  if (!availability) {
    throw new BadRequestError("Quantity more than available stock");
  }

  const cartKey = `cart:${userId}`;

  await redisClient.hSet(cartKey, productId, quantity);
  // Expire cart after 7 days of inactivity
  await redisClient.expire(cartKey, 7 * 24 * 60 * 60);
  const fullCart = await redisClient.hGetAll(cartKey);
  res.status(StatusCodes.OK).json({ 
    message: "Item added to Redis cart", 
    cart: fullCart 
  });
};

module.exports = addItem;