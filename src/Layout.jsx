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
          <span className="brand-name">GustoMenu</span>
        </Link>
        <div className="navbar-actions">
          {user && !isDashboard && (
            <button className="btn btn--secondary btn--sm" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={18} /> Panel
            </button>
          )}
          {!user && isHome && (
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/login')}>
              Entrar
            </button>
          )}
          {user && (
            <button className="btn btn--ghost btn--sm" onClick={handleLogout} style={{ color: 'var(--error)' }}>
              Cerrar Sesión
            </button>
          )}
          {isHome && (
            <button className="btn btn--primary btn--sm" onClick={() => navigate('/crear')}>
              + Crear Restaurante
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
