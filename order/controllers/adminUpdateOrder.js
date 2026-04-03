const { NotFoundError, BadRequestError } = require("../errors");
const Order = require("../model/order");
const { StatusCodes } = require("http-status-codes");

const adminUpdateOrder = async (req, res) => {
    const userRole = req.headers["x-user-role"];
    if (userRole !== "admin") {
        throw new BadRequestError("Unauthorized - not an admin");
    }
    const { status, orderId } = req.body;
    const statuses = ["cancelled", "shipped", "delivered"];
    if (!statuses.includes(status)) {
        throw BadRequestError("Order Status invalid");
    };
    const order = await Order.findByPk(orderId);
    if (!order) {
        throw new NotFoundError("Ordr not found");
    };
    if (!order.paid) {
        throw BadRequestError("Unpaid order");
    };
    const orderStatus = order.status;
    orderStatus = status;
    await order.save();
    res.status(StatusCodes.OK).json(order);
};

module.exports = adminUpdateOrder;
