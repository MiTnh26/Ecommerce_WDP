const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    Username: {
      type: String,
      default: "",
    },
    DateOfBirth: {
      type: Date,
      default: "",
    },
    Email: {
      type: String,
      unique: true,
      require: true,
    },
    FirstName: {
      type: String,
      default: "",
    },
    Gender: {
      type: String,
    },
    Image: {
      type: String,
      default: "",
    },
    LastName: {
      type: String,
      default: "",
    },
    Password: {
      type: String,
    },
    PhoneNumber: {
      type: String,
    },
    ShippingAddress: [
      {
        address: String,
        phoneNumber: Number,
        status: {
          type: String,
          enum: ["Inactive", "Default"],
          default: "Inactive",
        },
        receiverName: String,
      },
    ],
    Status: {
      type: String,
      enum: ["Active", "Banned"],
      default: "Active",
    },
    UserRole: {
      type: String,
      enum: ["Admin", "Customer", "Seller"],
      default: "Customer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema, "users");
