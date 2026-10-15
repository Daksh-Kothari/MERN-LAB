const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  seedProducts,
} = require("../controllers/product.controller");

const router = express.Router();

// Product routes
router.post("/create", createProduct);
router.post("/seed", seedProducts);
router.post("/", createProduct);

router.get("/all", getProducts);
router.get("/", getProducts);

// Parameterized route MUST come after specific literal routes
router.get("/:id", getProductById);

module.exports = router;
