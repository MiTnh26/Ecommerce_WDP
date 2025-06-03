const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  PaymentMethod: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema, "payment");
