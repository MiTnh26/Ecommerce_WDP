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
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    TotalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema, "orders");
