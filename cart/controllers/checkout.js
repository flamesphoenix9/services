const axios = require("axios");
const rabbit = require("../rabbitmq");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const redisClient = require("../redisClient");

async function fetchPrice(cartData) {
  fullCart = [];
  totalPrice = 0;
  for (const productId in cartData) {
    const quantity = JSON.parse(cartData[productId]);
    try {
      const res = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL}/${productId}`,
      );
      if (!res.data) {
        console.error(`Product ${productId} not found in product service`);
        continue;
      } else {
        const curentPrice = res.data.product.price;
        const subTotal = quantity * curentPrice;

        fullCart.push({
          productId: productId,
          price: curentPrice,
          quantity: quantity,
          name: res.data.name,
        });
        totalPrice += subTotal;
      }
    } catch (error) {
      console.error(`Error fetching price for product ${productId}:`, error);
      continue;
    }
  }
  return {
    totalPrice,
    fullCart,
  };
}

const checkout = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const email = req.headers["x-email"];
  const cartKey = `cart:${userId}`;
  const cart = await redisClient.hGetAll(cartKey);

  if (!cart || Object.keys(cart).length === 0) {
    throw new NotFoundError("Cart empty");
  }
  const { totalPrice, fullCart } = await fetchPrice(cart);
  await rabbit.publish(
    "cart-exchange",
    "cart.checked_out",
    (message = {
      userId,
      email,
      items: fullCart,
      totalAmount: totalPrice
    }),
  );
  await redisClient.del(cartKey);
  res.status(StatusCodes.OK).json({
    message: "Checkout successful, order placed",
  });
};

module.exports = checkout;
