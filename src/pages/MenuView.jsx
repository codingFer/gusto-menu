import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { decodeMenu, formatPrice } from '../utils';
import { getRestauranteById } from '../api';
import { Plus, Minus, Salad, X } from 'lucide-react';

const MenuView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast, cart, addToCart, setMenuData, setCurrentMenuEncoded } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1); // 1: Menú, 2: Carrito
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedChoices, setSelectedChoices] = useState({});

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
          
          const mappedItems = (res.platillos || []).map(p => ({
            ...p,
            id: p.id,
            name: p.nombre,
            price: p.precio,
            type: p.tipo_id === 1 ? 'sopa' : p.tipo_id === 2 ? 'segundo' : p.tipo_id === 3 ? 'segundo suelto' : p.tipo_id === 4 ? 'postre' : 'bebida',
            emoji: p.emoji || '🍽️',
            acompanamientos: p.acompanamientos || []
          }));

          const menuObj = {
            name: res.nombre,
            tagline: res.tagline || res.tema, // Fallback a tema si no hay tagline
            promo: res.promo,
            theme: res.tema || 'light',
            items: mappedItems,
            whatsapp: res.whatsapp,
            phone: res.whatsapp,
            menuPrice: res.precio_menu || 0,
            imagen_url: res.imagen_url
          };
          setData(menuObj);
          setMenuData(menuObj);
          setCurrentMenuEncoded(dParam);
        } else {
          const decoded = decodeMenu(dParam);
          if (decoded) {
            // Map items to make sure they have acompanamientos in decoded menu data
            if (decoded.items) {
              decoded.items = decoded.items.map(item => ({
                ...item,
                acompanamientos: item.acompanamientos || []
              }));
            }
            setData(decoded);
            setMenuData(decoded);
            setCurrentMenuEncoded(dParam);
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

  const handleAddItemClick = (item) => {
    if (item.acompanamientos && item.acompanamientos.length > 0) {
      setCustomizingItem(item);
      const initialChoices = {};
      item.acompanamientos.forEach(group => {
        if (group.opciones && group.opciones.length > 0) {
          initialChoices[group.titulo] = group.opciones[0];
        }
      });
      setSelectedChoices(initialChoices);
    } else {
      addToCart(item.id || item.name);
      showToast('🍴 Plato añadido al pedido');
    }
  };

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

  const hasItemsInCart = Object.keys(cart).length > 0;

  return (
    <>
    <div className="container animate-in" style={{ paddingBottom: '120px', paddingTop: '20px' }}>
      {/* Workflow Stepper */}
      <div className="stepper-container animate-in">
        <div className={`step-pill ${step === 1 ? 'active' : 'completed'}`} onClick={() => setStep(1)}>
          <span className="step-num">{step > 1 ? '✓' : '1'}</span>
          <span className="step-label">Menú</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-pill ${step === 2 ? 'active' : ''}`} onClick={() => hasItemsInCart && setStep(2)}>
          <span className="step-num">2</span>
          <span className="step-label">Carrito</span>
        </div>
        <div className="step-line"></div>
        <div className="step-pill">
          <span className="step-num">3</span>
          <span className="step-label">Pedido</span>
        </div>
      </div>

      {step === 1 ? (
        <div className="animate-in">
          {/* Hero */}
          <div className="menu-hero" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            {data.imagen_url && (
              <img 
                src={data.imagen_url} 
                alt="Logo" 
                style={{ 
                  width: '72px', 
                  height: '72px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '2px solid rgba(255,255,255,0.4)', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  flexShrink: 0 
                }} 
              />
            )}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ margin: 0, fontSize: '28px' }}>{data.name}</h1>
              {data.tagline && <div className="tagline" style={{ marginTop: '4px' }}>{data.tagline}</div>}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <span className="badge badge--open">● ABIERTO</span>
                <span className="badge badge--time" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>⏱ 15-25 min</span>
              </div>
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
            const sectionItems = data.items.filter(item => (item.tipo || item.type || '').toLowerCase() === type && (item.activo !== false && item.activo !== 0) && item.disponibilidad !== 'NO_DISPONIBLE');
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
                          {item.disponibilidad === 'MEDIA' && (
                            <div style={{ fontSize: '11px', color: '#b28e00', background: '#fff9e6', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: 'bold' }}>🟡 Pocas unidades</div>
                          )}
                          {item.disponibilidad === 'BAJA' && (
                            <div style={{ fontSize: '11px', color: '#d32f2f', background: '#ffebee', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: 'bold' }}>🟠 Por agotarse</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div className="menu-card-price">{formatPrice(item.precio || item.price)}</div>
                        <ItemControl itemKey={item.id || item.name} item={item} onAdd={handleAddItemClick} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="animate-in">
          <OrderReviewView data={data} onBack={() => setStep(1)} />
        </div>
      )}

    </div>
    {step === 1 && <CheckoutBar data={data} onReview={() => setStep(2)} />}

    {/* Customise Item Modal */}
    {customizingItem && (
      <div className="modal-overlay" onClick={() => setCustomizingItem(null)}>
        <div className="section-card animate-in modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
          <button className="modal-close" onClick={() => setCustomizingItem(null)}><X size={24} /></button>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '40px' }}>{customizingItem.emoji || '🍽️'}</span>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>{customizingItem.nombre || customizingItem.name}</h3>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                {formatPrice(customizingItem.precio || customizingItem.price)}
              </span>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--outline-variant)', margin: '12px 0' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {customizingItem.acompanamientos.map((group, gIdx) => (
              <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>
                    {group.titulo}
                  </label>
                  <span style={{ fontSize: '11px', background: 'var(--primary-container)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Obligatorio
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.opciones.map((opt, oIdx) => {
                    const isSelected = selectedChoices[group.titulo] === opt;
                    return (
                      <label 
                        key={oIdx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                          background: isSelected ? 'var(--primary-container)' : 'var(--surface-container-low)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontWeight: isSelected ? 'bold' : 'normal'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="radio" 
                            name={`choice-${gIdx}`} 
                            checked={isSelected}
                            onChange={() => setSelectedChoices(prev => ({ ...prev, [group.titulo]: opt }))}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '15px', color: isSelected ? 'var(--primary)' : 'var(--on-surface)', cursor: 'pointer' }}>{opt}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn btn--primary btn--full btn--pill" 
            style={{ height: '52px', fontSize: '16px' }}
            onClick={() => {
              const choicesArray = customizingItem.acompanamientos.map(g => selectedChoices[g.titulo]).filter(Boolean);
              const customKey = `${customizingItem.id || customizingItem.name}_${choicesArray.join('-')}`;
              const displayName = `${customizingItem.nombre || customizingItem.name} (${choicesArray.join(', ')})`;
              
              addToCart(customKey, { 
                name: displayName, 
                price: customizingItem.precio || customizingItem.price 
              });
              
              showToast('✨ Plato personalizado añadido');
              setCustomizingItem(null);
            }}
          >
            Añadir al Pedido
          </button>
        </div>
      </div>
    )}
    </>
  );
};

const OrderReviewView = ({ data, onBack }) => {
  const { cart } = useApp();
  const cartEntries = Object.entries(cart);
  
  let totalPrice = 0;
  cartEntries.forEach(([key, cartItem]) => {
    let price = 0;
    if (key.startsWith('combo-')) {
      price = parseFloat(cartItem.price || 0);
    } else {
      const baseKey = key.includes('_') ? key.split('_')[0] : key;
      const item = data.items.find(i => (i.id || i.name) == baseKey);
      if (item) {
        price = cartItem.price !== undefined ? parseFloat(cartItem.price) : parseFloat(item.precio || item.price || 0);
      }
    }
    totalPrice += price * cartItem.qty;
  });

  const handleFinalOrder = () => {
    let orderLines = [];
    cartEntries.forEach(([key, cartItem]) => {
      let name = '';
      let price = 0;
      if (key.startsWith('combo-')) {
        name = cartItem.name;
        price = parseFloat(cartItem.price || 0);
      } else {
        const baseKey = key.includes('_') ? key.split('_')[0] : key;
        const item = data.items.find(i => (i.id || i.name) == baseKey);
        if (item) {
          name = cartItem.name || item.nombre || item.name;
          price = cartItem.price !== undefined ? parseFloat(cartItem.price) : parseFloat(item.precio || item.price || 0);
        }
      }
      if (name) {
        orderLines.push(`*${cartItem.qty}x* ${name} _(Bs.${(price * cartItem.qty).toFixed(1)})_`);
      }
    });

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

  if (cartEntries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <div className="empty-title">Tu carrito está vacío</div>
        <button className="btn btn--primary btn--pill" onClick={onBack}>Volver al Menú</button>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ padding: '0 4px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Resumen de tu Pedido</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {cartEntries.map(([key, cartItem]) => (
          <CartItem key={key} itemKey={key} cartItem={cartItem} data={data} />
        ))}
      </div>

      <div className="section-card" style={{ background: 'var(--surface-container-low)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '22px', fontWeight: 900, marginBottom: '24px' }}>
          <span>Monto Total</span>
          <span style={{ color: 'var(--primary)' }}>Bs.{totalPrice.toFixed(1)}</span>
        </div>
        
        <button className="btn btn--primary btn--full btn--pill" onClick={handleFinalOrder} style={{ height: '60px', fontSize: '18px' }}>
          Confirmar y Pedir por WhatsApp
        </button>
        <button className="btn btn--ghost btn--full" onClick={onBack} style={{ marginTop: '12px' }}>
          ← Seguir añadiendo platos
        </button>
      </div>
    </div>
  );
};

const CartItem = ({ itemKey, cartItem, data }) => {
  const { removeFromCart, addToCart, showToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  
  const isCombo = itemKey.startsWith('combo-');
  let name = cartItem.name;
  let price = 0;
  let emoji = isCombo ? '🍱' : '🍴';

  if (!isCombo) {
    const baseKey = itemKey.includes('_') ? itemKey.split('_')[0] : itemKey;
    const item = data.items.find(i => (i.id || i.name) == baseKey);
    if (item) {
      name = cartItem.name || item.nombre || item.name;
      price = cartItem.price !== undefined ? parseFloat(cartItem.price) : parseFloat(item.precio || item.price || 0);
      emoji = item.emoji || '🍴';
    }
  } else {
    price = parseFloat(cartItem.price || 0);
  }

  // Edit logic for combo
  const soups = data.items.filter(i => (i.tipo || i.type || '').toLowerCase() === 'sopa');
  const seconds = data.items.filter(i => (i.tipo || i.type || '').toLowerCase() === 'segundo');

  const handleUpdateCombo = (newSopa, newSegundo) => {
    const newName = `Completo: ${newSopa} + ${newSegundo}`;
    const newKey = `combo-${newSopa}-${newSegundo}`;
    
    if (newKey === itemKey) {
      setIsEditing(false);
      return;
    }

    // Individual unit update:
    // This allows splitting a qty of 2+ into different combinations
    removeFromCart(itemKey); 
    addToCart(newKey, { name: newName, price: cartItem.price });
    
    setIsEditing(false);
    showToast('🔄 Se actualizó 1 unidad');
  };

  return (
    <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '32px' }}>{emoji}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>{name}</div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>{formatPrice(price)} c/u</div>
          </div>
        </div>
        <ItemControl itemKey={itemKey} />
      </div>

      {isCombo && (
        <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditing ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="form-input" style={{ fontSize: '12px', padding: '4px 8px' }} defaultValue={name.split(': ')[1]?.split(' + ')[0]} id={`edit-sopa-${itemKey}`}>
                  {soups.map((s, i) => <option key={i} value={s.nombre || s.name}>{s.nombre || s.name}</option>)}
                </select>
                <select className="form-input" style={{ fontSize: '12px', padding: '4px 8px' }} defaultValue={name.split(' + ')[1]} id={`edit-segundo-${itemKey}`}>
                  {seconds.map((s, i) => <option key={i} value={s.nombre || s.name}>{s.nombre || s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn--primary btn--sm" style={{ flex: 1 }} onClick={() => {
                  const s = document.getElementById(`edit-sopa-${itemKey}`).value;
                  const sg = document.getElementById(`edit-segundo-${itemKey}`).value;
                  handleUpdateCombo(s, sg);
                }}>Guardar</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setIsEditing(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="btn btn--ghost btn--sm" style={{ fontSize: '11px', height: '28px' }} onClick={() => setIsEditing(true)}>
              ✏️ Cambiar sopa o segundo
            </button>
          )}
        </div>
      )}
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
    const comboName = `Completo: ${selSopa} + ${selSegundo}`;
    const comboId = `combo-${selSopa}-${selSegundo}`;
    addToCart(comboId, { name: comboName, price: data.menuPrice });
    showToast('✨ Combo añadido');
  };

  return (
    <div className="section-card animate-in" style={{ background: 'var(--primary-container)', border: '2px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>🍱 Menú Completo</div>
        <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>Bs.{data.menuPrice}</div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--primary)' }}>Sopa</label>
          <select className="form-input" value={selSopa} onChange={(e) => setSelSopa(e.target.value)}>
            {soups.map((s, i) => <option key={i} value={s.nombre || s.name}>{s.nombre || s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--primary)' }}>Segundo</label>
          <select className="form-input" value={selSegundo} onChange={(e) => setSelSegundo(e.target.value)}>
            {seconds.map((s, i) => <option key={i} value={s.nombre || s.name}>{s.nombre || s.name}</option>)}
          </select>
        </div>
        <button className="btn btn--primary btn--full" onClick={handleAdd}>
          Añadir al Pedido
        </button>
      </div>
    </div>
  );
};

const CheckoutBar = ({ data, onReview }) => {
  const { cart } = useApp();
  const cartEntries = Object.entries(cart);
  const totalItems = cartEntries.reduce((acc, [_, item]) => acc + item.qty, 0);
  
  if (totalItems === 0) return null;

  let totalPrice = 0;
  cartEntries.forEach(([key, cartItem]) => {
    let price = 0;
    if (key.startsWith('combo-')) {
      price = parseFloat(cartItem.price || 0);
    } else {
      const baseKey = key.includes('_') ? key.split('_')[0] : key;
      const item = data.items.find(i => (i.id || i.name) == baseKey);
      if (item) {
        price = cartItem.price !== undefined ? parseFloat(cartItem.price) : parseFloat(item.precio || item.price || 0);
      }
    }
    totalPrice += price * cartItem.qty;
  });

  return (
    <div className="sticky-bar animate-in" style={{ padding: 0, borderTop: 'none', background: 'transparent', pointerEvents: 'none' }}>
      <div className="sticky-inner" style={{ pointerEvents: 'auto', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 0, padding: '16px 24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.3)', maxWidth: '100%', margin: 0, width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 700 }}>{totalItems} platillos</span>
          <span style={{ fontSize: '18px', fontWeight: 900 }}>Bs.{totalPrice.toFixed(1)}</span>
        </div>
        <button className="btn btn--whatsapp btn--sm" onClick={onReview} style={{ boxShadow: 'none', background: 'var(--on-primary)', color: 'var(--primary)', minWidth: '140px' }}>
          Ver Pedido
        </button>
      </div>
    </div>
  );
};

const ItemControl = ({ itemKey, item, onAdd }) => {
  const { cart, addToCart, removeFromCart } = useApp();

  const hasAcompanamientos = item && item.acompanamientos && item.acompanamientos.length > 0;

  if (hasAcompanamientos) {
    const totalQty = Object.entries(cart)
      .filter(([key]) => {
        const baseKey = key.includes('_') ? key.split('_')[0] : key;
        return baseKey == itemKey;
      })
      .reduce((sum, [, cartItem]) => sum + cartItem.qty, 0);

    if (totalQty === 0) {
      return (
        <button 
          className="add-btn" 
          onClick={() => onAdd(item)} 
          aria-label="Agregar"
        >
          <Plus size={20} />
        </button>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          background: 'var(--primary-container)', 
          color: 'var(--primary)', 
          padding: '4px 8px', 
          borderRadius: '12px',
          whiteSpace: 'nowrap'
        }}>
          {totalQty} en carrito
        </span>
        <button 
          className="qty-btn" 
          onClick={() => onAdd(item)}
          style={{ background: 'var(--primary)', color: 'var(--on-primary)', width: '28px', height: '28px' }}
          title="Añadir otro con diferentes opciones"
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }

  const qty = cart[itemKey]?.qty || 0;

  if (qty === 0) {
    return <button className="add-btn" onClick={() => addToCart(itemKey)} aria-label="Agregar"><Plus size={20} /></button>;
  }

  return (
    <div className="qty-controls">
      <button className="qty-btn" onClick={() => removeFromCart(itemKey)}><Minus size={16} /></button>
      <span className="qty-num">{qty}</span>
      <button className="qty-btn" onClick={() => addToCart(itemKey)} style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><Plus size={16} /></button>
    </div>
  );
};

export default MenuView;
