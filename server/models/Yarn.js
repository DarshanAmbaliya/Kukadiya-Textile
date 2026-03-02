const mongoose = require("mongoose");

const YarnQualitySchema = new mongoose.Schema(
  {
    yarn_name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YarnQuality", YarnQualitySchema);