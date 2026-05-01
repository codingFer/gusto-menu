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

      {/* Combo / Menú Completo Section */}
      {data.menuPrice > 0 && (
        <ComboBuilder data={data} />
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

const ComboBuilder = ({ data }) => {
  const { addToCart, showToast } = useApp();
  const soups = data.items.filter(i => (i.tipo || i.type || '').toLowerCase() === 'sopa');
  const seconds = data.items.filter(i => (i.tipo || i.type || '').toLowerCase() === 'segundo');

  const [selSopa, setSelSopa] = useState(soups[0]?.nombre || soups[0]?.name || '');
  const [selSegundo, setSelSegundo] = useState(seconds[0]?.nombre || seconds[0]?.name || '');

  const handleAdd = () => {
    const comboName = `Menú Completo: ${selSopa} + ${selSegundo}`;
    const comboId = `combo-${selSopa}-${selSegundo}`;
    addToCart(comboId, { name: comboName, price: data.menuPrice });
    showToast('✨ Combo añadido al carrito');
  };

  return (
    <div className="section-card animate-in" style={{ background: 'var(--primary-container)', border: '2px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>🍱 Menú Completo</div>
        <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>Bs.{data.menuPrice}</div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--primary)' }}>Selecciona tu Sopa</label>
          <select className="form-input" value={selSopa} onChange={(e) => setSelSopa(e.target.value)}>
            {soups.map((s, i) => <option key={i} value={s.nombre || s.name}>{s.nombre || s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--primary)' }}>Selecciona tu Segundo</label>
          <select className="form-input" value={selSegundo} onChange={(e) => setSelSegundo(e.target.value)}>
            {seconds.map((s, i) => <option key={i} value={s.nombre || s.name}>{s.nombre || s.name}</option>)}
          </select>
        </div>
        <button className="btn btn--primary btn--full" onClick={handleAdd} style={{ marginTop: '8px' }}>
          Añadir Menú Completo
        </button>
      </div>
    </div>
  );
};

const CheckoutBar = ({ data }) => {
  const { cart } = useApp();
  const cartEntries = Object.entries(cart);
  const totalItems = cartEntries.reduce((acc, [_, item]) => acc + item.qty, 0);
  
  if (totalItems === 0) return null;

  let totalPrice = 0;
  let orderLines = [];

  cartEntries.forEach(([key, cartItem]) => {
    let name = '';
    let price = 0;

    if (key.startsWith('combo-')) {
      name = cartItem.name;
      price = parseFloat(cartItem.price || 0);
    } else {
      const item = data.items.find(i => (i.id || i.name) == key);
      if (item) {
        name = item.nombre || item.name;
        price = parseFloat(item.precio || item.price || 0);
      }
    }

    if (name) {
      totalPrice += price * cartItem.qty;
      orderLines.push(`*${cartItem.qty}x* ${name} _(Bs.${(price * cartItem.qty).toFixed(1)})_`);
    }
  });

  const handleOrder = () => {
    const phone = data.whatsapp || '';
    const message = encodeURIComponent(
      `*NUEVO PEDIDO - ${data.name}*\n` +
      `--------------------------\n` +
      orderLines.join('\n') +
      `\n--------------------------\n` +
      `*TOTAL: Bs.${totalPrice.toFixed(1)}*\n\n` +
      `Por favor, confírmenme el pedido. ¡Gracias!`
    );
    window.open(`https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="sticky-bar animate-in" style={{ borderTop: 'none', background: 'transparent', pointerEvents: 'none' }}>
      <div className="sticky-inner" style={{ pointerEvents: 'auto', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-pill)', padding: '12px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 700 }}>{totalItems} platillos</span>
          <span style={{ fontSize: '18px', fontWeight: 900 }}>Bs.{totalPrice.toFixed(1)}</span>
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
  const qty = cart[itemKey]?.qty || 0;

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
