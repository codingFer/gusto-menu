import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { formatPrice } from './utils';
import { LayoutDashboard } from 'lucide-react';

const Layout = ({ children }) => {
  const { theme, toggleTheme, getCartTotal, currentMenuEncoded, toast, user, logoutUser, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { count, total } = getCartTotal();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    showToast('Sesión cerrada');
  };

  const isHome = location.pathname === '/';
  const isMenu = location.pathname === '/menu';
  const isDashboard = location.pathname === '/dashboard';

  const showSticky = (isMenu && count > 0);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <img src="/favicon.webp" alt="GustoMenu" style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '5px' }} />
          <span className="brand-name" style={{ color: user ? 'var(--primary)' : 'var(--on-surface)' }}>GustoMenu</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
          <Link to="/info" className={`nav-link ${location.pathname === '/info' ? 'active' : ''}`}>¿Cómo funciona?</Link>
          <Link to="/crear" className={`nav-link ${location.pathname === '/crear' ? 'active' : ''}`}>Crear Menú</Link>
          {!user ? (
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Iniciar Sesión</Link>
          ) : (
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Panel Admin</Link>
          )}
        </div>
        <div className="navbar-actions">
          {user && (
            <button className="btn btn--ghost btn--sm" onClick={handleLogout} style={{ color: 'var(--error)', borderColor: 'var(--outline-variant)' }}>
              Cerrar Sesión
            </button>
          )}
          <button 
            className="btn btn--icon" 
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{ fontSize: '20px' }}
          >
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main>{children}</main>

      <footer style={{ textAlign: 'center', padding: '24px 16px', marginTop: 'auto', fontSize: '13px', color: 'var(--on-surface-variant)', opacity: 0.8, borderTop: '1px solid var(--outline-variant)' }}>
        <div>
          Desarrollado con ❤️ por{' '}
          <a 
            href="https://codingfer.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}
          >
            @codingFer
          </a>
        </div>
      </footer>

      {showSticky && (
        <div className="sticky-bar">
          <div className="sticky-inner">
            <div className="sticky-summary">
              <span className="sticky-label">Resumen del pedido</span>
              <span className="sticky-amount">{count} item{count !== 1 ? 's' : ''} · {formatPrice(total)}</span>
            </div>
            <button 
              className="btn btn--whatsapp btn--pill" 
              onClick={() => navigate(`/checkout?d=${currentMenuEncoded}`)}
              style={{ whiteSpace: 'nowrap' }}
            >
              ▶ Pedir por WhatsApp
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span>{toast}</span>
        </div>
      )}
    </>
  );
};

export default Layout;
