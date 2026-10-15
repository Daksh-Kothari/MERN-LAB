const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ADD PRODUCT TO CART
// POST /cart/:productId
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find Product and verify it exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is currently in stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // Find authenticated customer
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    // Check if product is already in the cart
    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      const currentQty = user.cart[cartItemIndex].quantity;
      const targetQty = currentQty + 1;

      // Validate that new quantity does not exceed product stock
      if (targetQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Requested quantity (${targetQty}) exceeds available stock (${product.stock}).`,
        });
      }

      user.cart[cartItemIndex].quantity = targetQty;
    } else {
      // Add product with initial quantity = 1
      user.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await user.save();

    // Return populated cart
    const updatedUser = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const validCart = (updatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: validCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET CURRENT USER'S CART
// GET /cart
const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out items whose referenced product was deleted
    const validCart = (user.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE CART ITEM QUANTITY
// PATCH /cart/:productId
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity is a valid number >= 1
    const parsedQuantity = Number(quantity);
    if (quantity === undefined || isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number and at least 1",
      });
    }

    // Verify product exists and check stock limit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity (${parsedQuantity}) exceeds available stock (${product.stock})`,
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartItemIndex = (user.cart || []).findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    user.cart[cartItemIndex].quantity = parsedQuantity;
    await user.save();

    const updatedUser = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const validCart = (updatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: validCart,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// REMOVE PRODUCT FROM CART
// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartItemIndex = (user.cart || []).findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    user.cart.splice(cartItemIndex, 1);
    await user.save();

    const updatedUser = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const validCart = (updatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: validCart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// CLEAR ENTIRE CART
// DELETE /cart
const clearCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.cart = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: [],
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
