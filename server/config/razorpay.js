require("dotenv").config();
const Razorpay = require("razorpay");

let razorpay = null;

try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error("Failed to initialize Razorpay instance:", error);
}

module.exports = razorpay;
