const mongoose = require("mongoose");
const Order = require("../../models/Orders");
const OrderItem = require("../../models/OrderItems");
const Product = require("../../models/Products");

exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("orderId " + orderId);

    // Validate orderId
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Find the order and populate necessary fields
    const order = await Order.findById(orderId)
      .populate("BuyerId", "Username PhoneNumber ShippingAddress")
      .populate("PaymentId")
      .populate("Items") // là đủ, vì Product đã nằm trong OrderItem

      .lean();
    console.log("hihi " + order);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get the default shipping address
    const defaultAddress = order.BuyerId.ShippingAddress.find(
      addr => addr.status === "Default"
    );

    // Format the response
    const formattedOrder = {
      _id: order._id,
      OrderDate: order.OrderDate,
      Status: order.Status,
      TotalAmount: order.TotalAmount,
      ReceiverName: order.receiverName || "N/A",
      ReceiverPhone: order.phoneNumber || "N/A",
      ShippingAddress: order.ShippingAddress || "N/A",
      PaymentId: order.PaymentId?.Type || "N/A",
      Items: order.Items ? order.Items.Product.map(product => ({
        _id: product._id,
        ProductName: product.ProductName,
        ProductImage: product.ProductImage,
        ProductVariant: product.ProductVariant.map(variant => ({
          _id: variant._id,
          ProductVariantName: variant.ProductVariantName,
          Price: variant.Price,
          Quantity: variant.Quantity,
          Image: variant.Image
        }))
      })) : [],

    };


    res.json(formattedOrder);
  } catch (error) {
    console.error("Error in getOrderDetail:", error);
    res.status(500).json({
      message: "Error fetching order details",
      error: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { Status } = req.body;

    // Validate orderId
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    // Validate status
    const validStatuses = ["Pending", "Delivered", "Cancelled"];
    if (!validStatuses.includes(Status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }
    // Find the order and update its status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { "Status": Status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (Status === "Delivered" && Array.isArray(order.Items) && order.Items.length > 0) {
      // Cập nhật trạng thái của các OrderItem
      await OrderItem.updateMany(
        { _id: { $in: order.Items } },
        { $set: { Status: Status } }
      );

      // Lấy thông tin các OrderItem
      const orderItems = await OrderItem.find({ _id: { $in: order.Items } });

      for (const item of orderItems) {
        for (const product of item.Product) {
          for (const variant of product.ProductVariant) {
            const quantitySold = variant.Quantity;

            // Trừ StockQuantity và cộng vào Sales trong ProductVariant
            await Product.updateOne(
              {
                _id: product._id,
                "ProductVariant._id": variant._id,
              },
              {
                $inc: {
                  "ProductVariant.$.StockQuantity": -quantitySold,
                  "ProductVariant.$.Sales": quantitySold,
                  Sales: quantitySold
                }
              }
            );
          }
        }
      }
    }
    console.log("Order status updated successfully:", order);
    res.json({
      message: "Order status updated successfully",
      order: order
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({
      message: "Error updating order status",
      error: error.message
    });
  }
}
