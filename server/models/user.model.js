// user.model.js provides an alias to customer.model.js for standard User model conventions
const Customer = require("./customer.model");

module.exports = Customer;
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't send password by default
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          // Allow empty phone OR valid 10-digit Indian phone number
          return v === null || v === undefined || /^\d{10}$/.test(v);
        },
        message: "Please enter a valid 10-digit phone number",
      },
    },
    role: {
      type: String,
      enum: ["admin", "seller", "buyer"],
      default: "buyer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET || "jwt_secret_key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;