import React from 'react';

const today = new Date();
const DAYS_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function pad(n) { return String(n).padStart(2, '0'); }

/* ────────────────────────────────────────────
   TEMPLATE 1 – CLÁSICO (estilo Alter Nativa)
   1080×1350 px equivalente escalado a 540×675
───────────────────────────────────────────── */
export const TemplateClasico = React.forwardRef(({ data }, ref) => {
  const soups   = (data.items || []).filter(i => (i.type||i.tipo||'') === 'sopa');
  const seconds = (data.items || []).filter(i => (i.type||i.tipo||'') === 'segundo');
  const sueltos = (data.items || []).filter(i => (i.type||i.tipo||'') === 'segundo suelto');
  const specials = (data.items || []).filter(i => (i.type||i.tipo||'') === 'postre' || (i.type||i.tipo||'') === 'bebida');
  const sides = data.sides ? data.sides.split(',').map(s => s.trim()).filter(Boolean) : [];

  const dayName = DAYS_ES[today.getDay()];
  const dd = pad(today.getDate());
  const mm = pad(today.getMonth() + 1);
  const yy = String(today.getFullYear()).slice(2);

  const s = {
    wrap: {
      width: '540px', minHeight: '675px', background: '#f5ede0',
      fontFamily: "'Georgia', serif", padding: '0', position: 'relative',
      overflow: 'hidden', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
    },
    header: {
      background: '#2c1a0e', padding: '20px 24px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    logoArea: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' },
    bizName: { color: '#c9a96e', fontSize: '26px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px', fontStyle: 'italic' },
    tagline: { color: '#a07850', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' },
    dateBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    dateLabel: { color: '#c9a96e', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '1px solid #c9a96e', paddingBottom: '4px', marginBottom: '4px' },
    dayName: { color: '#fff', fontSize: '22px', fontWeight: 900 },
    datePills: { display: 'flex', gap: '6px' },
    datePill: { border: '2px solid #c9a96e', borderRadius: '6px', padding: '4px 10px', textAlign: 'center' },
    datePillNum: { color: '#fff', fontSize: '18px', fontWeight: 900, display: 'block' },
    datePillLbl: { color: '#c9a96e', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' },
    body: { padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
    card: { background: '#fff', borderRadius: '10px', border: '1px solid #d4b896', padding: '12px 16px' },
    sectionTitle: {
      display: 'flex', alignItems: 'center', gap: '8px',
      background: '#2c1a0e', color: '#c9a96e', borderRadius: '6px',
      padding: '5px 12px', fontSize: '12px', fontWeight: 900,
      letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', width: 'fit-content'
    },
    completoText: { fontSize: '20px', fontWeight: 700, color: '#1a0e06', lineHeight: 1.4 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px dashed #e0cbb3' },
    itemName: { fontSize: '13px', color: '#2c1a0e', display: 'flex', alignItems: 'center', gap: '8px' },
    price: { background: '#2c1a0e', color: '#fff', borderRadius: '99px', padding: '2px 10px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' },
    bottomRow: { display: 'flex', gap: '12px' },
    halfCard: { flex: 1, background: '#fff', borderRadius: '10px', border: '1px solid #d4b896', padding: '12px' },
    footer: {
      background: '#2c1a0e', padding: '12px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
    },
    footerTagline: { color: '#c9a96e', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' },
    footerAddress: { color: '#a07850', fontSize: '10px', textAlign: 'center' },
  };

  return (
    <div ref={ref} style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoArea}>
          {data.imagen_url && (
            <img src={data.imagen_url} alt="logo" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 6, border: '2px solid #c9a96e' }} />
          )}
          <div style={s.bizName}>{data.name || 'Mi Restaurante'}</div>
          <div style={s.tagline}>{data.tagline || 'café · restaurante'}</div>
        </div>
        <div style={s.dateBox}>
          <div style={s.dateLabel}>✦ Menú del Día ✦</div>
          <div style={s.dayName}>{dayName}</div>
          <div style={s.datePills}>
            {[{n: dd, l:'Día'},{n: mm, l:'Mes'},{n: yy, l:'Año'}].map(({n,l}) => (
              <div key={l} style={s.datePill}>
                <span style={s.datePillNum}>{n}</span>
                <span style={s.datePillLbl}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.body}>
        {/* COMPLETO */}
        {soups.length > 0 && seconds.length > 0 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>☕ Completo ✦</div>
            <div style={s.completoText}>
              {soups.map(s => <div key={s.name||s.nombre}>{'Sopa:\u00A0'}{s.nombre||s.name}</div>)}
              {seconds.map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span>{'Segundo:\u00A0'}{s.nombre||s.name}</span>
                  {data.menuPrice && <span style={{ background:'#2c1a0e', color:'#fff', borderRadius:'6px', padding:'2px 10px', fontSize:'16px', fontWeight:900 }}>{data.menuPrice}{`\u00A0Bs`}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEGUNDOS + ESPECIALES */}
        <div style={s.bottomRow}>
          {sueltos.length > 0 && (
            <div style={s.halfCard}>
              <div style={s.sectionTitle}>✦ Segundos ✦</div>
              {sueltos.map((item,i) => (
                <div key={i} style={{...s.row, borderBottom: i < sueltos.length-1 ? s.row.borderBottom : 'none'}}>
                  <span style={s.itemName}>{item.emoji||'🍽️'}{'\u00A0'}{item.nombre||item.name}</span>
                  {item.precio||item.price ? <span style={s.price}>{item.precio||item.price}{'\u00A0Bs'}</span> : null}
                </div>
              ))}
            </div>
          )}

          {(data.promo || specials.length > 0) && (
            <div style={s.halfCard}>
              <div style={{...s.sectionTitle, background:'#8B6914', color:'#fff'}}>👨‍🍳 Especiales ✦</div>
              {data.promo && (
                <div style={s.row}>
                  <span style={s.itemName}>{'⭐\u00A0'}{data.promo}</span>
                </div>
              )}
              {specials.map((item,i) => (
                <div key={i} style={{...s.row, borderBottom: i < specials.length-1 ? s.row.borderBottom : 'none'}}>
                  <span style={s.itemName}>{item.emoji||'🍽️'}{'\u00A0'}{item.nombre||item.name}</span>
                  {item.precio||item.price ? <span style={s.price}>{item.precio||item.price}{'\u00A0Bs'}</span> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GUARNICIÓN */}
        {sides.length > 0 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>✦ Guarnición ✦</div>
            {sides.map((side, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#2c1a0e', padding: '2px 0' }}>• {side}</div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        {data.tagline && <div style={s.footerTagline}>"{data.tagline}"</div>}
        {data.address && <div style={s.footerAddress}>{'📍\u00A0'}{data.address}</div>}
        {data.whatsapp && <div style={s.footerAddress}>{'📱\u00A0'}{data.whatsapp}</div>}
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   TEMPLATE 2 – PROMO (estilo vibrante / Alice)
───────────────────────────────────────────── */
export const TemplatePromo = React.forwardRef(({ data }, ref) => {
  const allItems = (data.items || []).filter(i => i.nombre||i.name);
  const dayName = DAYS_ES[today.getDay()].toUpperCase();

  const s = {
    wrap: {
      width: '540px', minHeight: '675px',
      background: 'linear-gradient(160deg, #b71c1c 0%, #7f0000 50%, #1a0000 100%)',
      fontFamily: "'Arial Black', 'Impact', sans-serif",
      padding: '0', position: 'relative', overflow: 'hidden',
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
    },
    deco: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(ellipse at 20% 20%, rgba(255,200,0,0.08) 0%, transparent 60%)',
      pointerEvents: 'none'
    },
    header: { padding: '28px 28px 16px', display: 'flex', alignItems: 'center', gap: '16px' },
    logoCircle: {
      width: '80px', height: '80px', borderRadius: '50%',
      background: '#fdd835', border: '4px solid #fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '36px', flexShrink: 0, overflow: 'hidden'
    },
    todayBadge: { flex: 1 },
    hoyLabel: { color: '#fdd835', fontSize: '22px', fontWeight: 900, letterSpacing: '1px' },
    dayLabel: { color: '#fff', fontSize: '52px', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-2px', textShadow: '3px 3px 0 rgba(0,0,0,0.4)' },
    subline: { color: '#ffcc02', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', marginTop: '4px', textTransform: 'uppercase' },
    body: { padding: '8px 28px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
    promoRow: {
      display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'
    },
    promoCard: {
      background: 'rgba(0,0,0,0.35)', border: '2px solid #fdd835',
      borderRadius: '16px', padding: '16px 20px', textAlign: 'center',
      flex: '1', minWidth: '140px'
    },
    promoCardTitle: { color: '#fdd835', fontSize: '13px', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase' },
    promoPrice: { color: '#fff', fontSize: '52px', fontWeight: 900, lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.5)' },
    promoUnit: { color: '#fdd835', fontSize: '22px', fontWeight: 900 },
    itemsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
    itemCard: {
      background: 'rgba(255,255,255,0.12)', borderRadius: '12px',
      padding: '10px 14px', border: '1px solid rgba(255,200,0,0.3)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    itemName: { color: '#fff', fontSize: '13px', fontWeight: 700, flex: 1 },
    itemEmoji: { fontSize: '20px', marginRight: '8px' },
    itemPrice: { color: '#fdd835', fontSize: '16px', fontWeight: 900, whiteSpace: 'nowrap' },
    footer: {
      background: '#fdd835', padding: '14px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    footerText: { color: '#7f0000', fontSize: '12px', fontWeight: 900, flex: 1 },
    footerBadge: {
      background: '#7f0000', color: '#fdd835', borderRadius: '50%',
      width: '60px', height: '60px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontSize: '9px',
      fontWeight: 900, textAlign: 'center', border: '2px solid #fff'
    }
  };

  // Separate promo items (sueltos with prices) for big price display
  const promoItems = allItems.filter(i => i.precio || i.price).slice(0, 3);
  const regularItems = allItems.filter(i => !promoItems.includes(i));

  return (
    <div ref={ref} style={s.wrap}>
      <div style={s.deco} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.logoCircle}>
          {data.imagen_url
            ? <img src={data.imagen_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span>🍗</span>
          }
        </div>
        <div style={s.todayBadge}>
          <div style={s.hoyLabel}>¡HOY</div>
          <div style={s.dayLabel}>{dayName}!</div>
          {data.name && <div style={s.subline}>{data.name}</div>}
        </div>
      </div>

      <div style={s.body}>
        {/* Promo subtitle */}
        {data.promo ? (
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '8px' }}>
            🔥 {data.promo}
          </div>
        ) : (
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '8px' }}>
            🔥 No se olviden del menú del día
          </div>
        )}

        {/* Price cards for sueltos/promos */}
        {promoItems.length > 0 && (
          <div style={s.promoRow}>
            {promoItems.map((item, i) => (
              <div key={i} style={s.promoCard}>
                <div style={s.promoCardTitle}>{item.emoji||'🍽️'} {item.nombre||item.name}</div>
                <span style={s.promoPrice}>{item.precio||item.price}</span>
                <span style={s.promoUnit}> Bs</span>
              </div>
            ))}
          </div>
        )}

        {/* Completo price if available */}
        {data.menuPrice > 0 && (
          <div style={{ ...s.promoCard, border: '3px solid #fff', textAlign: 'center' }}>
            <div style={s.promoCardTitle}>🍱 Almuerzo Completo</div>
            <span style={s.promoPrice}>{data.menuPrice}</span>
            <span style={s.promoUnit}> Bs</span>
          </div>
        )}

        {/* All items grid */}
        {regularItems.length > 0 && (
          <div style={s.itemsGrid}>
            {regularItems.map((item, i) => (
              <div key={i} style={s.itemCard}>
                <span style={s.itemEmoji}>{item.emoji||'🍽️'}</span>
                <span style={s.itemName}>{item.nombre||item.name}</span>
                {(item.precio||item.price) && <span style={s.itemPrice}>{item.precio||item.price} Bs</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerText}>
          {data.tagline && <div>❤ {data.tagline}</div>}
          {data.address && <div>📍 {data.address}</div>}
          {data.whatsapp && <div>📱 {data.whatsapp}</div>}
        </div>
        <div style={s.footerBadge}>
          <span>¡GRACIAS</span>
          <span>POR</span>
          <span>ELEGIRNOS!</span>
        </div>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   TEMPLATE 3 – MINIMALISTA MODERNO
───────────────────────────────────────────── */
export const TemplateModerno = React.forwardRef(({ data }, ref) => {
  const allItems = (data.items || []).filter(i => i.nombre||i.name);
  const dayName = DAYS_ES[today.getDay()];

  const s = {
    wrap: {
      width: '540px', minHeight: '675px',
      background: '#0f0f0f',
      fontFamily: "'Arial', sans-serif",
      padding: '0', overflow: 'hidden', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column'
    },
    accent: { height: '6px', background: 'linear-gradient(90deg, #ff6b35, #f7c59f, #efefd0, #52b788)' },
    header: { padding: '28px 32px 20px' },
    dayLabel: { color: '#ff6b35', fontSize: '11px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '4px' },
    bizName: { color: '#fff', fontSize: '36px', fontWeight: 900, lineHeight: 1.1 },
    tagline: { color: '#888', fontSize: '13px', marginTop: '4px' },
    dateLine: { color: '#555', fontSize: '12px', marginTop: '8px', borderTop: '1px solid #222', paddingTop: '8px' },
    body: { padding: '0 32px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
    section: {},
    sectionHeader: {
      display: 'flex', alignItems: 'center', gap: '8px',
      color: '#ff6b35', fontSize: '10px', fontWeight: 700, letterSpacing: '3px',
      textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '6px',
      borderBottom: '1px solid #222'
    },
    itemRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid #1a1a1a'
    },
    itemLeft: { display: 'flex', gap: '10px', alignItems: 'center' },
    emoji: { fontSize: '20px', width: '28px', textAlign: 'center' },
    itemName: { color: '#eee', fontSize: '14px', fontWeight: 600 },
    price: { color: '#ff6b35', fontSize: '15px', fontWeight: 900 },
    completo: {
      background: 'linear-gradient(135deg, #1a1a1a, #222)',
      border: '1px solid #333', borderRadius: '12px', padding: '16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    completoLeft: { flex: 1 },
    completoTitle: { color: '#ff6b35', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' },
    completoDesc: { color: '#fff', fontSize: '15px', fontWeight: 700, marginTop: '4px' },
    completoPrice: { color: '#fff', background: '#ff6b35', borderRadius: '10px', padding: '8px 16px', fontSize: '22px', fontWeight: 900 },
    footer: {
      background: '#1a1a1a', padding: '16px 32px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderTop: '1px solid #222'
    },
    footerInfo: { color: '#555', fontSize: '11px', lineHeight: 1.8 },
    footerDay: { color: '#ff6b35', fontSize: '28px', fontWeight: 900, textAlign: 'right', lineHeight: 1 },
  };

  const groups = {
    'sopa': { label: '— Sopas', emoji: '🥣' },
    'segundo': { label: '— Segundos', emoji: '🍽️' },
    'segundo suelto': { label: '— À la Carte', emoji: '🍱' },
    'postre': { label: '— Postres', emoji: '🍰' },
    'bebida': { label: '— Bebidas', emoji: '🥤' },
  };

  const soups   = allItems.filter(i => (i.type||i.tipo||'') === 'sopa');
  const seconds = allItems.filter(i => (i.type||i.tipo||'') === 'segundo');

  return (
    <div ref={ref} style={s.wrap}>
      <div style={s.accent} />
      <div style={s.header}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {data.imagen_url && (
            <img src={data.imagen_url} alt="logo" style={{ width: 56, height: 56, borderRadius: '10px', objectFit: 'cover' }} />
          )}
          <div>
            <div style={s.dayLabel}>✦ menú del día · {dayName}</div>
            <div style={s.bizName}>{data.name || 'Mi Restaurante'}</div>
            {data.tagline && <div style={s.tagline}>{data.tagline}</div>}
          </div>
        </div>
        <div style={s.dateLine}>{today.toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
      </div>

      <div style={s.body}>
        {/* Completo */}
        {soups.length > 0 && seconds.length > 0 && data.menuPrice && (
          <div style={s.completo}>
            <div style={s.completoLeft}>
              <div style={s.completoTitle}>🍱 Almuerzo Completo</div>
              <div style={s.completoDesc}>{soups[0]?.nombre||soups[0]?.name} + {seconds.map(s=>s.nombre||s.name).join(' / ')}</div>
            </div>
            <div style={s.completoPrice}>Bs.{data.menuPrice}</div>
          </div>
        )}

        {/* Promo */}
        {data.promo && (
          <div style={{ background: '#1a0f00', border: '1px solid #ff6b35', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '24px' }}>⭐</span>
            <div>
              <div style={{ color: '#ff6b35', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Especial del día</div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{data.promo}</div>
            </div>
          </div>
        )}

        {/* Item groups */}
        {Object.entries(groups).map(([type, { label, emoji: gEmoji }]) => {
          const items = allItems.filter(i => (i.type||i.tipo||'') === type);
          if (items.length === 0) return null;
          return (
            <div key={type} style={s.section}>
              <div style={s.sectionHeader}>{gEmoji} {label}</div>
              {items.map((item, i) => (
                <div key={i} style={{...s.itemRow, borderBottom: i < items.length-1 ? s.itemRow.borderBottom : 'none'}}>
                  <div style={s.itemLeft}>
                    <span style={s.emoji}>{item.emoji||gEmoji}</span>
                    <span style={s.itemName}>{item.nombre||item.name}</span>
                  </div>
                  {(item.precio||item.price) && <span style={s.price}>Bs.{item.precio||item.price}</span>}
                </div>
              ))}
            </div>
          );
        })}

        {/* Guarnición */}
        {data.sides && (
          <div style={{ ...s.section }}>
            <div style={s.sectionHeader}>🥗 — Guarnición</div>
            {data.sides.split(',').map((s,i) => (
              <div key={i} style={{ color: '#888', fontSize: '13px', padding: '3px 0' }}>• {s.trim()}</div>
            ))}
          </div>
        )}
      </div>

      <div style={s.footer}>
        <div style={s.footerInfo}>
          {data.address && <div>📍 {data.address}</div>}
          {data.whatsapp && <div>📱 {data.whatsapp}</div>}
        </div>
        <div style={s.footerDay}>{dayName.toUpperCase()}</div>
      </div>
    </div>
  );
});
