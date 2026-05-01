/* ============================================================
   GustoMenu — utils.js
   Utility functions for menu encoding, decoding, and formatting.
   ============================================================ */

/**
 * Encodes menu data object into a base64 string.
 */
export function encodeMenu(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch (err) {
    console.error('Encoding error:', err);
    return '';
  }
}

/**
 * Decodes a base64 string into a menu data object.
 */
export function decodeMenu(str) {
  try {
    // URL parameters often turn '+' into ' ', breaking Base64. Fix it here.
    const sanitized = (str || '').replace(/ /g, '+');
    return JSON.parse(decodeURIComponent(escape(atob(sanitized))));
  } catch (err) {
    console.error('Decoding error:', err);
    return null;
  }
}

/**
 * Formats a number as a currency string (Bs).
 */
export function formatPrice(n) {
  return 'Bs ' + parseFloat(n || 0).toFixed(2);
}

/**
 * Escapes HTML characters (not strictly needed in React but kept for logic porting).
 */
export function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Copies text to clipboard with a fallback for older browsers.
 */
export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ─── Emoji palette ────────────────────────────────────────────
export const EMOJIS = [
  '🍔','🍕','🌮','🌯','🍜','🍝','🍣','🍱','🥗','🥘',
  '🍗','🍖','🥩','🥓','🍟','🌭','🍿','🧆','🧇','🥞',
  '🧁','🍰','🎂','🍩','🍪','🍫','🍦','🍨','🍧','🥧',
  '🍺','🍷','🥂','🍹','🧃','🥤','☕','🧋','🫖','🍵',
  '🫔','🥙','🫕','🍛','🍲','🥣','🍱','🍘','🥟','🦪',
  '🍑','🍓','🍉','🍌','🍋','🍊','🫐','🥭','🍇','🍏',
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

/**
 * Suggests an emoji based on text keywords.
 */
export function autoSuggestEmoji(text) {
  const lower = text.toLowerCase();
  for (const [key, emoji] of Object.entries(KEYWORD_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return null;
}
