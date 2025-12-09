const mongoose = require("mongoose");

const foodPartnerSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});

const foodPartnerModel = mongoose.model("foodpartner", foodPartnerSchema);

module.exports = foodPartnerModel;
