import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  EMOJIS, 
  autoSuggestEmoji, 
  encodeMenu, 
  formatPrice, 
  copyToClipboard 
} from '../utils';
import { createFullMenu, getRestaurantes, getTiposPlatillo, getRestauranteById, uploadLogo } from '../api';
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
  IceCream,
  X,
  Settings,
  ImageDown
} from 'lucide-react';
import ExportModal from '../components/ExportModal';

const LS_KEY = 'gustomenu_creator';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HorariosEditor = ({ horariosStr, onChange }) => {
  let parsed = [];
  try {
    if (horariosStr) {
      const p = JSON.parse(horariosStr);
      if (Array.isArray(p)) parsed = p;
    }
  } catch(e) {}

  const scheduleUi = DAYS.map(d => {
    const found = parsed.find(p => p.dia === d);
    if (found && found.horario && found.horario.toLowerCase() !== 'cerrado') {
      const parts = found.horario.split('-');
      return {
        dia: d,
        isOpen: true,
        openTime: parts[0]?.trim() || '09:00',
        closeTime: parts[1]?.trim() || '18:00'
      };
    }
    return { dia: d, isOpen: false, openTime: '09:00', closeTime: '18:00' };
  });

  const updateDay = (idx, field, val) => {
    const newUi = [...scheduleUi];
    newUi[idx] = { ...newUi[idx], [field]: val };
    
    const toSave = newUi.filter(d => d.isOpen).map(d => ({
      dia: d.dia,
      horario: `${d.openTime}-${d.closeTime}`
    }));
    onChange(JSON.stringify(toSave));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)' }}>
      {scheduleUi.map((item, i) => (
        <div key={item.dia} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={item.isOpen} 
              onChange={(e) => updateDay(i, 'isOpen', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontWeight: 600, fontSize: '13px', color: item.isOpen ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{item.dia}</span>
          </label>
          
          {item.isOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <input 
                type="time" 
                className="form-input" 
                style={{ padding: '4px 8px', height: 'auto', fontSize: '13px' }} 
                value={item.openTime} 
                onChange={(e) => updateDay(i, 'openTime', e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>a</span>
              <input 
                type="time" 
                className="form-input" 
                style={{ padding: '4px 8px', height: 'auto', fontSize: '13px' }} 
                value={item.closeTime} 
                onChange={(e) => updateDay(i, 'closeTime', e.target.value)}
              />
            </div>
          ) : (
            <div style={{ flex: 1, fontSize: '13px', color: 'var(--error)', fontStyle: 'italic', opacity: 0.8 }}>
              Cerrado
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AcompanamientosModal = ({ dish, onSave, onClose }) => {
  const { showToast } = useApp();
  const [tempAcompanamientos, setTempAcompanamientos] = useState(() => {
    const cloned = dish.acompanamientos 
      ? JSON.parse(JSON.stringify(dish.acompanamientos)) 
      : [];
    return cloned.map(g => ({
      ...g,
      opciones: g.opciones.map(op => {
        if (typeof op === 'string') {
          return { text: op, emoji: autoSuggestEmoji(op) || '🍽️' };
        }
        return { 
          text: op.text || op, 
          emoji: op.emoji || autoSuggestEmoji(op.text || op) || '🍽️' 
        };
      })
    }));
  });
  const [openEmojiPicker, setOpenEmojiPicker] = useState(null); // { groupIdx, optionIdx }

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const addAcompanamientoGroup = () => {
    setTempAcompanamientos(prev => [...prev, { titulo: '', opciones: [] }]);
  };

  const updateTempGroupTitle = (groupIndex, value) => {
    const updated = [...tempAcompanamientos];
    updated[groupIndex].titulo = value;
    setTempAcompanamientos(updated);
  };

  const addOptionToGroup = (groupIndex, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    const updated = [...tempAcompanamientos];
    if (updated[groupIndex].opciones.some(op => op.text.toLowerCase() === trimmed.toLowerCase())) {
      showToast('⚠️ Esta opción ya existe');
      return;
    }
    
    updated[groupIndex].opciones.push({
      text: trimmed,
      emoji: autoSuggestEmoji(trimmed) || '🍽️'
    });
    setTempAcompanamientos(updated);
  };

  const removeOptionFromGroup = (groupIndex, optionIndex) => {
    const updated = [...tempAcompanamientos];
    updated[groupIndex].opciones = updated[groupIndex].opciones.filter((_, i) => i !== optionIndex);
    setTempAcompanamientos(updated);
  };

  const updateOptionEmoji = (groupIndex, optionIndex, emoji) => {
    const updated = [...tempAcompanamientos];
    updated[groupIndex].opciones[optionIndex].emoji = emoji;
    setTempAcompanamientos(updated);
    setOpenEmojiPicker(null);
  };

  const removeTempGroup = (groupIndex) => {
    setTempAcompanamientos(tempAcompanamientos.filter((_, idx) => idx !== groupIndex));
  };

  const handleSave = () => {
    const validGroups = tempAcompanamientos
      .filter(g => g.titulo.trim() !== '' && g.opciones.length > 0)
      .map(g => ({
        titulo: g.titulo.trim(),
        opciones: g.opciones.map(op => ({ text: op.text, emoji: op.emoji }))
      }));
    onSave(validGroups);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="section-card animate-in modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Salad size={22} style={{ color: 'var(--primary)' }} /> 
          <span>Acompañamientos</span>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', opacity: 0.7 }}>Plato: </span>
          <span style={{ fontWeight: 800, fontSize: '15px' }}>
            {dish.emoji} {dish.name || '(Sin nombre)'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
          {tempAcompanamientos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '32px 24px', 
              background: 'var(--surface-container-low)', 
              borderRadius: '12px', 
              border: '1.5px dashed var(--outline-variant)',
              color: 'var(--on-surface-variant)',
              fontSize: '14px'
            }}>
              <Salad size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div>No hay acompañamientos configurados</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>Añade un grupo de opciones abajo</div>
            </div>
          ) : (
            tempAcompanamientos.map((group, gIdx) => (
              <div key={gIdx} style={{ 
                background: 'var(--surface-container-low)', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid var(--outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative'
              }}>
                {/* Header del grupo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '32px' }}>
                  <input 
                    className="form-input" 
                    style={{ 
                      flex: 1,
                      minHeight: '36px', 
                      padding: '6px 12px', 
                      fontSize: '14px', 
                      fontWeight: 700,
                      borderRadius: '8px',
                      background: 'var(--surface)'
                    }}
                    placeholder="Título del grupo (ej. Guarnición)"
                    value={group.titulo}
                    onChange={(e) => updateTempGroupTitle(gIdx, e.target.value)}
                  />
                  <button 
                    type="button"
                    style={{ 
                      background: 'none', 
                      color: 'var(--error)', 
                      opacity: 0.7, 
                      padding: '6px', 
                      border: 'none', 
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                    onClick={() => removeTempGroup(gIdx)}
                    title="Eliminar grupo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Lista horizontal de opciones con emojis */}
                <div>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    color: 'var(--on-surface-variant)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Opciones
                  </label>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    minHeight: '36px',
                    alignItems: 'center'
                  }}>
                    {group.opciones.map((op, oIdx) => (
                      <div 
                        key={oIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px 6px 6px',
                          background: 'var(--surface)',
                          border: '1.5px solid var(--outline)',
                          borderRadius: '20px',
                          fontSize: '13px',
                          color: 'var(--on-surface)',
                          transition: 'all 0.2s',
                          animation: 'tagIn 0.2s ease-out'
                        }}
                      >
                        {/* Emoji picker */}
                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenEmojiPicker(
                                openEmojiPicker?.groupIdx === gIdx && openEmojiPicker?.optionIdx === oIdx 
                                  ? null 
                                  : { groupIdx: gIdx, optionIdx: oIdx }
                              );
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '2px',
                              borderRadius: '4px',
                              lineHeight: 1
                            }}
                            title="Cambiar emoji"
                          >
                            {op.emoji}
                          </button>
                          {openEmojiPicker?.groupIdx === gIdx && openEmojiPicker?.optionIdx === oIdx && (
                            <div 
                              style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '0',
                                marginBottom: '4px',
                                background: 'var(--surface)',
                                border: '1px solid var(--outline)',
                                borderRadius: '8px',
                                padding: '6px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(6, 1fr)',
                                gap: '4px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 100,
                                maxWidth: '200px'
                              }}
                            >
                              {EMOJIS.map(e => (
                                <button
                                  key={e}
                                  onClick={() => updateOptionEmoji(gIdx, oIdx, e)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    lineHeight: 1
                                  }}
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <span style={{ fontWeight: 500 }}>{op.text}</span>
                        
                        <button
                          type="button"
                          onClick={() => removeOptionFromGroup(gIdx, oIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--error)',
                            opacity: 0.6,
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '12px'
                          }}
                          title="Eliminar opción"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Input para añadir nueva opción */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        id={`new-option-${gIdx}`}
                        placeholder="+ Añadir..."
                        style={{
                          minHeight: '32px',
                          padding: '4px 28px 4px 12px',
                          fontSize: '13px',
                          borderRadius: '16px',
                          border: '1.5px dashed var(--outline)',
                          background: 'transparent',
                          color: 'var(--on-surface)',
                          width: '120px',
                          outline: 'none'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOptionToGroup(gIdx, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            addOptionToGroup(gIdx, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`new-option-${gIdx}`);
                          if (input && input.value.trim()) {
                            addOptionToGroup(gIdx, input.value);
                            input.value = '';
                            input.focus();
                          }
                        }}
                        style={{
                          position: 'absolute',
                          right: '6px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          borderRadius: '50%',
                          lineHeight: 1
                        }}
                        title="Añadir opción"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', opacity: 0.7, marginTop: '6px', display: 'block' }}>
                    Presiona Enter para añadir. Los clientes podrán elegir una opción de este grupo.
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          type="button"
          className="btn btn--secondary btn--full btn--sm" 
          style={{ marginBottom: '20px', gap: '6px', borderRadius: '8px', border: '1.5px dashed var(--outline)' }}
          onClick={addAcompanamientoGroup}
        >
          <Plus size={16} /> Añadir Grupo de Opciones
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn--primary" 
            style={{ flex: 1, borderRadius: '8px', minHeight: '44px' }} 
            onClick={handleSave}
          >
            Guardar Cambios
          </button>
          <button 
            className="btn btn--secondary" 
            style={{ flex: 1, borderRadius: '8px', minHeight: '44px' }} 
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const Creator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, user } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [myRestauranteId, setMyRestauranteId] = useState(null);
  const [tipos, setTipos] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [bizInfo, setBizInfo] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return {
          name: data.name || '',
          prefix: '+591',
          phone: data.phone || '',
          tagline: data.tagline || 'Comida casera con calidad y sabor inigualable.',
          promo: data.promo || '',
          address: data.address || '',
          sides: data.sides || '',
          menuPrice: data.menuPrice || '',
          slug: data.slug || '',
          horarios: data.horarios || '',
          imagen_url: data.imagen_url || ''
        };
      }
    } catch (e) { console.error(e); }
    return { name: '', prefix: '+591', phone: '', tagline: 'Comida casera con calidad y sabor inigualable.', promo: '', address: '', sides: '', menuPrice: '', slug: '', horarios: '', imagen_url: '' };
  });
  
  const [dishes, setDishes] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.dishes || [];
      }
    } catch (e) { console.error(e); }
    return [];
  });
  const [openEmojiIdx, setOpenEmojiIdx] = useState(null);
  const [highlightedDishId, setHighlightedDishId] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [shareText, setShareText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingDishIdx, setEditingDishIdx] = useState(null);

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('gustomenu_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    async function init() {
      if (user) {
        try {
          const searchParams = new URLSearchParams(location.search);
          const editId = searchParams.get('id');

          if (editId) {
            const resData = await getRestauranteById(editId);
            setMyRestauranteId(resData.id);
            setBizInfo(prev => ({
              ...prev,
              name: resData.nombre || prev.name,
              phone: resData.whatsapp ? resData.whatsapp.replace(/^\+591/, '') : prev.phone,
              tagline: resData.tagline || resData.tema || prev.tagline,
              promo: resData.promo || prev.promo,
              menuPrice: resData.precio_menu || prev.menuPrice,
              address: resData.direccion || prev.address,
              slug: resData.slug || prev.slug,
              horarios: resData.horarios ? JSON.stringify(resData.horarios, null, 2) : prev.horarios,
              imagen_url: resData.imagen_url || prev.imagen_url
            }));
            
             if (resData.platillos && resData.platillos.length > 0) {
              setDishes(resData.platillos.map(p => ({
                id: p.id,
                type: p.tipo_id === 1 ? 'sopa' : p.tipo_id === 2 ? 'segundo' : p.tipo_id === 3 ? 'segundo suelto' : p.tipo_id === 4 ? 'postre' : 'bebida',
                emoji: p.emoji || '🍽️',
                name: p.nombre,
                price: p.precio || '',
                acompanamientos: (() => { try { const v = p.acompanamientos; if (!v) return []; if (Array.isArray(v)) return v; return JSON.parse(v); } catch(e) { return []; } })()
              })));
            }
          } else {
            const myRests = await getRestaurantes();
            if (myRests.length > 0) setMyRestauranteId(myRests[0].id);
          }
        } catch (e) { console.error(e); }
      }

      try {
        const typesData = await getTiposPlatillo();
        setTipos(typesData);
      } catch (e) { console.error('Failed to fetch types', e); }

    }
    init();
  }, [user]);

  useEffect(() => {
    const data = { ...bizInfo, dishes };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [bizInfo, dishes]);

  useEffect(() => {
    if (showModal || showExtrasModal || editingDishIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showModal, showExtrasModal, editingDishIdx]);

  const handleBizChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('biz-', '');
    setBizInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!myRestauranteId) {
      showToast('⚠️ Primero debes tener un restaurante asignado o guardar los cambios para crearlo');
      return;
    }

    setUploadingLogo(true);
    try {
      const data = await uploadLogo(myRestauranteId, file);
      setBizInfo(prev => ({ ...prev, imagen_url: data.imagen_url }));
      showToast('✅ Logo subido correctamente');
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const addDish = (type = 'segundo') => {
    let emoji = '🍽️';
    if (type === 'sopa') emoji = '🥣';
    if (type === 'postre') emoji = '🍰';
    if (type === 'bebida') emoji = '🥤';
    if (type === 'completo') emoji = '🍲';

    const id = Date.now();
    const newDish = {
      id,
      type,
      emoji,
      name: type === 'completo' ? 'Almuerzo Completo' : '',
      price: '',
      acompanamientos: []
    };
    
    setDishes(prev => [...prev, newDish]);
    
    setTimeout(() => {
      const target = document.querySelector(`[data-dish-id="${id}"]`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.outline = '2px solid var(--primary)';
        setTimeout(() => target.style.outline = 'none', 1000);
      }
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

  // ========== ACOMPAÑAMIENTOS - NUEVO SISTEMA ==========

  const openAcompanamientosEditor = (idx) => {
    setEditingDishIdx(idx);
  };

  // ========== FIN ACOMPAÑAMIENTOS ==========

  const moveDish = (idx, direction) => {
    const d = dishes[idx];
    const typeIndices = dishes.reduce((acc, item, index) => {
      if (item.type === d.type) acc.push(index);
      return acc;
    }, []);
    const position = typeIndices.indexOf(idx);
    const targetPosition = direction === 'up' ? position - 1 : position + 1;
    if (targetPosition < 0 || targetPosition >= typeIndices.length) return;

    const targetIdx = typeIndices[targetPosition];
    const newDishes = [...dishes];

    const temp = newDishes[idx];
    newDishes[idx] = newDishes[targetIdx];
    newDishes[targetIdx] = temp;

    setHighlightedDishId(d.id);
    setDishes(newDishes);

    setTimeout(() => {
      setHighlightedDishId(null);
    }, 600);
  };

  const handleGenerate = () => {
    if (!bizInfo.name.trim()) { showToast('⚠️ Ingresa el nombre del negocio'); return; }
    if (!bizInfo.phone.trim()) { showToast('⚠️ Ingresa tu número de WhatsApp'); return; }

    const hasSoup = dishes.some(d => d.type === 'sopa');
    const hasSecond = dishes.some(d => d.type === 'segundo');
    if (hasSoup && hasSecond && !bizInfo.menuPrice.trim()) {
      showToast('⚠️ Ingresa el precio del menú completo');
      return;
    }
    
    const validItems = dishes.filter(d => d.name.trim() !== '');

    const data = {
      name: bizInfo.name.trim(),
      tagline: bizInfo.tagline.trim(),
      promo: bizInfo.promo.trim(),
      address: bizInfo.address.trim(),
      sides: bizInfo.sides.trim(),
      phone: bizInfo.phone.trim(),
      whatsapp: bizInfo.prefix + bizInfo.phone.trim(),
      menuPrice: bizInfo.menuPrice,
      items: validItems
    };

    const encoded = encodeMenu(data);
    const url = `${window.location.origin}${window.location.pathname}#/menu?d=${encodeURIComponent(encoded)}`;
    setGeneratedUrl(url);

    const soups = validItems.filter(i => i.type === 'sopa');
    const seconds = validItems.filter(i => i.type === 'segundo' || i.type === 'standard');
    const secondsSueltos = validItems.filter(i => i.type === 'segundo suelto');
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

    const emojiSets = [
      '🥦🥕🫛🌽🧅😋',
      '🥗🍱🥘🥣🥩🍗',
      '🍎🥑🥒🌶️🌽🥔',
      '👨‍🍳🔥🍽️✨🥘🍳',
      '✨🤤👌🔥💯🍲'
    ];
    const deco1 = emojiSets[Math.floor(Math.random() * emojiSets.length)];
    const deco2 = emojiSets[Math.floor(Math.random() * emojiSets.length)];
    const randomGreet = ['😃👋', '✨😊', '🌟🙌', '🍳🔥'][Math.floor(Math.random() * 4)];

    const hasCombo = soups.length > 0 && seconds.length > 0;
    const comboPriceText = (hasCombo && bizInfo.menuPrice) ? `\n🍱 *ALMUERZO COMPLETO (Sopa + Segundo): Bs.${bizInfo.menuPrice}*\n` : '';

    const text = 
      `BUENOS DIAS!  ${randomGreet}\n` +
      `Estimados clientes!!!\n\n` +
      `Les enviamos nuestro menú del día \n` +
      ` ✨ *${bizInfo.name}* ✨ \n` +
      `*Menú día ${dateStr}*\n` +
      comboPriceText +
      `\nTe ofrecemos:\n` +
      buildSection('SOPAS', soups) +
      buildSection('SEGUNDOS', seconds) +
      buildSection('SEGUNDOS SUELTOS', secondsSueltos) +
      buildSection('POSTRES', desserts) +
      buildSection('BEBIDAS', drinks) +
      (bizInfo.promo ? `\nESPECIAL DEL DIA:  *${bizInfo.promo}*\n` : '') +
      `\n${deco1}\n` +
      (bizInfo.sides ? `\n- *GUARNICION*\n${sidesLines}\n` : '') +
      `\n${deco2}\n` +
      `*${bizInfo.tagline}*!!!\n\n` +
      (bizInfo.phone ? `📱 *Pedidos al:* ${bizInfo.prefix}${bizInfo.phone}\n` : '') +
      (bizInfo.address ? `📍 *Dirección:* ${bizInfo.address}\n\n` : '') +
      `👇 *Ver menú y pedir aquí:*\n` +
      `${url}`;
    
    setShareText(text);
    setShowModal(true);
  };

  const saveToHistory = () => {
    if (!bizInfo.name) return showToast('⚠️ Nombre requerido');
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      bizInfo: { ...bizInfo },
      dishes: [...dishes]
    };
    const newHistory = [newEntry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('gustomenu_history', JSON.stringify(newHistory));
    showToast('💾 Guardado en historial');
  };

  const loadFromHistory = (entry) => {
    setBizInfo(entry.bizInfo);
    setDishes((entry.dishes || []).map(d => ({
      ...d,
      acompanamientos: d.acompanamientos || []
    })));
    showToast('📋 Menú restaurado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeFromHistory = (e, id) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('gustomenu_history', JSON.stringify(newHistory));
    showToast('🗑️ Eliminado del historial');
  };

  const handleSaveToDashboard = async () => {
    if (!myRestauranteId) {
      showToast('⚠️ No tienes un restaurante asignado');
      return;
    }

    const hasSoup = dishes.some(d => d.type === 'sopa');
    const hasSecond = dishes.some(d => d.type === 'segundo');
    if (hasSoup && hasSecond && !bizInfo.menuPrice.trim()) {
      showToast('⚠️ Ingresa el precio del menú completo');
      return;
    }

    let parsedHorarios = null;
    if (bizInfo.horarios && bizInfo.horarios.trim() !== '') {
      try {
        parsedHorarios = JSON.parse(bizInfo.horarios);
      } catch (err) {
        showToast('⚠️ JSON de Horarios inválido');
        return;
      }
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
        precio_menu: bizInfo.menuPrice,
        items: dishes,
        slug: bizInfo.slug,
        whatsapp: bizInfo.prefix + bizInfo.phone.trim(),
        horarios: parsedHorarios,
        imagen_url: bizInfo.imagen_url
      });
      saveToHistory();
      showToast('✅ Cambios guardados en tu panel');
      if (user.role_id === 1) {
        navigate('/dashboard');
      }
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <div className="container animate-in">
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
            <label className="form-label">WhatsApp de Pedidos</label>
            <div className="phone-row">
              <div className="phone-prefix">{bizInfo.prefix}</div>
              <div className="phone-input-wrap">
                <input className="form-input" id="biz-phone" type="tel" placeholder="Número de celular" value={bizInfo.phone} onChange={handleBizChange} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Logo del Restaurante</label>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              {bizInfo.imagen_url ? (
                <img 
                  src={bizInfo.imagen_url} 
                  alt="Logo preview" 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--outline-variant)' }} 
                />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  🏢
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  id="logo-upload" 
                  onChange={handleLogoUpload} 
                />
                <label 
                  htmlFor="logo-upload" 
                  className="btn btn--secondary btn--sm" 
                  style={{ cursor: 'pointer', display: 'inline-flex' }}
                >
                  {uploadingLogo ? 'Subiendo...' : 'Seleccionar Logo'}
                </label>
              </div>
            </div>
          </div>
          
          {(dishes.some(d => d.type === 'sopa') && dishes.some(d => d.type === 'segundo')) && (
            <div className="form-group animate-in" style={{ background: 'var(--primary-container)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
              <label className="form-label" style={{ color: 'var(--on-primary-container)', fontWeight: 800 }}>💰 Precio Almuerzo Completo (Sopa + Segundo)</label>
              <div className="price-row" style={{ background: 'var(--surface)' }}>
                <span className="price-symbol">Bs</span>
                <input className="form-input price-input" id="biz-menuPrice" type="number" placeholder="ej. 15" value={bizInfo.menuPrice} onChange={handleBizChange} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>Este precio se mostrará como el costo del menú completo.</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            style={{ alignSelf: 'flex-start', gap: '8px' }}
            onClick={() => setShowExtrasModal(true)}
          >
            <Settings size={16} /> Opciones adicionales
            {(bizInfo.promo || bizInfo.sides || bizInfo.address || bizInfo.tagline) && (
              <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '999px', fontSize: '11px', padding: '1px 7px', marginLeft: '4px' }}>
                {[bizInfo.promo, bizInfo.sides, bizInfo.address, bizInfo.tagline].filter(Boolean).length}
              </span>
            )}
          </button>
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

          {['sopa', 'segundo', 'segundo suelto', 'postre', 'bebida'].map(type => {
            const sectionItems = dishes.filter(d => d.type === type);
            if (sectionItems.length === 0) return null;

            return (
              <div key={type} className="dish-group-section">
                <div className="dish-group-header">
                  <div style={{ flex: 1 }}>
                    {type === 'sopa' && '🥣 Sopas'}
                    {type === 'segundo' && '🍽️ Segundos'}
                    {type === 'segundo suelto' && '🍱 Segundos Sueltos'}
                    {type === 'postre' && '🍰 Postres'}
                    {type === 'bebida' && '🥤 Bebidas'}
                  </div>
                  <button 
                    className="btn btn--primary btn--icon" 
                    style={{ width: '32px', height: '32px', fontSize: '18px' }}
                    onClick={() => addDish(type)}
                    title={`Añadir ${type}`}
                  >
                    +
                  </button>
                </div>
                {dishes.map((d, i) => {
                  if (d.type !== type) return null;

                  const typeIndices = dishes.reduce((acc, item, index) => {
                    if (item.type === d.type) acc.push(index);
                    return acc;
                  }, []);
                  const groupIndex = typeIndices.indexOf(i);
                  const isFirstInGroup = groupIndex === 0;
                  const isLastInGroup = groupIndex === typeIndices.length - 1;

                  return (
                    <div 
                      key={d.id || i} 
                      data-dish-id={d.id} 
                      className={`dish-item dish-item--${d.type.replace(' ', '-')} ${highlightedDishId === d.id ? 'dish-item--highlight' : ''}`}
                    >
                      <div className="dish-main-content">
                        <div className="dish-emoji-col">
                          <div style={{ position: 'relative' }}>
                            <button className="dish-emoji-btn" onClick={() => setOpenEmojiIdx(openEmojiIdx === i ? null : i)}>{d.emoji}</button>
                            {openEmojiIdx === i && (
                              <div className="emoji-picker-popup">
                                {EMOJIS.map(e => <button key={e} onClick={() => { updateDish(i, 'emoji', e); setOpenEmojiIdx(null); }}>{e}</button>)}
                              </div>
                            )}
                          </div>
                          <button className="dish-remove-btn" onClick={() => removeDish(i)}>
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="dish-inputs-col">
                          <input 
                            className="dish-input-name" 
                            type="text" 
                            placeholder={`Nombre de la ${d.type}...`}
                            value={d.name} 
                            onChange={(e) => updateDish(i, 'name', e.target.value)} 
                          />
                          {d.type !== 'completo' && (
                            <div className="dish-input-price-row">
                              <span className="price-label">Bs</span>
                              <input 
                                className="dish-input-price" 
                                type="number" 
                                placeholder="0.00" 
                                value={d.price} 
                                onChange={(e) => updateDish(i, 'price', e.target.value)} 
                              />
                            </div>
                          )}
                          
                          <div style={{ marginTop: '8px' }}>
                            <button
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => openAcompanamientosEditor(i)}
                            >
                              <Salad size={12} /> Acompañamientos
                              {d.acompanamientos && d.acompanamientos.length > 0 && (
                                <span style={{ 
                                  background: 'var(--primary)', 
                                  color: '#fff', 
                                  borderRadius: '50%', 
                                  fontSize: '9px', 
                                  width: '16px', 
                                  height: '16px', 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  fontWeight: 'bold'
                                }}>
                                  {d.acompanamientos.length}
                                </span>
                              )}
                            </button>
                            
                            {d.acompanamientos && d.acompanamientos.length > 0 && (
                              <div style={{ fontSize: '10px', color: 'var(--on-surface-variant)', opacity: 0.8, display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                {d.acompanamientos.map((g, idx) => (
                                  <span key={idx} style={{ background: 'var(--surface-low)', border: '1px solid var(--outline-variant)', padding: '2px 6px', borderRadius: '4px' }}>
                                    <b>{g.titulo}:</b> {g.opciones.map(op => `${op.emoji || ''} ${op.text || op}`).join(', ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="dish-order-col">
                          <button className="order-btn" onClick={() => moveDish(i, 'up')} disabled={isFirstInGroup}>
                            <ChevronUp size={24} />
                          </button>
                          <button className="order-btn" onClick={() => moveDish(i, 'down')} disabled={isLastInGroup}>
                            <ChevronDown size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="creator-grid-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('sopa')} title="Añadir Sopa">
            <Soup size={18} /> Sopa
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('segundo')} title="Añadir Segundo">
            <Utensils size={18} /> Segundo
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('segundo suelto')} title="Añadir Segundo Suelto">
            <Utensils size={18} /> Segundo Suelto
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('postre')} title="Añadir Postre">
            <IceCream size={18} /> Postre
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => addDish('bebida')} title="Añadir Bebida">
            <Coffee size={18} /> Bebida
          </button>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="section-card">
          <div className="section-title">🕒 Menús Recientes (Historial)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {history.map(entry => (
              <div key={entry.id} className="history-item" onClick={() => loadFromHistory(entry)} style={{ 
                padding: '12px', 
                background: 'var(--surface-low)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                border: '1px solid var(--outline-variant)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>{entry.bizInfo.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>{entry.date} · {entry.dishes.length} platos</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ color: 'var(--primary)', padding: '4px' }}><Eye size={16} /></div>
                  <div 
                    className="history-delete-btn" 
                    onClick={(e) => removeFromHistory(e, entry.id)}
                    style={{ color: 'var(--error)', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Sticky */}
      <div className="creator-cta">
        <div className="creator-cta-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button className="btn btn--ghost btn--full btn--sm" onClick={saveToHistory}>
              <Save size={16} /> Guardar
            </button>
            {user && (
              <button className="btn btn--secondary btn--full btn--sm" onClick={handleSaveToDashboard} disabled={isSaving}>
                <Save size={16} /> {isSaving ? '...' : 'Publicar'}
              </button>
            )}
            <button
              className="btn btn--full btn--sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', border:'none' }}
              onClick={() => setShowExportModal(true)}
              title="Exportar como imagen PNG"
            >
              <ImageDown size={16} /> Exportar
            </button>
          </div>
          <button className="btn btn--primary btn--full btn--pill" onClick={handleGenerate} style={{ height: '56px', fontSize: '18px' }}>
            Generar Menú del Día
          </button>
        </div>
      </div>
    </div>

    {/* Results Modal */}
    {showModal && (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="section-card animate-in modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowModal(false)}><X size={24} /></button>
          <div className="section-title">🔗 Menú del Día Generado</div>
          <p style={{ fontSize: '14px', marginBottom: '16px', opacity: 0.8 }}>Tu mensaje de WhatsApp está listo para ser compartido.</p>
          
          <div className="share-text-box" style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '13px', 
            maxHeight: '250px', 
            overflowY: 'auto', 
            background: 'var(--surface-container-low)', 
            padding: '16px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--outline-variant)',
            marginBottom: '20px'
          }}>
            {shareText}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <button className="btn btn--primary btn--full" onClick={() => { copyToClipboard(shareText); showToast('✅ Mensaje copiado'); }}>
              <Share2 size={18} /> Copiar para WhatsApp
            </button>
            <button
              className="btn btn--full"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', border:'none', marginTop:'4px' }}
              onClick={() => { setShowModal(false); setShowExportModal(true); }}
            >
              <ImageDown size={18} /> Exportar como Imagen
            </button>
            <button className="btn btn--ghost btn--full" style={{ border: 'none' }} onClick={() => setShowModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Extras Modal */}
    {showExtrasModal && (
      <div className="modal-overlay" onClick={() => setShowExtrasModal(false)}>
        <div className="section-card animate-in modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowExtrasModal(false)}><X size={24} /></button>
          <div className="section-title"><Settings size={20} /> Opciones Adicionales</div>
          <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.7 }}>Estos campos son opcionales y enriquecen tu mensaje compartido.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">⭐ Especial del día</label>
              <input className="form-input" id="biz-promo" placeholder="ej. Pollo al horno 17Bs" value={bizInfo.promo} onChange={handleBizChange} />
              <span className="form-hint">Se mostrará como destacado en el mensaje y en el menú.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Guarniciones</label>
              <div style={{ position: 'relative' }}>
                <Salad size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                <input className="form-input" id="biz-sides" style={{ paddingLeft: '36px' }} placeholder="ej. Arroz blanco, Arroz curry" value={bizInfo.sides} onChange={handleBizChange} />
              </div>
              <span className="form-hint">Separa las guarniciones con comas.</span>
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
                        (err) => { showToast('❌ Error: ' + err.message); }
                      );
                    } else {
                      showToast('❌ GPS no soportado');
                    }
                  }}
                >
                  <MapPin size={20} />
                </button>
              </div>
              <span className="form-hint">Usa el botón 🛰️ para GPS o pega el link de Google Maps.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Slogan del negocio</label>
              <input className="form-input" id="biz-tagline" placeholder="Tu frase característica" value={bizInfo.tagline} onChange={handleBizChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Slug (URL del restaurante)</label>
              <input className="form-input" id="biz-slug" placeholder="mi-restaurante" value={bizInfo.slug} onChange={handleBizChange} />
              <span className="form-hint">Tu menú aparecerá en: tusitio.com/<b>{bizInfo.slug || 'slug'}</b></span>
            </div>

            <div className="form-group">
              <label className="form-label">Horarios de Atención</label>
              <HorariosEditor 
                horariosStr={bizInfo.horarios} 
                onChange={(val) => setBizInfo(prev => ({ ...prev, horarios: val }))} 
              />
              <span className="form-hint">Marca la casilla para indicar qué días estás abierto y configura el horario.</span>
            </div>
          </div>

          <button
            className="btn btn--primary btn--full"
            style={{ marginTop: '24px' }}
            onClick={() => setShowExtrasModal(false)}
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    )}

    {/* ========== MODAL ACOMPAÑAMIENTOS - NUEVO DISEÑO ========== */}
    {editingDishIdx !== null && (
      <AcompanamientosModal
        dish={dishes[editingDishIdx]}
        onSave={(validGroups) => {
          const newDishes = [...dishes];
          newDishes[editingDishIdx].acompanamientos = validGroups;
          setDishes(newDishes);
          showToast('✅ Acompañamientos actualizados');
          setEditingDishIdx(null);
        }}
        onClose={() => setEditingDishIdx(null)}
      />
    )}

    {/* Export Modal */}
    {showExportModal && (
      <ExportModal
        data={{
          name: bizInfo.name,
          tagline: bizInfo.tagline,
          promo: bizInfo.promo,
          address: bizInfo.address,
          sides: bizInfo.sides,
          whatsapp: bizInfo.prefix + bizInfo.phone,
          menuPrice: bizInfo.menuPrice,
          imagen_url: bizInfo.imagen_url,
          items: dishes.filter(d => d.name.trim() !== '')
        }}
        onClose={() => setShowExportModal(false)}
      />
    )}
    </>
  );
};

export default Creator;
