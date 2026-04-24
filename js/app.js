/* ============================================================
   GustoMenu — app.js
   Pure frontend SPA with hash-based routing.
   Routes:
     #/         → Landing / Home
     #/crear     → Creator form
     #/menu?d=  → Public menu view
     #/checkout?d= → Checkout / WhatsApp
   ============================================================ */

// ─── State ────────────────────────────────────────────────────
const state = {
  cart: {},        // { itemIndex: quantity }
  menuData: null,  // decoded menu object in menu/checkout views
};

// ─── Emoji palette ────────────────────────────────────────────
const EMOJIS = [
  '🍔','🍕','🌮','🌯','🍜','🍝','🍣','🍱','🥗','🥘',
  '🍗','🍖','🥩','🥓','🍟','🌭','🍿','🧆','🧇','🥞',
  '🧁','🍰','🎂','🍩','🍪','🍫','🍦','🍨','🍧','🥧',
  '🍺','🍷','🥂','🍹','🧃','🥤','☕','🧋','🫖','🍵',
  '🫔','🥙','🫕','🍛','🍲','🥣','🍱','🍘','🥟','🦪',
  '🍑','🍓','🍉','🍌','🍋','🍊','🫐','🥭','🍇','賞',
];

const KEYWORD_EMOJI = {
  'hamburguesa': '🍔', 'burger': '🍔',
  'pizza': '🍕',
  'taco': '🌮',
  'burrito': '🌯',
  'sushi': '🍣',
  'ramen': '🍜', 'sopa': '🍲', 'caldo': '🍲',
  'pasta': '🍝', 'fideo': '🍝', 'tallarin': '🍝',
  'ensalada': '🥗',
  'carne': '🥩', 'asado': '🥩', 'filete': '🥩', 'lomo': '🥩',
  'pollo': '🍗', 'alitas': '🍗',
  'pescado': '🐟', 'trucha': '🐟', 'ceviche': '🐟',
  'arroz': '🍚', 'chaufa': '🍚',
  'papas': '🍟', 'frito': '🍟',
  'huevo': '🍳', 'desayuno': '🍳',
  'empanada': '🥟', 'salteña': '🥟',
  'sandwich': '🥪', 'emparedado': '🥪',
  'pan': '🍞',
  'cafe': '☕', 'té': '☕',
  'jugo': '🥤', 'refresco': '🥤', 'soda': '🥤', 'gaseosa': '🥤',
  'cerveza': '🍺',
  'vino': '🍷',
  'coctel': '🍹', 'trago': '🍹',
  'helado': '🍦',
  'pastel': '🍰', 'torta': '🍰', 'postre': '🍰',
  'chocolate': '🍫',
  'donas': '🍩',
  'fruta': '🍎',
  'silpancho': '🍛', 'picante': '🍛', 'ají': '🌶️',
  'majadito': '🥘',
};

function autoSuggestEmoji(text) {
  const lower = text.toLowerCase();
  for (const [key, emoji] of Object.entries(KEYWORD_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return null;
}

// ─── Utilities ────────────────────────────────────────────────
function encodeMenu(data) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); }
  catch { return ''; }
}
function decodeMenu(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch { return null; }
}

function formatPrice(n) {
  return 'Bs ' + parseFloat(n || 0).toFixed(2);
}

function getHashRoute() {
  const hash = window.location.hash || '#/';
  const [path, qs] = hash.slice(1).split('?');
  const params = new URLSearchParams(qs || '');
  return { path: path || '/', params };
}

function navigate(path) {
  window.location.hash = path;
}

function showToast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

function setStickyBar(html) {
  const sb = document.getElementById('sticky-bar');
  if (html) {
    sb.innerHTML = html;
    sb.classList.remove('hidden');
    document.body.classList.add('has-sticky');
  } else {
    sb.innerHTML = '';
    sb.classList.add('hidden');
    document.body.classList.remove('has-sticky');
  }
}

function getCartTotal() {
  if (!state.menuData) return { count: 0, total: 0 };
  let count = 0, total = 0;
  for (const [idx, qty] of Object.entries(state.cart)) {
    const item = state.menuData.items[+idx];
    if (item && qty > 0) { count += qty; total += qty * parseFloat(item.price || 0); }
  }
  return { count, total };
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('✅ Link copiado')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showToast('✅ Link copiado');
  });
}

// ─── Router ───────────────────────────────────────────────────
function render() {
  const { path, params } = getHashRoute();
  state.cart = {};

  document.body.classList.remove('has-creator-cta', 'has-sticky');
  setStickyBar(null);
  updateNavbar(path);

  if (path === '/' || path === '') return renderHome();
  if (path === '/crear') return renderCreator();
  if (path === '/menu') return renderMenu(params);
  if (path === '/checkout') return renderCheckout(params);
  renderNotFound();
}

function updateNavbar(path) {
  const actions = document.getElementById('navbar-actions');
  actions.innerHTML = '';
  if (path === '/' || path === '') {
    const btn = document.createElement('button');
    btn.className = 'btn btn--primary btn--sm';
    btn.textContent = '+ Crear Menú';
    btn.onclick = () => navigate('/crear');
    actions.appendChild(btn);
  }
}

// ─── Page: Home ───────────────────────────────────────────────
function renderHome() {
  const root = document.getElementById('app-root');
  root.innerHTML = `
    <div class="container animate-in">
      <div class="home-hero">
        <h1>Menú Digital<br>con WhatsApp 🚀</h1>
        <p>Crea tu menú en minutos, comparte el link y recibe pedidos directamente en tu WhatsApp.</p>
        <button class="btn btn--full" style="background:#fff;color:var(--primary);font-weight:800;font-size:17px;" onclick="navigate('/crear')">
          🍽️ Crear mi Menú Gratis
        </button>
      </div>
      <div class="home-steps">
        <div class="home-step animate-in" style="animation-delay:0.05s">
          <div class="step-icon">📝</div>
          <div class="step-title">1. Crea</div>
          <div class="step-desc">Ingresa tu menú con nombre, precio y emoji.</div>
        </div>
        <div class="home-step animate-in" style="animation-delay:0.1s">
          <div class="step-icon">🔗</div>
          <div class="step-title">2. Comparte</div>
          <div class="step-desc">Copia el link y compártelo con tus clientes.</div>
        </div>
        <div class="home-step animate-in" style="animation-delay:0.15s">
          <div class="step-icon">💬</div>
          <div class="step-title">3. Recibe</div>
          <div class="step-desc">Los pedidos llegan a tu WhatsApp automáticamente.</div>
        </div>
      </div>
      <button class="btn btn--primary btn--full btn--pill animate-in" style="animation-delay:0.2s;font-size:17px" onclick="navigate('/crear')">
        Comenzar Ahora →
      </button>

      <div style="margin-top:var(--space-lg);text-align:center;color:var(--on-surface-variant);font-size:13px;">
        Sin registro · Sin backend · 100% gratis
      </div>
    </div>`;
}

// ─── Page: Creator ────────────────────────────────────────────
const LS_KEY = 'gustomenu_creator';

const creatorState = {
  dishes: [{ type: 'standard', emoji: '🍔', name: '', price: '' }],
  openEmojiIdx: null,
};

/** Persist the entire creator form to localStorage. */
function saveCreatorToLS() {
  const name    = document.getElementById('biz-name')?.value    ?? '';
  const prefix  = document.getElementById('biz-prefix')?.value  ?? '+591';
  const phone   = document.getElementById('biz-phone')?.value   ?? '';
  const tagline = document.getElementById('biz-tagline')?.value ?? '';
  const promo   = document.getElementById('biz-promo')?.value   ?? '';
  // Sync dish inputs to state before serialising
  creatorState.dishes.forEach((d, i) => {
    const n = document.getElementById(`dish-name-${i}`);
    const p = document.getElementById(`dish-price-${i}`);
    if (n) d.name  = n.value;
    if (p) d.price = p.value;
  });
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      name, prefix, phone, tagline, promo,
      dishes: creatorState.dishes,
    }));
  } catch { /* quota exceeded — ignore */ }
}

/** Load creator data from localStorage into creatorState + return business fields. */
function loadCreatorFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function renderCreator() {
  // ── Restore from localStorage before rendering ──
  const saved = loadCreatorFromLS();
  if (saved) {
    if (saved.dishes && saved.dishes.length > 0) creatorState.dishes = saved.dishes;
  }

  document.body.classList.add('has-creator-cta');
  const root = document.getElementById('app-root');
  const s = saved || {};
  root.innerHTML = `
    <div class="container animate-in">
      <div class="creator-header">
        <h1>Crea tu Menú</h1>
        <p>Completa los datos y genera tu link personalizado.</p>
      </div>

      <!-- Business Info -->
      <div class="section-card">
        <div class="section-title">Datos del Negocio</div>
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          <div class="form-group">
            <label class="form-label" for="biz-name">Nombre del negocio</label>
            <input class="form-input" id="biz-name" type="text" placeholder="ej. Gusto Latino" maxlength="60" value="${escHtml(s.name || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Número de WhatsApp</label>
            <div class="phone-row">
              <input class="phone-prefix form-input" id="biz-prefix" type="text" value="${escHtml(s.prefix || '+52')}" />
              <div class="phone-input-wrap">
                <input class="form-input" id="biz-phone" type="tel" placeholder="Número de teléfono" value="${escHtml(s.phone || '')}" />
              </div>
            </div>
            <span class="form-hint">Incluye código de país si es necesario.</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="biz-tagline">Tagline / Slogan (opcional)</label>
            <input class="form-input" id="biz-tagline" type="text" placeholder="ej. Sabor que se siente. 🌮🔥" maxlength="80" value="${escHtml(s.tagline || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="biz-promo">Promoción del Día (opcional)</label>
            <input class="form-input" id="biz-promo" type="text" placeholder="ej. 2x1 en Empanadas los Martes" maxlength="100" value="${escHtml(s.promo || '')}" />
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="section-card">
        <div class="section-header" style="flex-wrap: wrap; gap: var(--space-sm);">
          <div class="section-title" style="margin:0">Platillos</div>
          <div style="display:flex; gap:var(--space-sm)">
            <button class="btn btn--ghost btn--sm" id="add-dish-btn">➕ Platillo</button>
            <button class="btn btn--ghost btn--sm" id="add-completo-btn">🍲 Almuerzo Completo</button>
          </div>
        </div>
        <div id="dishes-list"></div>
      </div>

      <!-- Generated Link -->
      <div class="section-card" id="link-section" style="display:none">
        <div class="section-title">🔗 Tu Menú está listo</div>
        
        <div class="form-group" style="margin-bottom:var(--space-md)">
          <label class="form-label">Link directo</label>
          <div class="link-box" id="link-box">
            <span id="link-text"></span>
            <button class="btn btn--secondary btn--sm" id="copy-link-btn">Copiar</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:var(--space-md)">
          <label class="form-label">Texto para compartir (WhatsApp/Redes)</label>
          <div class="form-textarea" id="share-text-box" style="white-space: pre-wrap; height: auto; min-height: 120px; font-size: 14px; background: var(--surface-low); border: 1px solid var(--outline-variant); padding: var(--space-sm);"></div>
          <button class="btn btn--secondary btn--sm btn--full" id="copy-text-btn" style="margin-top:var(--space-xs)">Copiar Texto Completo</button>
        </div>

        <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md)">
          <button class="btn btn--primary btn--full" id="open-menu-btn">Ver Menú Digital →</button>
        </div>
      </div>
    </div>

    <!-- Creator sticky CTA -->
    <div class="creator-cta">
      <div class="creator-cta-inner">
        <button class="btn btn--primary btn--full btn--pill" id="generate-btn" style="font-size:17px">
          Generar Link del Menú 🔗
        </button>
      </div>
    </div>`;

  renderDishList();

  // ── Attach save-on-change to all business inputs ──
  ['biz-name','biz-prefix','biz-phone','biz-tagline','biz-promo'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', saveCreatorToLS);
  });

  document.getElementById('add-dish-btn').onclick = () => {
    creatorState.dishes.push({ type: 'standard', emoji: '🍽️', name: '', price: '' });
    renderDishList();
    saveCreatorToLS();
    setTimeout(() => {
      const items = document.querySelectorAll('.dish-item');
      items[items.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  document.getElementById('add-completo-btn').onclick = () => {
    creatorState.dishes.push({ type: 'completo', emoji: '🍲', name: 'Almuerzo Completo', soup: '', main: '', price: '' });
    renderDishList();
    saveCreatorToLS();
    setTimeout(() => {
      const items = document.querySelectorAll('.dish-item');
      items[items.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  document.getElementById('generate-btn').onclick = handleGenerate;
}

function renderDishList() {
  const list = document.getElementById('dishes-list');
  if (!list) return;
  list.innerHTML = '';
  creatorState.dishes.forEach((d, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'dish-item emoji-picker-wrap';
    const isCompleto = d.type === 'completo';
    wrap.innerHTML = `
      <button class="dish-emoji-btn" id="emoji-btn-${i}" title="Elegir emoji">${d.emoji}</button>
      ${creatorState.openEmojiIdx === i ? buildEmojiPicker(i) : ''}
      <div class="dish-fields">
        ${isCompleto ? `
          <div style="font-size:12px; font-weight:700; color:var(--primary); margin-bottom:2px">ALMUERZO COMPLETO</div>
          <input class="form-input" id="dish-soup-${i}" type="text"
            placeholder="Sopa (ej. Sopa de Maní)" value="${d.soup || ''}" maxlength="60" style="margin-bottom:4px" />
          <input class="form-input" id="dish-main-${i}" type="text"
            placeholder="Segundo (ej. Silpancho)" value="${d.main || ''}" maxlength="60" />
        ` : `
          <input class="form-input dish-name-input" id="dish-name-${i}" type="text"
            placeholder="Nombre del platillo" value="${d.name}" maxlength="60" />
        `}
        <div class="price-row">
          <span class="price-symbol">Bs</span>
          <input class="form-input price-input" id="dish-price-${i}" type="number"
            placeholder="0.00" value="${d.price}" min="0" step="0.01" />
        </div>
      </div>
      ${creatorState.dishes.length > 1 ? `<button class="dish-remove" data-remove="${i}" title="Eliminar">✕</button>` : ''}`;
    list.appendChild(wrap);

    // Sync inputs to state + persist
    if (isCompleto) {
      wrap.querySelector(`#dish-soup-${i}`).oninput = e => { 
        creatorState.dishes[i].soup = e.target.value; 
        const suggested = autoSuggestEmoji(e.target.value);
        if (suggested && suggested !== creatorState.dishes[i].emoji) {
          creatorState.dishes[i].emoji = suggested;
          const btn = document.getElementById(`emoji-btn-${i}`);
          if (btn) btn.textContent = suggested;
        }
        saveCreatorToLS(); 
      };
      wrap.querySelector(`#dish-main-${i}`).oninput = e => { 
        creatorState.dishes[i].main = e.target.value; 
        const suggested = autoSuggestEmoji(e.target.value);
        if (suggested && suggested !== creatorState.dishes[i].emoji) {
          creatorState.dishes[i].emoji = suggested;
          const btn = document.getElementById(`emoji-btn-${i}`);
          if (btn) btn.textContent = suggested;
        }
        saveCreatorToLS(); 
      };
    } else {
      wrap.querySelector(`#dish-name-${i}`).oninput = e => { 
        creatorState.dishes[i].name = e.target.value; 
        const suggested = autoSuggestEmoji(e.target.value);
        if (suggested && suggested !== creatorState.dishes[i].emoji) {
          creatorState.dishes[i].emoji = suggested;
          const btn = document.getElementById(`emoji-btn-${i}`);
          if (btn) btn.textContent = suggested;
        }
        saveCreatorToLS(); 
      };
    }
    wrap.querySelector(`#dish-price-${i}`).oninput = e => { creatorState.dishes[i].price = e.target.value; saveCreatorToLS(); };
    wrap.querySelector(`#emoji-btn-${i}`).onclick = () => {
      creatorState.openEmojiIdx = creatorState.openEmojiIdx === i ? null : i;
      renderDishList();
    };
    const removeBtn = wrap.querySelector(`[data-remove="${i}"]`);
    if (removeBtn) removeBtn.onclick = () => {
      creatorState.dishes.splice(i, 1);
      creatorState.openEmojiIdx = null;
      renderDishList();
      saveCreatorToLS();
    };
  });
}

function buildEmojiPicker(idx) {
  const btns = EMOJIS.map(e =>
    `<button type="button" data-emoji="${e}" data-idx="${idx}">${e}</button>`
  ).join('');
  setTimeout(() => {
    const popup = document.getElementById(`epopup-${idx}`);
    if (!popup) return;
    popup.querySelectorAll('button').forEach(b => {
      b.onclick = () => {
        creatorState.dishes[idx].emoji = b.dataset.emoji;
        creatorState.openEmojiIdx = null;
        renderDishList();
        saveCreatorToLS();
      };
    });
  }, 0);
  return `<div class="emoji-picker-popup" id="epopup-${idx}">${btns}</div>`;
}

function collectCreatorData() {
  const name = document.getElementById('biz-name').value.trim();
  const prefix = document.getElementById('biz-prefix').value.trim();
  const phone = document.getElementById('biz-phone').value.trim();
  const tagline = document.getElementById('biz-tagline').value.trim();
  const promo = document.getElementById('biz-promo').value.trim();

  // Sync latest input values to state (in case renderDishList was not re-called)
  creatorState.dishes.forEach((d, i) => {
    const p = document.getElementById(`dish-price-${i}`);
    if (p) d.price = p.value;
    
    if (d.type === 'completo') {
      const s = document.getElementById(`dish-soup-${i}`);
      const m = document.getElementById(`dish-main-${i}`);
      if (s) d.soup = s.value.trim();
      if (m) d.main = m.value.trim();
      d.name = `Almuerzo Completo (${d.soup} + ${d.main})`;
    } else {
      const n = document.getElementById(`dish-name-${i}`);
      if (n) d.name = n.value.trim();
    }
  });

  return { name, phone: (prefix + phone).replace(/\s/g,''), tagline, promo, items: creatorState.dishes };
}

function handleGenerate() {
  const data = collectCreatorData();
  if (!data.name) { showToast('⚠️ Ingresa el nombre del negocio'); return; }
  if (!data.phone || data.phone.replace(/\D/g,'').length < 7) { showToast('⚠️ Ingresa el número de WhatsApp'); return; }
  const validItems = data.items.filter(d => d.name && parseFloat(d.price) > 0);
  if (validItems.length === 0) { showToast('⚠️ Agrega al menos un platillo con nombre y precio'); return; }
  data.items = validItems;

  const encoded = encodeMenu(data);
  const url = `${location.origin}${location.pathname}#/menu?d=${encoded}`;

  // Build shareable text
  const sep = '━━━━━━━━━━━━━━━━━━━━';
  const itemLines = data.items.map(item => `   ${item.emoji} *${item.name}* — ${formatPrice(item.price)}`).join('\n');
  const shareText = 
    `🍽️ *${data.name}*\n` +
    (data.tagline ? `_${data.tagline}_\n` : '') +
    `${sep}\n\n` +
    `📖 *Menú de Hoy:*\n` +
    `${itemLines}\n\n` +
    `${sep}\n` +
    `👇 *Haz tu pedido aquí:*\n` +
    `${url}`;

  const section = document.getElementById('link-section');
  section.style.display = 'block';
  
  document.getElementById('link-text').textContent = url;
  document.getElementById('copy-link-btn').onclick = () => copyToClipboard(url);
  
  const textBox = document.getElementById('share-text-box');
  textBox.textContent = shareText;
  document.getElementById('copy-text-btn').onclick = () => copyToClipboard(shareText);

  document.getElementById('open-menu-btn').onclick = () => navigate(`/menu?d=${encoded}`);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Page: Menu View ──────────────────────────────────────────
function renderMenu(params) {
  const encoded = params.get('d');
  const data = encoded ? decodeMenu(encoded) : null;
  if (!data || !data.items) return renderBadMenu();

  state.menuData = data;
  state.cart = {};

  const root = document.getElementById('app-root');
  const [promoItem, ...rest] = data.items;
  const hasPromo = data.promo && promoItem;

  root.innerHTML = `
    <div class="container animate-in">
      <!-- Hero -->
      <div class="menu-hero">
        <h1>${escHtml(data.name)}</h1>
        ${data.tagline ? `<div class="tagline">${escHtml(data.tagline)}</div>` : ''}
        <div class="menu-hero-badges">
          <span class="badge badge--open">● ABIERTO</span>
          <span class="badge badge--time">⏱ 15-25 min</span>
        </div>
      </div>

      ${hasPromo ? `
      <div class="menu-section-title">Promo del Día</div>
      <div class="promo-card" id="promo-card-0">
        <div class="promo-badge">⚡ PROMO</div>
        <div class="promo-emoji">${promoItem.emoji}</div>
        <div class="promo-info">
          <div class="promo-name">${escHtml(promoItem.name)}</div>
          ${data.promo ? `<div class="promo-desc">${escHtml(data.promo)}</div>` : ''}
          <div class="promo-price">${formatPrice(promoItem.price)}</div>
        </div>
        <div id="promo-ctrl-0"></div>
      </div>` : ''}

      <!-- All Items -->
      <div class="menu-section-title">Nuestros Clásicos</div>
      <div class="menu-grid" id="menu-grid"></div>
    </div>`;

  // Render grid items
  const grid = document.getElementById('menu-grid');
  const startIdx = hasPromo ? 1 : 0;
  data.items.forEach((item, i) => {
    if (hasPromo && i === 0) return; // already shown as promo
    const card = document.createElement('div');
    card.className = 'menu-card animate-in';
    card.style.animationDelay = `${(i - startIdx) * 0.06}s`;
    card.id = `menu-card-${i}`;

    let itemDisplayName = escHtml(item.name);
    if (item.type === 'completo') {
      itemDisplayName = `<div style="font-size:11px; color:var(--primary); font-weight:700">COMPLETO</div>
                         <div style="font-weight:700">${escHtml(item.soup)}</div>
                         <div style="font-size:13px; color:var(--on-surface-variant)">+ ${escHtml(item.main)}</div>`;
    }

    card.innerHTML = `
      <div class="menu-card-top">
        <div class="menu-card-emoji">${item.emoji}</div>
        <div class="menu-card-name">${itemDisplayName}</div>
      </div>
      <div class="menu-card-footer">
        <div class="menu-card-price">${formatPrice(item.price)}</div>
        <div id="ctrl-${i}"></div>
      </div>`;
    grid.appendChild(card);
    renderItemControl(i);
  });

  // Promo control
  if (hasPromo) renderItemControl(0, 'promo-ctrl-0');

  updateStickyCart(encoded);
}

function renderItemControl(idx, targetId) {
  const id = targetId || `ctrl-${idx}`;
  const container = document.getElementById(id);
  if (!container) return;
  const qty = state.cart[idx] || 0;
  if (qty === 0) {
    container.innerHTML = `<button class="add-btn" id="add-${idx}" aria-label="Agregar">+</button>`;
    container.querySelector(`#add-${idx}`).onclick = () => {
      state.cart[idx] = 1;
      triggerPop(container);
      renderItemControl(idx, targetId);
      updateStickyCart(getCurrentEncoded());
    };
  } else {
    container.innerHTML = `
      <div class="qty-controls">
        <button class="qty-btn" id="dec-${idx}">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" id="inc-${idx}" style="background:var(--primary);color:#fff">+</button>
      </div>`;
    container.querySelector(`#dec-${idx}`).onclick = () => {
      state.cart[idx] = Math.max(0, qty - 1);
      if (state.cart[idx] === 0) delete state.cart[idx];
      renderItemControl(idx, targetId);
      updateStickyCart(getCurrentEncoded());
    };
    container.querySelector(`#inc-${idx}`).onclick = () => {
      state.cart[idx] = qty + 1;
      triggerPop(container);
      renderItemControl(idx, targetId);
      updateStickyCart(getCurrentEncoded());
    };
  }
}

function getCurrentEncoded() {
  const { params } = getHashRoute();
  return params.get('d') || '';
}

function triggerPop(el) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

function updateStickyCart(encoded) {
  const { count, total } = getCartTotal();
  if (count === 0) { setStickyBar(null); return; }
  setStickyBar(`
    <div class="sticky-inner">
      <div class="sticky-summary">
        <span class="sticky-label">Resumen del pedido</span>
        <span class="sticky-amount">${count} item${count > 1 ? 's' : ''} · ${formatPrice(total)}</span>
      </div>
      <button class="btn btn--whatsapp btn--pill" id="checkout-btn" style="white-space:nowrap">
        ▶ Pedir por WhatsApp
      </button>
    </div>`);
  document.getElementById('checkout-btn').onclick = () => navigate(`/checkout?d=${encoded}`);
}

function renderBadMenu() {
  document.getElementById('app-root').innerHTML = `
    <div class="container">
      <div class="empty-state animate-in">
        <div class="empty-icon">😕</div>
        <div class="empty-title">Menú no encontrado</div>
        <div class="empty-desc">El link parece estar dañado o incompleto.</div>
        <button class="btn btn--primary btn--pill" onclick="navigate('/crear')">Crear mi propio menú</button>
      </div>
    </div>`;
}

// ─── Page: Checkout ───────────────────────────────────────────
function renderCheckout(params) {
  const encoded = params.get('d');
  const data = encoded ? decodeMenu(encoded) : null;

  // Recover cart from sessionStorage if navigated directly
  if (!state.menuData && data) {
    state.menuData = data;
    // If no cart items, can't checkout
    if (Object.keys(state.cart).length === 0) {
      navigate(`/menu?d=${encoded}`);
      return;
    }
  }
  if (!state.menuData) { navigate('/'); return; }

  const { count, total } = getCartTotal();
  if (count === 0) { navigate(`/menu?d=${encoded}`); return; }

  const cartItems = Object.entries(state.cart)
    .filter(([, qty]) => qty > 0)
    .map(([idx, qty]) => ({ item: state.menuData.items[+idx], qty, idx: +idx }));

  const root = document.getElementById('app-root');
  root.innerHTML = `
    <div class="container animate-in">
      <div class="checkout-header">
        <button class="btn back-btn" onclick="history.back()">← </button>
        <div class="checkout-title">Revisa tu pedido</div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary-card">
        <div class="order-summary-head">🧾 RESUMEN</div>
        ${cartItems.map(({ item, qty }) => {
          let displayName = escHtml(item.name);
          if (item.type === 'completo') {
            displayName = `<b>Almuerzo Completo</b><br><small>${escHtml(item.soup)} + ${escHtml(item.main)}</small>`;
          }
          return `
          <div class="order-item">
            <div class="order-item-left">
              <span class="order-qty-badge">${qty}x</span>
              <span class="order-item-name">${item.emoji} ${displayName}</span>
            </div>
            <span class="order-item-price">${formatPrice(qty * parseFloat(item.price))}</span>
          </div>`;
        }).join('')}
        <div class="order-totals">
          <div class="divider"></div>
          <div class="order-row"><span>Subtotal</span><span>${formatPrice(total)}</span></div>
          <div class="order-total-row"><span>Total</span><span class="total-amount">${formatPrice(total)}</span></div>
        </div>
      </div>

      <!-- Customer Name -->
      <div class="customer-card">
        <div class="customer-card-header">
          <span class="customer-card-icon">👤</span>
          <span class="customer-card-title">¿Quién hace el pedido?</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="customer-name">Tu Nombre</label>
          <input class="form-input" id="customer-name" type="text" placeholder="Ej. María López" autocomplete="name" />
          <span class="form-hint">Necesitamos tu nombre para identificar tu orden.</span>
        </div>
      </div>

      <div style="height:var(--sticky-h)"></div>
    </div>`;

  // Sticky send button
  setStickyBar(`
    <div class="sticky-inner" style="flex-direction:column;gap:6px">
      <button class="btn btn--whatsapp btn--full btn--pill" id="send-wa-btn" style="font-size:17px">
        Enviar Pedido por WhatsApp 📱
      </button>
      <div style="text-align:center;font-size:12px;color:var(--on-surface-variant)">
        🔒 Tu pedido se confirmará en el chat
      </div>
    </div>`);
  document.body.classList.add('has-sticky');

  document.getElementById('send-wa-btn').onclick = () => sendWhatsApp(cartItems, total);
}

function sendWhatsApp(cartItems, total) {
  const customerName = document.getElementById('customer-name').value.trim();
  if (!customerName) {
    document.getElementById('customer-name').focus();
    showToast('⚠️ Ingresa tu nombre para continuar');
    return;
  }

  const { name: bizName, tagline, promo } = state.menuData;
  const sep  = '━━━━━━━━━━━━━━━━━━━━';
  const sep2 = '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄';

  // Header
  const header = [
    `🍽️ *${bizName}*`,
    tagline ? `_${tagline}_` : '',
    sep,
  ].filter(Boolean).join('\n');

  // Item lines  —  emoji · name · qty × unit = subtotal
  const itemLines = cartItems.map(({ item, qty }) => {
    const unit    = parseFloat(item.price);
    const subtot  = formatPrice(qty * unit);
    let name      = item.name;
    if (item.type === 'completo') {
      name = `Almuerzo Completo (${item.soup} + ${item.main})`;
    }
    return `${item.emoji} *${name}*\n   ${qty} × ${formatPrice(unit)} = *${subtot}*`;
  }).join('\n\n');

  // Promo note (if any)
  const promoLine = promo ? `\n🎉 _Promo: ${promo}_` : '';

  // Footer
  const footer = [
    sep,
    `👤 *Cliente:* ${customerName}`,
    sep2,
    `🛒 *Total a pagar: ${formatPrice(total)}*`,
    sep,
    promoLine,
    `\n_Pedido realizado vía GustoMenu_ 🔗`,
  ].filter(Boolean).join('\n');

  const msg = `${header}\n\n${itemLines}\n\n${footer}`;

  const phone = state.menuData.phone.replace(/\D/g, '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ─── Not Found ────────────────────────────────────────────────
function renderNotFound() {
  document.getElementById('app-root').innerHTML = `
    <div class="container">
      <div class="empty-state animate-in">
        <div class="empty-icon">🌪️</div>
        <div class="empty-title">Página no encontrada</div>
        <div class="empty-desc">Esta ruta no existe.</div>
        <button class="btn btn--primary btn--pill" onclick="navigate('/')">Ir al inicio</button>
      </div>
    </div>`;
}

// ─── Helpers ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ─── Boot ─────────────────────────────────────────────────────
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
