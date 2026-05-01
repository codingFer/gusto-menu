import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container animate-in">
      <div className="home-hero">
        <h1>Menú Digital<br />con WhatsApp 🚀</h1>
        <p>Crea tu menú en minutos, comparte el link y recibe pedidos directamente en tu WhatsApp.</p>
        <button 
          className="btn btn--full" 
          style={{ background: 'var(--card-bg)', color: 'var(--primary)', fontWeight: 800, fontSize: '17px' }}
          onClick={() => navigate('/crear')}
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

      <button 
        className="btn btn--primary btn--full btn--pill animate-in" 
        style={{ animationDelay: '0.4s', fontSize: '17px' }}
        onClick={() => navigate('/crear')}
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
