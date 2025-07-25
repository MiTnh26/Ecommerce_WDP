// models/Cart.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema cho ProductVariant bên trong mỗi Item
const productVariantSchema = new Schema({
  Image: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  ProductVariantName: {
    type: String,
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
    min: 1,
  },
}); // bật _id cho từng variant nếu bạn cần

// Schema cho từng Item trong giỏ
const itemSchema = new Schema(
  {
    ProductName: {
      type: String,
      required: true,
    },
    ProductImage: {
      type: String,
      required: true,
    },
    ShopID: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    ProductVariant: [productVariantSchema],
  },
  { _id: true }
);

// Schema chính của giỏ hàng
const cartSchema = new Schema(
  {
    Items: [itemSchema],
    Quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    UserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema, "carts");
