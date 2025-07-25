const mongoose = require("mongoose");
const Order = require("../../models/Orders");

// Lấy danh sách đơn hàng của seller (theo ShopId)
exports.getOrdersByShop = async (req, res) => {
  try {
    console.log("Received request with query:", req.query);
    const shopId = req.query.shopId;

    if (!shopId) {
      console.log("Missing shopId in request");
      return res.status(400).json({ message: "Missing shopId" });
    }

    // Validate shopId format before attempting to convert
    if (typeof shopId !== "string") {
      console.error("Invalid shopId type:", typeof shopId);
      return res.status(400).json({
        message: "Invalid shopId format: not a string",
        receivedType: typeof shopId,
      });
    }

    console.log("Attempting to convert shopId:", shopId);
    let shopObjectId;
    try {
      shopObjectId = new mongoose.Types.ObjectId(shopId);
      console.log("Successfully converted shopId to ObjectId:", shopObjectId);
    } catch (err) {
      console.error("Invalid ObjectId format:", err);
      return res.status(400).json({
        message: "Invalid shopId format",
        details: err.message,
        shopId: shopId,
      });
    }

    console.log("Querying orders for shopId:", shopObjectId);
    const orders = await Order.find({ ShopId: shopObjectId })
      .populate("BuyerId", "Username ShippingAddress")
      .lean()
      .sort({ createdAt: 1 });

    console.log("Found orders:", orders ? orders.length : 0);

    if (!orders || orders.length === 0) {
      console.log("No orders found for shop");
      return res.status(404).json({
        message: "No orders found for this shop",
        shopId: shopId,
      });
    }

    const result = orders.map((order) => {
      // Use receiverName from the order document
      const customerName = order.receiverName || "N/A";
      return {
        _id: order._id,
        customerName,
        dateAdd: order.OrderDate,
        status: order.Status,
        totalAmount: order.TotalAmount,
      };
    });

    console.log("Successfully processed all orders");
    res.json(result);
  } catch (error) {
    console.error("Error in getOrdersByShop:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      message: "Error fetching orders",
      errorType: error.name,
      errorMessage: error.message,
      errorDetails: Object.getOwnPropertyNames(error).reduce((acc, key) => {
        acc[key] = error[key];
        return acc;
      }, {}),
    });
  }
};
