const mongoose = require("mongoose");
const Product = require("../models/product.model");

// 1. CREATE PRODUCT
// POST /products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check required fields
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, price, category, image, stock) are required",
      });
    }

    // Validate price
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate stock
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// 2. GET ALL PRODUCTS (with search, category filter, and sorting)
// GET /products?search=...&category=...&sort=...
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    // Search filter (case-insensitive regex on name)
    if (search && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Category filter
    if (category && category.trim() !== "" && category.trim() !== "All") {
      filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    // Sorting option (bonus feature)
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// 3. GET SINGLE PRODUCT BY ID
// GET /products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
    });
  }
};

// 4. SEED SAMPLE PRODUCTS
// POST /products/seed
const seedProducts = async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches, tactile feedback, and durable aluminum top plate.",
        price: 2999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        stock: 15,
      },
      {
        name: "Noise Cancelling Headphones",
        description: "Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        stock: 25,
      },
      {
        name: "Minimalist Smart Watch",
        description: "Sleek fitness smartwatch with heart rate monitoring, sleep tracking, GPS, and 7-day battery life.",
        price: 3499,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        stock: 12,
      },
      {
        name: "Classic Denim Jacket",
        description: "Premium heavy-duty denim jacket with vintage wash, button closure, and comfortable relaxed fit.",
        price: 1999,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
        stock: 18,
      },
      {
        name: "Urban Casual Sneakers",
        description: "Lightweight breathable sneakers designed for maximum everyday comfort and sleek urban style.",
        price: 2499,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        stock: 8,
      },
      {
        name: "Fullstack Developer Handbook",
        description: "Comprehensive practical guide covering modern MERN stack development, API architecture, and cloud deployment.",
        price: 899,
        category: "Books",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        stock: 40,
      },
      {
        name: "Ergonomic Desk Chair",
        description: "High-back mesh office chair with adjustable lumbar support, 3D armrests, and smooth rolling casters.",
        price: 7999,
        category: "Home",
        image: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80",
        stock: 5,
      },
      {
        name: "Espresso Coffee Maker",
        description: "Compact 15-bar Italian pump espresso machine with steam wand for creamy cappuccinos and lattes.",
        price: 5499,
        category: "Home",
        image: "https://images.unsplash.com/photo-1517668808822-9ebe02f2a6e8?auto=format&fit=crop&w=800&q=80",
        stock: 10,
      },
    ];

    // Seed products into DB
    const existingCount = await Product.countDocuments();
    let inserted;
    if (existingCount === 0) {
      inserted = await Product.insertMany(sampleProducts);
    } else {
      // Re-seed or add missing
      inserted = await Product.insertMany(sampleProducts);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} sample products`,
      products: inserted,
    });
  } catch (error) {
    console.error("Seed Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to seed products",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  seedProducts,
};
