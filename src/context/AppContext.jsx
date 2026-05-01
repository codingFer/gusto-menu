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
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const showToast = (message, duration = 2200) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const getCartTotal = () => {
    if (!menuData) return { count: 0, total: 0 };
    let count = 0, total = 0;
    Object.entries(cart).forEach(([idx, qty]) => {
      const item = menuData.items[+idx];
      if (item && qty > 0) {
        count += qty;
        total += qty * parseFloat(item.price || 0);
      }
    });
    return { count, total };
  };

  const addToCart = (idx) => {
    setCart(prev => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
  };

  const removeFromCart = (idx) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[idx] > 1) {
        newCart[idx] -= 1;
      } else {
        delete newCart[idx];
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
