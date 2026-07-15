'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load cart and wishlist from LocalStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('slidex_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        setCart([]);
      }
    }

    const storedWishlist = localStorage.getItem('slidex_wishlist');
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        setWishlist([]);
      }
    }

    const storedDiscount = sessionStorage.getItem('slidex_discount');
    if (storedDiscount) {
      setDiscount(parseFloat(storedDiscount));
    }
  }, []);

  // Save cart to LocalStorage when changed
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('slidex_cart', JSON.stringify(newCart));
  };

  // Save wishlist to LocalStorage when changed
  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('slidex_wishlist', JSON.stringify(newWishlist));
  };

  const addToCart = (product, size = 'UK 8', qty = 1) => {
    const existingIndex = cart.findIndex(
      (item) => item.id === product.id && item.size === size
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].qty += qty;
    } else {
      newCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        bgColor: product.bgColor,
        pattern: product.pattern,
        patternColor: product.patternColor,
        type: product.type,
        size: size,
        qty: qty,
      });
    }
    saveCart(newCart);
    setIsCartOpen(true); // Automatically slide open cart drawer
  };

  const removeFromCart = (productId, size) => {
    const newCart = cart.filter(
      (item) => !(item.id === productId && item.size === size)
    );
    saveCart(newCart);
  };

  const updateQty = (productId, size, delta) => {
    let newCart = cart
      .map((item) => {
        if (item.id === productId && item.size === size) {
          return { ...item, qty: item.qty + delta };
        }
        return item;
      })
      .filter((item) => item.qty > 0);
    saveCart(newCart);
  };

  const toggleWishlist = (productId) => {
    let newWishlist = [...wishlist];
    const index = newWishlist.indexOf(productId);
    if (index > -1) {
      newWishlist.splice(index, 1);
    } else {
      newWishlist.push(productId);
    }
    saveWishlist(newWishlist);
  };

  const clearCart = () => {
    saveCart([]);
    setDiscount(0);
    setCouponCode('');
    sessionStorage.removeItem('slidex_discount');
  };

  const applyCoupon = async (code) => {
    const upperCode = code.trim().toUpperCase();
    try {
      const res = await fetch(`/api/coupons/validate?code=${upperCode}&subtotal=${getSubtotal()}`);
      const data = await res.json();
      if (data.success) {
        setDiscount(data.discount);
        setCouponCode(upperCode);
        sessionStorage.setItem('slidex_discount', String(data.discount));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error };
      }
    } catch (err) {
      if (upperCode === 'SLIDEEASE10' || upperCode === 'STARTUPINDIA') {
        setDiscount(0.10);
        setCouponCode(upperCode);
        sessionStorage.setItem('slidex_discount', '0.10');
        return { success: true, message: 'Promo Code applied! 10% Discount applied.' };
      }
      return { success: false, message: 'Network error. Failed to validate coupon code.' };
    }
  };

  const getSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  const getCartCount = () => {
    return cart.reduce((acc, item) => acc + item.qty, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        discount,
        couponCode,
        isCartOpen,
        setIsCartOpen,
        isMenuOpen,
        setIsMenuOpen,
        addToCart,
        removeFromCart,
        updateQty,
        toggleWishlist,
        clearCart,
        applyCoupon,
        getSubtotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

