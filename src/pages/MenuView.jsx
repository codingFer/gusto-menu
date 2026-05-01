import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { decodeMenu, formatPrice } from '../utils';
import { getRestauranteById } from '../api';

const MenuView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const dParam = searchParams.get('d');

  useEffect(() => {
    async function loadMenu() {
      if (!dParam) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Check if it's a numeric ID
        if (/^\d+$/.test(dParam)) {
          const res = await getRestauranteById(dParam);
          // Convert DB format to local format expected by UI
          setData({
            name: res.nombre,
            theme: res.tema || 'light',
            items: res.platillos || [],
            whatsapp: res.whatsapp
          });
        } 
        // 2. Otherwise assume it's base64 encoded data
        else {
          const decoded = decodeMenu(dParam);
          if (decoded) {
            setData(decoded);
          }
        }
      } catch (err) {
        showToast('❌ No se pudo cargar el menú');
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [dParam]);

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>Cargando menú...</div>;
  }

  if (!data) {
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

  return (
    <div className="container animate-in" style={{ paddingBottom: '100px' }}>
      {/* Hero */}
      <div className="menu-hero">
        <h1>{data.name}</h1>
        {data.tagline && <div className="tagline">{data.tagline}</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <span className="badge badge--open">● ABIERTO</span>
          <span className="badge badge--time" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>⏱ 15-25 min</span>
        </div>
      </div>

      <div className="menu-section-title">Nuestros Clásicos</div>
      <div className="menu-grid">
        {data.items.map((item, i) => {
          return (
            <div key={i} className="menu-card animate-in" style={{ animationDelay: `${(i * 0.05)}s` }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="menu-card-emoji">{item.emoji}</div>
                <div>
                  <div className="menu-card-name">{item.nombre || item.name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div className="menu-card-price">{formatPrice(item.precio || item.price)}</div>
                <ItemControl item={item} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ItemControl = ({ item }) => {
  const { cart, addToCart, removeFromCart } = useApp();
  // Using item name as key for cart if no stable ID
  const itemKey = item.id || item.name;
  const qty = cart[itemKey] || 0;

  if (qty === 0) {
    return <button className="add-btn" onClick={() => addToCart(itemKey)} aria-label="Agregar">+</button>;
  }

  return (
    <div className="qty-controls">
      <button className="qty-btn" onClick={() => removeFromCart(itemKey)}>−</button>
      <span className="qty-num">{qty}</span>
      <button className="qty-btn" onClick={() => addToCart(itemKey)} style={{ background: 'var(--primary)', color: '#fff' }}>+</button>
    </div>
  );
};

export default MenuView;
