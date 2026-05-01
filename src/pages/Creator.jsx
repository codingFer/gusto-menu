import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  EMOJIS, 
  autoSuggestEmoji, 
  encodeMenu, 
  formatPrice, 
  copyToClipboard 
} from '../utils';
import { ChevronUp, ChevronDown, Trash2, Plus, Utensils, Share2, Eye } from 'lucide-react';

const LS_KEY = 'gustomenu_creator';

const Creator = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  
  const [bizInfo, setBizInfo] = useState({
    name: '',
    prefix: '+591',
    phone: '',
    tagline: '',
    promo: ''
  });
  
  const [dishes, setDishes] = useState([]);
  const [openEmojiIdx, setOpenEmojiIdx] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [shareText, setShareText] = useState('');
  
  const linkSectionRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setBizInfo({
          name: data.name || '',
          prefix: data.prefix || '+591',
          phone: data.phone || '',
          tagline: data.tagline || '',
          promo: data.promo || ''
        });
        if (data.dishes) setDishes(data.dishes);
      }
    } catch (e) {
      console.error('Failed to load from LS', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = { ...bizInfo, dishes };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [bizInfo, dishes]);

  const handleBizChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('biz-', '');
    setBizInfo(prev => ({ ...prev, [key]: value }));
  };

  const addDish = (type = 'standard') => {
    const newDish = type === 'completo' 
      ? { type: 'completo', emoji: '🍲', name: 'Almuerzo Completo', soup: '', main: '', price: '' }
      : { type: 'standard', emoji: '🍽️', name: '', price: '' };
    
    setDishes([...dishes, newDish]);
    
    // Scroll to new dish
    setTimeout(() => {
      const items = document.querySelectorAll('.dish-item');
      items[items.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const updateDish = (idx, field, value) => {
    const newDishes = [...dishes];
    newDishes[idx][field] = value;

    // Auto-suggest emoji for name or soup/main
    if (field === 'name' || field === 'soup' || field === 'main') {
      const suggested = autoSuggestEmoji(value);
      if (suggested && suggested !== newDishes[idx].emoji) {
        newDishes[idx].emoji = suggested;
      }
    }
    
    setDishes(newDishes);
  };

  const removeDish = (idx) => {
    setDishes(dishes.filter((_, i) => i !== idx));
    setOpenEmojiIdx(null);
  };

  const moveDish = (idx, direction) => {
    const newDishes = [...dishes];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= dishes.length) return;
    
    const [removed] = newDishes.splice(idx, 1);
    newDishes.splice(targetIdx, 0, removed);
    setDishes(newDishes);
  };

  const handleGenerate = () => {
    if (!bizInfo.name.trim()) { showToast('⚠️ Ingresa el nombre del negocio'); return; }
    if (!bizInfo.phone.trim() || bizInfo.phone.replace(/\D/g,'').length < 7) { 
      showToast('⚠️ Ingresa el número de WhatsApp'); return; 
    }
    
    const validItems = dishes.filter(d => {
      const hasName = d.type === 'completo' ? (d.soup || d.main) : d.name;
      return hasName && parseFloat(d.price) >= 0;
    }).map(d => {
      if (d.type === 'completo') {
        return { ...d, name: `Almuerzo Completo (${d.soup} + ${d.main})` };
      }
      return d;
    });

    if (validItems.length === 0) { 
      showToast('⚠️ Agrega al menos un platillo con nombre y precio'); return; 
    }

    const data = {
      name: bizInfo.name.trim(),
      phone: (bizInfo.prefix + bizInfo.phone).replace(/\s/g,''),
      tagline: bizInfo.tagline.trim(),
      promo: bizInfo.promo.trim(),
      items: validItems
    };

    const encoded = encodeMenu(data);
    const url = `${window.location.origin}${window.location.pathname}#/menu?d=${encodeURIComponent(encoded)}`;
    setGeneratedUrl(url);

    // Build shareable text
    const sep = '━━━━━━━━━━━━━━━━━━━━';
    const itemLines = validItems.map(item => `   ${item.emoji} *${item.name}* — ${formatPrice(item.price)}`).join('\n');
    const text = 
      `🍽️ *${data.name}*\n` +
      (data.tagline ? `_${data.tagline}_\n` : '') +
      `${sep}\n\n` +
      `📖 *Menú de Hoy:*\n` +
      `${itemLines}\n\n` +
      `${sep}\n` +
      `👇 *Haz tu pedido aquí:*\n` +
      `${url}`;
    
    setShareText(text);
    
    setTimeout(() => {
      linkSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="container animate-in" style={{ paddingBottom: '120px' }}>
      <div className="creator-header">
        <h1>Crea tu Menú</h1>
        <p>Completa los datos y genera tu link personalizado.</p>
      </div>

      {/* Business Info */}
      <div className="section-card">
        <div className="section-title">Datos del Negocio</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="biz-name">Nombre del negocio</label>
            <input 
              className="form-input" 
              id="biz-name" 
              type="text" 
              placeholder="ej. Gusto Latino" 
              maxLength="60" 
              value={bizInfo.name}
              onChange={handleBizChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Número de WhatsApp</label>
            <div className="phone-row">
              <input 
                className="phone-prefix form-input" 
                id="biz-prefix" 
                type="text" 
                value={bizInfo.prefix}
                onChange={handleBizChange}
              />
              <div className="phone-input-wrap">
                <input 
                  className="form-input" 
                  id="biz-phone" 
                  type="tel" 
                  placeholder="Número de teléfono" 
                  value={bizInfo.phone}
                  onChange={handleBizChange}
                />
              </div>
            </div>
            <span className="form-hint">Incluye código de país si es necesario.</span>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="biz-tagline">Tagline / Slogan (opcional)</label>
            <input 
              className="form-input" 
              id="biz-tagline" 
              type="text" 
              placeholder="ej. Sabor que se siente. 🌮🔥" 
              maxLength="80" 
              value={bizInfo.tagline}
              onChange={handleBizChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="biz-promo">Promoción del Día (opcional)</label>
            <input 
              className="form-input" 
              id="biz-promo" 
              type="text" 
              placeholder="ej. 2x1 en Empanadas los Martes" 
              maxLength="100" 
              value={bizInfo.promo}
              onChange={handleBizChange}
            />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="section-card">
        <div className="section-title">Platillos</div>
        
        <div id="dishes-list">
          {dishes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-md)', border: '2px dashed var(--outline-variant)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)' }}>
              <div style={{ fontSize: '40px', marginBottom: 'var(--space-sm)' }}>🍽️</div>
              <div style={{ fontWeight: 800, color: 'var(--on-surface)' }}>Tu menú está vacío</div>
              <div style={{ fontSize: '14px', color: 'var(--on-surface-variant)', opacity: 0.7 }}>Comienza agregando tu primer platillo abajo.</div>
            </div>
          ) : (
            dishes.map((d, i) => (
              <div key={i} className="dish-item">
                <div className="dish-order-ctrls">
                  <button 
                    className="order-btn" 
                    onClick={() => moveDish(i, 'up')} 
                    disabled={i === 0}
                    title="Subir"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    className="order-btn" 
                    onClick={() => moveDish(i, 'down')} 
                    disabled={i === dishes.length - 1}
                    title="Bajar"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <button 
                    className="dish-emoji-btn" 
                    onClick={() => setOpenEmojiIdx(openEmojiIdx === i ? null : i)}
                  >
                    {d.emoji}
                  </button>
                  {openEmojiIdx === i && (
                    <div className="emoji-picker-popup">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => { updateDish(i, 'emoji', e); setOpenEmojiIdx(null); }}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dish-fields">
                  {d.type === 'completo' ? (
                    <>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>ALMUERZO COMPLETO</div>
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="Sopa (ej. Sopa de Maní)" 
                        value={d.soup} 
                        onChange={(e) => updateDish(i, 'soup', e.target.value)}
                        style={{ marginBottom: '4px' }}
                      />
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="Segundo (ej. Silpancho)" 
                        value={d.main} 
                        onChange={(e) => updateDish(i, 'main', e.target.value)}
                      />
                    </>
                  ) : (
                    <input 
                      className="form-input" 
                      type="text" 
                      placeholder="Nombre del platillo" 
                      value={d.name} 
                      onChange={(e) => updateDish(i, 'name', e.target.value)}
                    />
                  )}
                  <div className="price-row">
                    <span className="price-symbol">Bs</span>
                    <input 
                      className="form-input price-input" 
                      type="number" 
                      placeholder="0.00" 
                      value={d.price} 
                      onChange={(e) => updateDish(i, 'price', e.target.value)}
                    />
                  </div>
                </div>
                
                <button className="dish-remove" onClick={() => removeDish(i)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="creator-actions" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="btn btn--ghost btn--sm btn--full" onClick={() => addDish('standard')}>
              <Plus size={18} /> Platillo
            </button>
            <button className="btn btn--ghost btn--sm btn--full" onClick={() => addDish('completo')}>
              <Utensils size={18} /> Almuerzo
            </button>
          </div>
        </div>
      </div>

      {/* Generated Link */}
      {generatedUrl && (
        <div className="section-card animate-in" ref={linkSectionRef}>
          <div className="section-title">🔗 Tu Menú está listo</div>
          
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Link directo</label>
            <div className="link-box">
              <span>{generatedUrl}</span>
              <button className="btn btn--secondary btn--sm" onClick={() => { copyToClipboard(generatedUrl); showToast('✅ Link copiado'); }}>
                <Share2 size={16} /> Copiar
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Texto para compartir</label>
            <div className="share-text-box">{shareText}</div>
            <button className="btn btn--secondary btn--sm btn--full" onClick={() => { copyToClipboard(shareText); showToast('✅ Texto copiado'); }} style={{ marginTop: 'var(--space-xs)' }}>
              <Share2 size={16} /> Copiar Texto Completo
            </button>
          </div>

          <button className="btn btn--primary btn--full" onClick={() => window.open(generatedUrl, '_blank')}>
            <Eye size={20} /> Ver Menú Digital
          </button>
        </div>
      )}

      {/* Creator sticky CTA */}
      <div className="creator-cta">
        <div className="creator-cta-inner">
          <button className="btn btn--primary btn--full btn--pill" onClick={handleGenerate} style={{ fontSize: '17px' }}>
            <Share2 size={20} /> Generar Link del Menú
          </button>
        </div>
      </div>
    </div>
  );
};

export default Creator;
