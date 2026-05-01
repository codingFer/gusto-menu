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
import { createFullMenu, getRestaurantes, getTiposPlatillo } from '../api';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Plus, 
  Utensils, 
  Share2, 
  Eye, 
  Save, 
  MapPin, 
  Soup, 
  Salad, 
  Coffee, 
  IceCream 
} from 'lucide-react';

const LS_KEY = 'gustomenu_creator';

const Creator = () => {
  const navigate = useNavigate();
  const { showToast, user } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [myRestauranteId, setMyRestauranteId] = useState(null);
  const [tipos, setTipos] = useState([]);
  
  const [bizInfo, setBizInfo] = useState({
    name: '',
    prefix: '+591',
    phone: '',
    tagline: 'La alternativa de comer saludable, está aquí',
    promo: '',
    address: '',
    sides: ''
  });
  
  const [dishes, setDishes] = useState([]);
  const [openEmojiIdx, setOpenEmojiIdx] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [shareText, setShareText] = useState('');
  
  const linkSectionRef = useRef(null);

  useEffect(() => {
    async function init() {
      // Fetch user restaurant
      if (user) {
        try {
          const myRests = await getRestaurantes();
          if (myRests.length > 0) setMyRestauranteId(myRests[0].id);
        } catch (e) { console.error(e); }
      }

      // Fetch dynamic types from DB
      try {
        const typesData = await getTiposPlatillo();
        setTipos(typesData);
      } catch (e) { console.error('Failed to fetch types', e); }

      // Load draft from localStorage
      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setBizInfo(prev => ({
            ...prev,
            name: data.name || '',
            phone: data.phone || '',
            tagline: data.tagline || prev.tagline,
            promo: data.promo || '',
            address: data.address || '',
            sides: data.sides || ''
          }));
          if (data.dishes) setDishes(data.dishes);
        }
      } catch (e) { console.error(e); }
    }
    init();
  }, [user]);

  useEffect(() => {
    const data = { ...bizInfo, dishes };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [bizInfo, dishes]);

  const handleBizChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('biz-', '');
    setBizInfo(prev => ({ ...prev, [key]: value }));
  };

  const addDish = (type = 'segundo') => {
    let emoji = '🍽️';
    if (type === 'sopa') emoji = '🥣';
    if (type === 'postre') emoji = '🍰';
    if (type === 'bebida') emoji = '🥤';
    if (type === 'completo') emoji = '🍲';

    const newDish = {
      type,
      emoji,
      name: type === 'completo' ? 'Almuerzo Completo' : '',
      price: '',
    };
    
    setDishes([...dishes, newDish]);
    setTimeout(() => {
      const items = document.querySelectorAll('.dish-item');
      items[items.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const updateDish = (idx, field, value) => {
    const newDishes = [...dishes];
    newDishes[idx][field] = value;
    if (field === 'name') {
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
    
    const validItems = dishes.filter(d => d.name.trim() !== '');

    const data = {
      name: bizInfo.name.trim(),
      tagline: bizInfo.tagline.trim(),
      promo: bizInfo.promo.trim(),
      address: bizInfo.address.trim(),
      sides: bizInfo.sides.trim(),
      items: validItems
    };

    const encoded = encodeMenu(data);
    const url = `${window.location.origin}${window.location.pathname}#/menu?d=${encodeURIComponent(encoded)}`;
    setGeneratedUrl(url);

    // Grouping for the message
    const soups = validItems.filter(i => i.type === 'sopa');
    const seconds = validItems.filter(i => i.type === 'segundo' || i.type === 'standard');
    const desserts = validItems.filter(i => i.type === 'postre');
    const drinks = validItems.filter(i => i.type === 'bebida');

    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = today.toLocaleDateString('es-ES', options);
    
    const buildSection = (title, list, showPrice = true) => {
      if (list.length === 0) return '';
      const lines = list.map(item => {
        const priceStr = (showPrice && item.price) ? ` Bs.${item.price}` : '';
        return `- *${item.name}${priceStr}* ${item.emoji}`;
      }).join('\n');
      return `\n*${title}*\n${lines}\n`;
    };

    const sidesLines = bizInfo.sides ? bizInfo.sides.split(',').map(s => `* ${s.trim()}`).join('\n') : '';

    const text = 
      `BUENOS DIAS!  😃👋\n` +
      `Estimados clientes!!!\n\n` +
      `Les enviamos nuestro menú del día \n` +
      ` 🌵 *${bizInfo.name}* 🦙 \n` +
      `*Menú día ${dateStr}*\n` +
      `Te ofrecemos:\n` +
      buildSection('SOPAS', soups, false) +
      buildSection('SEGUNDOS', seconds) +
      buildSection('POSTRES', desserts) +
      buildSection('BEBIDAS', drinks) +
      (bizInfo.promo ? `\nESPECIAL DEL DIA:  *${bizInfo.promo}*\n` : '') +
      `\n🥦🥕🫛🌽🧅😋\n` +
      (bizInfo.sides ? `\n- *GUARNICION*\n${sidesLines}\n` : '') +
      `\n🥦🥕🫛🍋🟩\n` +
      `*${bizInfo.tagline}*!!!\n\n` +
      (bizInfo.address ? `Dirección: ${bizInfo.address}\n\n` : '') +
      `👇 *Ver menú con fotos y pedir aquí:*\n` +
      `${url}`;
    
    setShareText(text);
    setTimeout(() => {
      linkSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSaveToDashboard = async () => {
    if (!myRestauranteId) {
      showToast('⚠️ No tienes un restaurante asignado');
      return;
    }
    setIsSaving(true);
    try {
      await createFullMenu({
        restaurante_id: myRestauranteId,
        nombre: bizInfo.name,
        direccion: bizInfo.address,
        guarniciones: bizInfo.sides,
        name: bizInfo.name,
        theme: 'light',
        tagline: bizInfo.tagline,
        promo: bizInfo.promo,
        items: dishes
      });
      showToast('✅ Cambios guardados en tu panel');
      navigate('/dashboard');
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container animate-in" style={{ paddingBottom: '120px' }}>
      <div className="creator-header">
        <h1>Crea tu Menú de Hoy</h1>
        <p>Configura tu menú completo y compártelo al instante.</p>
      </div>

      {/* Business Info */}
      <div className="section-card">
        <div className="section-title">Información General</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Nombre del restaurante</label>
            <input className="form-input" id="biz-name" type="text" placeholder="ej. Alter NATIVA" value={bizInfo.name} onChange={handleBizChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Especial del día</label>
            <input className="form-input" id="biz-promo" placeholder="ej. Pollo al horno 17Bs" value={bizInfo.promo} onChange={handleBizChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Guarniciones (opcional)</label>
            <div style={{ position: 'relative' }}>
              <Salad size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input className="form-input" id="biz-sides" style={{ paddingLeft: '36px' }} placeholder="ej. Arroz blanco, Arroz curry" value={bizInfo.sides} onChange={handleBizChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Link de Ubicación (Google Maps)
              <button 
                type="button" 
                onClick={() => window.open('https://www.google.com/maps', '_blank')}
                style={{ fontSize: '11px', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '2px 8px', borderRadius: '4px', background: 'none', cursor: 'pointer' }}
              >
                🔍 Buscar en Maps
              </button>
            </label>
            <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                <input 
                  className="form-input" 
                  id="biz-address" 
                  style={{ paddingLeft: '36px' }} 
                  placeholder="Pega el link de Google Maps aquí" 
                  value={bizInfo.address} 
                  onChange={handleBizChange} 
                />
              </div>
              <button 
                type="button"
                className="btn btn--secondary btn--icon" 
                title="Usar mi ubicación GPS actual"
                onClick={() => {
                  if (navigator.geolocation) {
                    showToast('🛰️ Obteniendo GPS...');
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const { latitude, longitude } = pos.coords;
                        const mapsUrl = `https://maps.google.com/maps?q=loc:${latitude},${longitude}`;
                        setBizInfo(prev => ({ ...prev, address: mapsUrl }));
                        showToast('📍 Link de ubicación generado');
                      },
                      (err) => {
                        showToast('❌ Error: ' + err.message);
                      }
                    );
                  } else {
                    showToast('❌ GPS no soportado');
                  }
                }}
              >
                <MapPin size={20} />
              </button>
            </div>
            <span className="form-hint">Puedes usar el botón 🛰️ o pegar el link compartido desde Google Maps.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Slogan</label>
            <input className="form-input" id="biz-tagline" placeholder="Tu frase característica" value={bizInfo.tagline} onChange={handleBizChange} />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="section-card">
        <div className="section-title">Platillos del Día</div>
        
        <div id="dishes-list">
          {dishes.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', opacity: 0.5 }}>
              Usa los botones de abajo para añadir platillos
            </div>
          )}
          {dishes.map((d, i) => (
            <div key={i} className={`dish-item dish-item--${d.type}`}>
              <div className="dish-order-ctrls">
                <button className="order-btn" onClick={() => moveDish(i, 'up')} disabled={i === 0}><ChevronUp size={16} /></button>
                <button className="order-btn" onClick={() => moveDish(i, 'down')} disabled={i === dishes.length - 1}><ChevronDown size={16} /></button>
              </div>
              <div style={{ position: 'relative' }}>
                <button className="dish-emoji-btn" onClick={() => setOpenEmojiIdx(openEmojiIdx === i ? null : i)}>{d.emoji}</button>
                {openEmojiIdx === i && (
                  <div className="emoji-picker-popup">
                    {EMOJIS.map(e => <button key={e} onClick={() => { updateDish(i, 'emoji', e); setOpenEmojiIdx(null); }}>{e}</button>)}
                  </div>
                )}
              </div>
              <div className="dish-fields">
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', marginBottom: '2px', textTransform: 'uppercase' }}>
                  {d.type}
                </div>
                <input 
                  className="form-input" 
                  type="text" 
                  placeholder={`Nombre de la ${d.type}...`}
                  value={d.name} 
                  onChange={(e) => updateDish(i, 'name', e.target.value)} 
                />
                {(d.type !== 'sopa' && d.type !== 'completo') && (
                  <div className="price-row">
                    <span className="price-symbol">Bs</span>
                    <input className="form-input price-input" type="number" placeholder="0.00" value={d.price} onChange={(e) => updateDish(i, 'price', e.target.value)} />
                  </div>
                )}
              </div>
              <button className="dish-remove" onClick={() => removeDish(i)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="creator-grid-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('sopa')} title="Añadir Sopa">
            <Soup size={18} /> Sopa
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('segundo')} title="Añadir Segundo">
            <Utensils size={18} /> Segundo
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('postre')} title="Añadir Postre">
            <IceCream size={18} /> Postre
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('bebida')} title="Añadir Bebida">
            <Coffee size={18} /> Bebida
          </button>
        </div>
      </div>

      {/* Results */}
      {generatedUrl && (
        <div className="section-card animate-in" ref={linkSectionRef}>
          <div className="section-title">🔗 Mensaje de WhatsApp Listo</div>
          <div className="share-text-box" style={{ whiteSpace: 'pre-wrap', fontSize: '13px', maxHeight: '300px', overflowY: 'auto', background: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius)' }}>{shareText}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
            <button className="btn btn--primary btn--full" onClick={() => { copyToClipboard(shareText); showToast('✅ Mensaje copiado'); }}>
              <Share2 size={18} /> Copiar para WhatsApp
            </button>
            {user && (
              <button className="btn btn--secondary btn--full" onClick={handleSaveToDashboard} disabled={isSaving}>
                <Save size={18} /> {isSaving ? 'Guardando...' : 'Publicar en mi Menú Web'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* CTA Sticky */}
      <div className="creator-cta">
        <div className="creator-cta-inner">
          <button className="btn btn--primary btn--full btn--pill" onClick={handleGenerate} style={{ height: '56px', fontSize: '18px' }}>
            Generar Menú del Día
          </button>
        </div>
      </div>
    </div>
  );
};

export default Creator;
