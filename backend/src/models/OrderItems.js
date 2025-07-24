const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
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
  },
});

const orderItemSchema = new mongoose.Schema(
  {

    Product: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        ProductName: {
          type: String,
          required: true,
        },
        ProductImage: {
          type: String,
          required: true,
        },
        ProductVariant: [productVariantSchema],
      },
    ],
    Total: {
      type: Number,
      required: true,
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
