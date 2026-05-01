import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRestaurantes } from '../api';
import { 
  LayoutDashboard, 
  Plus, 
  ExternalLink, 
  Settings, 
  LogOut,
  UtensilsCrossed,
  Store
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser, showToast } = useApp();
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRestaurantes = async () => {
      try {
        const data = await getRestaurantes();
        setRestaurantes(data);
      } catch (err) {
        showToast('❌ Error al cargar restaurantes');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantes();
  }, [user, navigate, showToast]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    showToast('Sesión cerrada');
  };

  if (!user) return null;

  return (
    <div className="container animate-in container--wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>Panel de Control</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>Hola, <b>{user.username}</b>. Gestiona tus menús aquí.</p>
        </div>
        <button className="btn btn--secondary btn--sm" onClick={handleLogout}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
        {/* Create New Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            border: '2px dashed var(--outline-variant)',
            background: 'transparent',
            cursor: 'pointer',
            minHeight: '200px'
          }}
          onClick={() => navigate('/crear')}
        >
          <div style={{ background: 'var(--primary-container)', color: 'var(--primary)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Plus size={32} />
          </div>
          <span style={{ fontWeight: 700 }}>Crear Nuevo Menú</span>
        </div>

        {/* Restaurant Cards */}
        {loading ? (
          [1, 2].map(i => <div key={i} className="card" style={{ height: '200px', opacity: 0.3, background: 'var(--surface-low)' }}></div>)
        ) : (
          restaurantes.map(res => (
            <div key={res.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <div style={{ background: 'var(--surface-container)', width: '56px', height: '56px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px' }}>
                  <Store size={32} style={{ color: 'var(--primary)', margin: 'auto' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800 }}>{res.nombre}</h3>
                  <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>/{res.slug}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'auto' }}>
                <button 
                  className="btn btn--primary btn--sm btn--full"
                  onClick={() => window.open(`/#/menu?d=${res.id}`, '_blank')} // Simplified for now
                >
                  <ExternalLink size={16} /> Ver
                </button>
                <button className="btn btn--secondary btn--sm">
                  <Settings size={16} /> Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {restaurantes.length === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)', padding: 'var(--space-2xl)', background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
          <UtensilsCrossed size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3>Aún no tienes menús guardados</h3>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '8px' }}>
            Comienza creando tu primer menú digital para que aparezca aquí.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
