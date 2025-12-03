// ==================== IMPORTS ====================
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");

// ==================== CONFIG ====================
dotenv.config();
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" })); // to handle images (base64)
app.use(cors());

// ==================== DATABASE CONNECTION ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ==================== ROUTES ====================
app.use("/api/orders", orderRoutes);

// ==================== SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
