const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    Status: { type: String, default: "Active" },
    Name: String,
    Type: String,
    Image: String,
    Provider: String,
    Default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema, "payment");
