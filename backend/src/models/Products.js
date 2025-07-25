const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema({
  ProductVariantName: {
    type: String,
    required: true,
    default: "",
  },
  Image: {
    type: String,
    default: "",
  },
  Price: {
    type: Number,
    required: true,
    default: 0,
  },
  StockQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  Status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  Sales: {
    type: Number,
    default: 0,
  },
});

const productSchema = new mongoose.Schema({
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
  ProductVariant: {
    type: [productVariantSchema],
    default: [],
  },
  Status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  ProductImage: {
    type: String,
    default: "",
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  Sales: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Product", productSchema, "products");
