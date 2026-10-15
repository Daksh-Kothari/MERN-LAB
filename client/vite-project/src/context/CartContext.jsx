import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { axiosInstance } from '../axiosCalls/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { [productId]: 'add' | 'update' | 'remove' }

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/cart/my-cart');
      if (res.data && res.data.success) {
        setCartItems(res.data.cart || []);
      } else {
        setError(res.data?.message || 'Unable to load your cart.');
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Unable to load your cart.');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync cart when authenticated user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add Product to Cart
  const addToCart = async (productId) => {
    if (!user) {
      return { success: false, message: 'Please log in to add items to your cart' };
    }

    setActionLoading((prev) => ({ ...prev, [productId]: 'add' }));
    setError(null);

    try {
      const res = await axiosInstance.post(`/cart/${productId}`);
      if (res.data && res.data.success) {
        setCartItems(res.data.cart || []);
        return { success: true, message: res.data.message || 'Added to cart' };
      } else {
        const msg = res.data?.message || 'Failed to add item to cart';
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Update Product Quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (!user) {
      return { success: false, message: 'Please log in' };
    }

    if (newQuantity < 1) {
      return { success: false, message: 'Quantity must be at least 1' };
    }

    setActionLoading((prev) => ({ ...prev, [productId]: 'update' }));
    setError(null);

    try {
      const res = await axiosInstance.patch(`/cart/${productId}`, {
        quantity: newQuantity,
      });

      if (res.data && res.data.success) {
        setCartItems(res.data.cart || []);
        return { success: true, message: 'Cart quantity updated' };
      } else {
        const msg = res.data?.message || 'Unable to update quantity';
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update quantity';
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Remove Product from Cart
  const removeFromCart = async (productId) => {
    if (!user) return { success: false, message: 'Please log in' };

    setActionLoading((prev) => ({ ...prev, [productId]: 'remove' }));
    setError(null);

    try {
      const res = await axiosInstance.delete(`/cart/${productId}`);
      if (res.data && res.data.success) {
        setCartItems(res.data.cart || []);
        return { success: true, message: 'Product removed from cart' };
      } else {
        const msg = res.data?.message || 'Failed to remove product';
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove product';
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Clear Cart
  const clearCart = async () => {
    if (!user) return;
    try {
      await axiosInstance.delete('/cart/clear');
      setCartItems([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // Derived Values: Never stored separately in state or DB
  const totalCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return sum + (price * qty);
    }, 0);
  }, [cartItems]);

  const isInCart = useCallback((productId) => {
    return cartItems.some((item) => (item.product?._id || item.product) === productId);
  }, [cartItems]);

  const getItemQuantity = useCallback((productId) => {
    const found = cartItems.find((item) => (item.product?._id || item.product) === productId);
    return found ? found.quantity : 0;
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    actionLoading,
    totalCount,
    subtotal,
    itemCount: cartItems.length,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
