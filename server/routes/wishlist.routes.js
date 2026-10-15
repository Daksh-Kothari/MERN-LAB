const express = require("express");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
} = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All wishlist routes are protected by authentication middleware
router.get("/my-wishlist", authMiddleware, getWishlist);
router.get("/count", authMiddleware, getWishlistCount);
router.post("/:productId", authMiddleware, addToWishlist);
router.delete("/:productId", authMiddleware, removeFromWishlist);
router.patch("/:productId/toggle", authMiddleware, toggleWishlist);

module.exports = router;
