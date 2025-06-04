const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    CategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    ProductName: {
      type: String,
      required: true,
      default: "",
    },
    Description: {
      type: String,
      default: "",
    },
    ShopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    Status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    CreatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema, "products");
