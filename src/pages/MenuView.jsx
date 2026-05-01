import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { decodeMenu, formatPrice } from '../utils';

const MenuView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    setMenuData, 
    menuData, 
    setCurrentMenuEncoded, 
    currentMenuEncoded,
    cart,
    addToCart,
    removeFromCart
  } = useApp();

  const encoded = searchParams.get('d');

  useEffect(() => {
    if (!encoded) {
      setMenuData(null);
      return;
    }

    if (currentMenuEncoded !== encoded) {
      const data = decodeMenu(encoded);
      if (data) {
        setMenuData(data);
        setCurrentMenuEncoded(encoded);
      } else {
        setMenuData(null);
      }
    }
  }, [encoded, currentMenuEncoded, setMenuData, setCurrentMenuEncoded]);

  if (!encoded || !menuData) {
    return (
      <div className="container">
        <div className="empty-state animate-in">
          <div className="empty-icon">😕</div>
          <div className="empty-title">Menú no encontrado</div>
          <div className="empty-desc">El link parece estar dañado o incompleto.</div>
          <button className="btn btn--primary btn--pill" onClick={() => navigate('/crear')}>Crear mi propio menú</button>
        </div>
      </div>
    );
  }

  const [promoItem, ...rest] = menuData.items;
  const hasPromo = menuData.promo && promoItem;

  return (
    <div className="container animate-in" style={{ paddingBottom: '100px' }}>
      {/* Hero */}
      <div className="menu-hero">
        <h1>{menuData.name}</h1>
        {menuData.tagline && <div className="tagline">{menuData.tagline}</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <span className="badge badge--open">● ABIERTO</span>
          <span className="badge badge--time" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>⏱ 15-25 min</span>
        </div>
      </div>

      {hasPromo && (
        <>
          <div className="menu-section-title">Promo del Día</div>
          <div className="promo-card">
            <div className="promo-badge">⚡ PROMO</div>
            <div className="promo-emoji">{promoItem.emoji}</div>
            <div className="promo-info">
              <div className="promo-name">{promoItem.name}</div>
              <div className="promo-desc">{menuData.promo}</div>
              <div className="promo-price">{formatPrice(promoItem.price)}</div>
            </div>
            <ItemControl idx={0} />
          </div>
        </>
      )}

      <div className="menu-section-title">Nuestros Clásicos</div>
      <div className="menu-grid">
        {menuData.items.map((item, i) => {
          if (hasPromo && i === 0) return null;
          
          let itemDisplayName = item.name;
          let subName = null;
          
          if (item.type === 'completo') {
            const parts = item.name.match(/\((.*) \+ (.*)\)/);
            if (parts) {
              itemDisplayName = "Almuerzo Completo";
              subName = `${parts[1]} + ${parts[2]}`;
            }
          }

          return (
            <div key={i} className="menu-card animate-in" style={{ animationDelay: `${(i * 0.05)}s` }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="menu-card-emoji">{item.emoji}</div>
                <div>
                  <div className="menu-card-name">
                    {item.type === 'completo' && <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800 }}>COMPLETO</div>}
                    {itemDisplayName}
                  </div>
                  {subName && <div style={{ fontSize: '12px', opacity: 0.7 }}>{subName}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div className="menu-card-price">{formatPrice(item.price)}</div>
                <ItemControl idx={i} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ItemControl = ({ idx }) => {
  const { cart, addToCart, removeFromCart } = useApp();
  const qty = cart[idx] || 0;

  if (qty === 0) {
    return <button className="add-btn" onClick={() => addToCart(idx)} aria-label="Agregar">+</button>;
  }

  return (
    <div className="qty-controls">
      <button className="qty-btn" onClick={() => removeFromCart(idx)}>−</button>
      <span className="qty-num">{qty}</span>
      <button className="qty-btn" onClick={() => addToCart(idx)} style={{ background: 'var(--primary)', color: '#fff' }}>+</button>
    </div>
  );
};

export default MenuView;
