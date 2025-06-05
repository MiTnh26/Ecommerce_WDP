const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    OrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    ProductVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    Price: {
      type: Number,
      required: true,
      default: 0,
    },
    Quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    Status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema, "orderItems");
