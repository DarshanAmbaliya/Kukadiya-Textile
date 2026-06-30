// models/YarnPurchase.js
const mongoose = require("mongoose");

const yarnPurchaseSchema = new mongoose.Schema(
  {
    yarnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "YarnQuality",
      required: true,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    month: Number,
    year: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("YarnPurchase", yarnPurchaseSchema);