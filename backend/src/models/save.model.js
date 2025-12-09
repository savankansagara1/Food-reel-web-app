const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    // IMPORTANT: model name is "Food" (capital F) in food.model.js
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  },
  { timestamps: true }
);

saveSchema.index({ user: 1, food: 1 }, { unique: true });

const saveModel = mongoose.model("save", saveSchema);
module.exports = saveModel;
