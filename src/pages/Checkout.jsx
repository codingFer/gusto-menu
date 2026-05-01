import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { menuData, cart, getCartTotal, showToast } = useApp();
  const [customerName, setCustomerName] = useState('');

  const { count, total } = getCartTotal();

  if (!menuData || count === 0) {
    // If no data, try to redirect back to menu
    const d = searchParams.get('d');
    if (d) {
      navigate(`/menu?d=${d}`);
    } else {
      navigate('/');
    }
    return null;
  }

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([idx, qty]) => ({ item: menuData.items[+idx], qty, idx: +idx }));

  const handleSendOrder = () => {
    if (!customerName.trim()) {
      showToast('⚠️ Por favor ingresa tu nombre');
      return;
    }

    const sep = '──────────────────';
    const itemsText = cartItems.map(({ item, qty }) => 
      `• ${qty}x ${item.emoji} *${item.name}*`
    ).join('\n');

    const message = 
      `*NUEVO PEDIDO* 📝\n` +
      `${sep}\n` +
      `👤 *Cliente:* ${customerName.trim()}\n` +
      `${sep}\n` +
      `📖 *Detalle:*\n${itemsText}\n` +
      `${sep}\n` +
      `💰 *Total:* ${formatPrice(total)}\n\n` +
      `_Pedido enviado desde GustoMenu_`;

    const waUrl = `https://wa.me/${menuData.phone}?text=${encodeURIComponent(message)}`;
    window.location.href = waUrl;
  };

  return (
    <div className="container animate-in">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="checkout-title">Tu Pedido</div>
      </div>

      <div className="order-summary-card">
        <div className="order-summary-head">🧾 Resumen</div>
        {cartItems.map(({ item, qty, idx }) => (
          <div key={idx} className="order-item">
            <div className="order-item-left">
              <span className="order-qty-badge">{qty}x</span>
              <span className="order-item-name">{item.emoji} {item.name}</span>
            </div>
            <span className="order-item-price">{formatPrice(qty * parseFloat(item.price))}</span>
          </div>
        ))}
        <div className="order-totals">
          <div className="divider"></div>
          <div className="order-row">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="order-total-row">
            <span>Total</span>
            <span className="total-amount">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="customer-card">
        <div className="customer-card-header">
          <span className="customer-card-icon">👤</span>
          <span className="customer-card-title">Tus Datos</span>
        </div>
        <div className="form-group">
          <label className="form-label">Tu Nombre</label>
          <input 
            className="form-input" 
            type="text" 
            placeholder="ej. Juan Pérez" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <button 
          className="btn btn--whatsapp btn--full btn--pill" 
          onClick={handleSendOrder}
        >
          ✅ Confirmar y enviar WhatsApp
        </button>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
          Se abrirá WhatsApp para enviar tu pedido a <b>{menuData.name}</b>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
