# 🛒 ShopKart — Full-Stack MERN E-Commerce Platform

A modern, responsive full-stack e-commerce web application built with the **MERN** stack (MongoDB, Express.js, React, Node.js) featuring secure user authentication, product catalog, wishlist, shopping cart, and end-to-end payment processing with **Razorpay**.

---

## 🚀 Features

- **🔐 Authentication & Authorization**:
  - Secure user registration and login with password hashing via `bcrypt`.
  - Stateless authentication with JSON Web Tokens (JWT) stored in HTTP-only cookies.
  - Client-side protected routes for authenticated user actions.

- **🛍️ Product Browsing**:
  - Comprehensive product catalog with real-time search and category filtering.
  - Rich product details page with image previews, stock status, pricing, and descriptions.
  - Built-in seeding endpoint for rapid database population.

- **❤️ Wishlist Management**:
  - Add, remove, or toggle products in user wishlists.
  - Real-time wishlist item counter in navbar.

- **🛒 Shopping Cart**:
  - Add items to cart with dynamic quantity updates (+ / -).
  - Subtotal and total calculation with shipping and taxes.
  - One-click clear cart functionality.

- **💳 Checkout & Razorpay Payments**:
  - Interactive checkout flow with customer shipping address capture.
  - Secure online payment integration using **Razorpay**.
  - Server-side cryptographic payment verification (HMAC SHA-256).
  - Instant order placement, order success confirmation, and order history tracking.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with credentials support)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Security**: `jsonwebtoken` (JWT), `bcrypt`, `cors`, `cookie-parser`
- **Payments**: [Razorpay SDK](https://razorpay.com/docs/)

---

## 📂 Project Structure

```text
MERN-LAB/
├── client/                     # Frontend client root
│   ├── vite-project/           # Vite React application
│   │   ├── public/             # Static assets (icons, favicons)
│   │   ├── src/
│   │   │   ├── axiosCalls/     # Axios client configuration
│   │   │   ├── components/     # Reusable UI components (Navbar, Footer, ProductCard, etc.)
│   │   │   ├── context/        # React contexts (AuthContext, CartContext)
│   │   │   ├── Pages/          # View pages (Home, Products, Cart, Checkout, Orders, etc.)
│   │   │   ├── App.jsx         # App router setup
│   │   │   └── main.jsx        # Entry point
│   │   ├── .env.example        # Frontend environment variables template
│   │   └── package.json
│   └── package.json            # Client root runner scripts
├── server/                     # Backend API server
│   ├── config/                 # Third-party configurations (Razorpay)
│   ├── controllers/            # Request handlers (auth, products, cart, wishlist, orders)
│   ├── middlewares/            # Custom middlewares (authMiddleware)
│   ├── models/                 # Mongoose schemas (User, Customer, Product, Order)
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Helper utilities (token generator)
│   ├── index.js                # Server entry point
│   ├── .env.example            # Backend environment variables template
│   └── package.json
├── .gitignore                  # Git ignore rules for root, client, and server
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Configuration

### 1. Server Configuration (`server/.env`)
Create a `.env` file in the `server` directory based on `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopkart
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 2. Client Configuration (`client/vite-project/.env`)
Create a `.env` file in the `client/vite-project` directory based on `client/vite-project/.env.example`:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance
- [Razorpay Account](https://dashboard.razorpay.com/) (Test mode keys)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Daksh-Kothari/MERN-LAB.git
cd MERN-LAB
```

---

### Step 2: Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
# Server will run on http://localhost:5000
```

---

### Step 3: Frontend Setup
Open a new terminal window:

```bash
# Navigate to client directory
cd client/vite-project

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Client will run on http://localhost:5173
```

---

## 🔌 API Endpoints Reference

### 🔐 Authentication (`/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/register` | Register a new customer | Public |
| `POST` | `/login` | Log in customer & set JWT cookie | Public |
| `GET` | `/me` | Get currently logged-in user profile | Protected |
| `POST` | `/logout` | Log out customer & clear cookie | Protected |

### 📦 Products (`/products`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/products` or `/products/all` | Fetch all products | Public |
| `GET` | `/products/:id` | Fetch product details by ID | Public |
| `POST` | `/products/create` | Add a new product | Public/Admin |
| `POST` | `/products/seed` | Seed default product data | Public/Admin |

### ❤️ Wishlist (`/wishlist`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/wishlist/my-wishlist` | Get logged-in user's wishlist | Protected |
| `GET` | `/wishlist/count` | Get total count of wishlist items | Protected |
| `POST` | `/wishlist/:productId` | Add product to wishlist | Protected |
| `DELETE` | `/wishlist/:productId` | Remove product from wishlist | Protected |
| `PATCH` | `/wishlist/:productId/toggle`| Toggle product in wishlist | Protected |

### 🛒 Cart (`/cart`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/cart/my-cart` | Fetch user's cart | Protected |
| `POST` | `/cart/:productId` | Add item to cart | Protected |
| `PATCH` | `/cart/:productId` | Update item quantity in cart | Protected |
| `DELETE` | `/cart/:productId` | Remove item from cart | Protected |
| `DELETE` | `/cart/clear` | Clear all items from cart | Protected |

### 💳 Orders & Payments (`/orders`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/orders/create-payment-order` | Create Razorpay payment order | Protected |
| `POST` | `/orders/verify-payment` | Verify Razorpay payment signature & create order | Protected |
| `GET` | `/orders/my-orders` | Get user order history | Protected |
| `GET` | `/orders/:id` | Get specific order details | Protected |
| `PATCH` | `/orders/:id/status` | Update order delivery/fulfillment status | Protected |

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).