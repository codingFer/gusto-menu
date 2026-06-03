import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('gustomenu_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [cart, setCart] = useState({});
  const [menuData, setMenuData] = useState(null);
  const [currentMenuEncoded, setCurrentMenuEncoded] = useState(null);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gustomenu_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gustomenu_theme', theme);
  }, [theme]);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('gustomenu_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('gustomenu_user');
    localStorage.removeItem('gustomenu_token');
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const showToast = (message, duration = 2200) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const getCartTotal = () => {
    if (!menuData || !menuData.items) return { count: 0, total: 0 };
    let count = 0, total = 0;
    Object.entries(cart).forEach(([key, cartItem]) => {
      if (cartItem && cartItem.qty > 0) {
        count += cartItem.qty;
        let price = 0;
        if (key.startsWith('combo-')) {
          price = parseFloat(cartItem.price || 0);
        } else {
          const baseKey = key.includes('_') ? key.split('_')[0] : key;
          const item = menuData.items.find(i => (i.id || i.name) == baseKey);
          if (item) price = parseFloat(item.precio || item.price || 0);
        }
        total += cartItem.qty * price;
      }
    });
    return { count, total };
  };

  const addToCart = (id, customData = null) => {
    setCart(prev => {
      const existing = prev[id];
      if (existing) {
        return { ...prev, [id]: { ...existing, qty: existing.qty + 1 } };
      }
      return { ...prev, [id]: { qty: 1, ...(customData || {}) } };
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (!newCart[id]) return prev;
      if (newCart[id].qty > 1) {
        newCart[id] = { ...newCart[id], qty: newCart[id].qty - 1 };
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const clearCart = () => setCart({});

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      cart, setCart, addToCart, removeFromCart, clearCart, getCartTotal,
      menuData, setMenuData,
      currentMenuEncoded, setCurrentMenuEncoded,
      toast, showToast,
      user, loginUser, logoutUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
