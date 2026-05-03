import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gustomenu_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadFromHistory = (entry) => {
    localStorage.setItem('gustomenu_creator', JSON.stringify({
      ...entry.bizInfo,
      dishes: entry.dishes
    }));
    navigate('/crear');
  };

  const handleCreateNew = () => {
    localStorage.removeItem('gustomenu_creator');
    navigate('/crear');
  };

  return (
    <div className="container animate-in">
      <div className="home-hero">
        <h1>Menú Digital<br />con WhatsApp 🚀</h1>
        <p>Crea tu menú en minutos, comparte el link y recibe pedidos directamente en tu WhatsApp.</p>
        <button 
          className="btn btn--full" 
          style={{ background: 'var(--card-bg)', color: 'var(--primary)', fontWeight: 800, fontSize: '17px' }}
          onClick={handleCreateNew}
        >
          🍽️ Crear mi Menú Gratis
        </button>
      </div>

      <div className="home-steps">
        <div className="home-step" style={{ animationDelay: '0.1s' }}>
          <span className="step-icon">📝</span>
          <div className="step-title">1. Crea</div>
          <div className="step-desc">Ingresa tu menú con nombre, precio y emoji.</div>
        </div>
        <div className="home-step" style={{ animationDelay: '0.2s' }}>
          <span className="step-icon">🔗</span>
          <div className="step-title">2. Comparte</div>
          <div className="step-desc">Copia el link y compártelo con tus clientes.</div>
        </div>
        <div className="home-step" style={{ animationDelay: '0.3s' }}>
          <span className="step-icon">💬</span>
          <div className="step-title">3. Recibe</div>
          <div className="step-desc">Los pedidos llegan a tu WhatsApp automáticamente.</div>
        </div>
      </div>

      {/* History Section on Home */}
      {history.length > 0 && (
        <div className="section-card animate-in" style={{ animationDelay: '0.4s', marginTop: 'var(--space-md)' }}>
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
                <div style={{ color: 'var(--primary)', padding: '4px' }}>
                  <Eye size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        className="btn btn--primary btn--full btn--pill animate-in" 
        style={{ animationDelay: '0.5s', fontSize: '17px', marginTop: 'var(--space-md)' }}
        onClick={handleCreateNew}
      >
        Comenzar Ahora →
      </button>

      <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '13px', opacity: 0.7 }}>
        Sin registro · Sin backend · 100% gratis
      </div>
    </div>
  );
};

export default Home;
