const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    describe: {
      type: String,
    },
    logo: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema, "shops");
