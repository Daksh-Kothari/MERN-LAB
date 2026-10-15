const express = require("express");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All cart operations require authentication
router.get("/my-cart", authMiddleware, getCart);
router.delete("/clear", authMiddleware, clearCart);
router.post("/:productId", authMiddleware, addToCart);
router.patch("/:productId", authMiddleware, updateQuantity);
router.delete("/:productId", authMiddleware, removeFromCart);

module.exports = router;
