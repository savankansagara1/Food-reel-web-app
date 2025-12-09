const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  video: { type: String, required: true },
  description: { type: String },
  foodPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "foodpartner", // keep this as your actual model name for partners
    required: true,
  },
  likeCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
});

const foodModel = mongoose.model("Food", foodSchema); // Model name is "Food"
module.exports = foodModel;
