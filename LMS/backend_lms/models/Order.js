const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: String,
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  pickupDate: String,
  deliveryDate: String,
  services: [
    {
      name: String,
      quantity: Number,
      price: Number,
      total: Number,
      unit: String,
    },
  ],
  total: Number,
  status: { type: String, default: "pending" },
  clothesPhoto: String, // base64 or URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
