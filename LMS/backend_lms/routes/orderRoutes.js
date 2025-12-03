const express = require("express");
const router = express.Router();
const Order = require("../models/Order.js");

// ========== PLACE NEW ORDER ==========
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ success: true, message: "Order placed!", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========== GET ALL ORDERS (Admin) ==========
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== GET SINGLE ORDER (Track) ==========
router.get("/:id/:phone", async (req, res) => {
  try {
    const { id, phone } = req.params;
    const order = await Order.findOne({ id, customerPhone: phone });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== UPDATE ORDER STATUS ==========
router.patch("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
