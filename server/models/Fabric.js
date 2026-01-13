const mongoose = require("mongoose")

const FabricQualitySchema = new mongoose.Schema({
  fabric_name: {
    type: String,
    required: true,
    unique: true 
  },
}, { timestamps: true })

module.exports = mongoose.model("FabricQuality", FabricQualitySchema)