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
        if (/^\d+$/.test(dParam)) {
          const res = await getRestauranteById(dParam);
          setData({
            name: res.nombre,
            tagline: res.tagline,
            promo: res.promo,
            theme: res.tema || 'light',
            items: res.platillos || [],
            whatsapp: res.whatsapp
          });
        } else {
          const decoded = decodeMenu(dParam);
          if (decoded) setData(decoded);
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
      
      {/* Especial del día (Promo) */}
      {data.promo && (
        <div className="promo-card animate-in">
          <div className="promo-badge">RECOMENDADO</div>
          <div className="promo-emoji">⭐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Especial del Día</div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{data.promo}</div>
          </div>
        </div>
      )}

      {['sopa', 'segundo', 'segundo suelto', 'postre', 'bebida'].map(type => {
        const sectionItems = data.items.filter(item => (item.tipo || item.type || '').toLowerCase() === type);
        if (sectionItems.length === 0) return null;

        return (
          <div key={type} style={{ marginBottom: '40px' }}>
            <div className="menu-section-title">
              {type === 'sopa' && '🥣 Sopas'}
              {type === 'segundo' && '🍽️ Segundos'}
              {type === 'segundo suelto' && '🍱 Segundos Sueltos'}
              {type === 'postre' && '🍰 Postres'}
              {type === 'bebida' && '🥤 Bebidas'}
            </div>
            <div className="menu-grid">
              {sectionItems.map((item, i) => (
                <div key={i} className="menu-card animate-in" style={{ animationDelay: `${(i * 0.05)}s` }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="menu-card-emoji">{item.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div className="menu-card-name">{item.nombre || item.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div className="menu-card-price">{formatPrice(item.precio || item.price)}</div>
                    <ItemControl item={item} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <CheckoutBar data={data} />
    </div>
  );
};

const CheckoutBar = ({ data }) => {
  const { cart } = useApp();
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  
  if (totalItems === 0) return null;

  // Calculate total price and build order text
  let totalPrice = 0;
  let orderLines = [];

  Object.entries(cart).forEach(([key, qty]) => {
    const item = data.items.find(i => (i.id || i.name) == key);
    if (item) {
      const price = parseFloat(item.precio || item.price || 0);
      totalPrice += price * qty;
      orderLines.push(`*${qty}x* ${item.nombre || item.name} _(Bs.${price * qty})_`);
    }
  });

  const handleOrder = () => {
    const phone = data.whatsapp || ''; // Assuming the restaurant phone is here
    const message = encodeURIComponent(
      `*NUEVO PEDIDO - ${data.name}*\n` +
      `--------------------------\n` +
      orderLines.join('\n') +
      `\n--------------------------\n` +
      `*TOTAL: Bs.${totalPrice}*\n\n` +
      `Por favor, confírmenme el pedido. ¡Gracias!`
    );
    window.open(`https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="sticky-bar animate-in" style={{ borderTop: 'none', background: 'transparent', pointerEvents: 'none' }}>
      <div className="sticky-inner" style={{ pointerEvents: 'auto', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-pill)', padding: '12px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 700 }}>{totalItems} platillos</span>
          <span style={{ fontSize: '18px', fontWeight: 900 }}>Bs.{totalPrice}</span>
        </div>
        <button className="btn btn--whatsapp btn--sm" onClick={handleOrder} style={{ boxShadow: 'none', background: '#fff', color: '#1ebe5d', minWidth: '140px' }}>
          Pedir WhatsApp
        </button>
      </div>
    </div>
  );
};

const ItemControl = ({ item }) => {
  const { cart, addToCart, removeFromCart } = useApp();
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
