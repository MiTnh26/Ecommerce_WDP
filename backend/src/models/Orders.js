const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    OrderDate: {
      type: Date,
      default: Date.now,
    },
    PaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    ShippingAddress: {
      type: String,
      required: true,
      default: "",
    },
    Status: {
      type: String,
      enum: ["Pending", "Cancelled", "Delivered"],
      default: "Pending",
    },
    TotalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    BuyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ShopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    Items: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
    },
    receiverName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema, "orders");
