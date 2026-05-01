import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRestaurantes, getUsers, register } from '../api';
import { 
  LayoutDashboard, 
  Plus, 
  ExternalLink, 
  Settings, 
  LogOut,
  UtensilsCrossed,
  Store,
  Users,
  ShieldCheck,
  Mail,
  UserPlus,
  ArrowLeft
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser, showToast } = useApp();
  const [restaurantes, setRestaurantes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menus'); // 'menus' | 'users'
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const restData = await getRestaurantes();
      setRestaurantes(restData);
      
      if (user.role_id === 1) {
        const userData = await getUsers();
        setUsers(userData);
      }
    } catch (err) {
      showToast('❌ Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    showToast('Sesión cerrada');
  };

  if (!user) return null;

  return (
    <div className="container animate-in container--wide">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Panel de Control</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>
            Hola, <b>{user.username}</b>. {user.role_id === 1 ? 'Administrador del sistema.' : 'Gestiona tus menús aquí.'}
          </p>
        </div>
        <div className="dashboard-actions">
          {user.role_id === 1 && (
            <div className="tabs" style={{ background: 'var(--surface-container)', padding: '4px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '4px' }}>
              <button 
                className={`btn btn--sm ${activeTab === 'menus' ? 'btn--primary' : 'btn--ghost'}`}
                style={{ border: 'none', boxShadow: activeTab === 'menus' ? undefined : 'none' }}
                onClick={() => { setActiveTab('menus'); setShowCreateUser(false); }}
              >
                <Store size={16} /> Menús
              </button>
              <button 
                className={`btn btn--sm ${activeTab === 'users' ? 'btn--primary' : 'btn--ghost'}`}
                style={{ border: 'none', boxShadow: activeTab === 'users' ? undefined : 'none' }}
                onClick={() => setActiveTab('users')}
              >
                <Users size={16} /> Usuarios
              </button>
            </div>
          )}
          <button className="btn btn--secondary btn--sm" onClick={handleLogout}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </div>

      {activeTab === 'menus' ? (
        <MenusView 
          restaurantes={restaurantes} 
          loading={loading} 
          onAdd={() => navigate('/crear')} 
        />
      ) : (
        <UsersView 
          users={users} 
          loading={loading} 
          showCreate={showCreateUser}
          setShowCreate={setShowCreateUser}
          onUserCreated={fetchData}
        />
      )}
    </div>
  );
};

const MenusView = ({ restaurantes, loading, onAdd }) => (
  <div className="menu-grid">
    <div 
      className="card" 
      style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        border: '2px dashed var(--outline-variant)', background: 'transparent', cursor: 'pointer', minHeight: '200px'
      }}
      onClick={onAdd}
    >
      <div style={{ background: 'var(--primary-container)', color: 'var(--primary)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
        <Plus size={32} />
      </div>
      <span style={{ fontWeight: 700 }}>Crear Nuevo Menú</span>
    </div>

    {!loading && restaurantes.map(res => (
      <div key={res.id} className="card animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <div style={{ background: 'var(--surface-container)', width: '56px', height: '56px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.nombre}</h3>
            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>/{res.slug}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'auto' }}>
          <button className="btn btn--primary btn--sm btn--full" onClick={() => window.open(`/#/menu?d=${res.id}`, '_blank')}>
            <ExternalLink size={16} /> Ver
          </button>
          <button className="btn btn--secondary btn--sm"><Settings size={16} /></button>
        </div>
      </div>
    ))}
  </div>
);

const UsersView = ({ users, loading, showCreate, setShowCreate, onUserCreated }) => {
  const { showToast } = useApp();
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role_id: 2 });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(newUser.username, newUser.password, newUser.email, newUser.role_id);
      showToast('✅ Usuario creado correctamente');
      setShowCreate(false);
      setNewUser({ username: '', email: '', password: '', role_id: 2 });
      onUserCreated();
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (showCreate) {
    return (
      <div className="section-card animate-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => setShowCreate(false)} style={{ marginBottom: 'var(--space-lg)' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h2 style={{ marginBottom: 'var(--space-xl)', fontWeight: 800 }}>Crear Nuevo Usuario</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <input className="form-input" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Rol</label>
            <select className="form-input" value={newUser.role_id} onChange={e => setNewUser({...newUser, role_id: parseInt(e.target.value)})}>
              <option value="2">Owner (Restaurante)</option>
              <option value="1">Admin (Sistema)</option>
            </select>
          </div>
          <button className="btn btn--primary btn--full btn--pill" type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : <><UserPlus size={18} /> Crear Usuario</>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <h2 style={{ fontWeight: 800 }}>Usuarios del Sistema</h2>
        <button className="btn btn--primary btn--sm" onClick={() => setShowCreate(true)}>
          <UserPlus size={16} /> Nuevo Usuario
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td style={{ opacity: 0.8 }}>{u.email}</td>
                <td>
                  <span className="badge" style={{ background: u.role_id === 1 ? 'var(--primary-container)' : 'var(--surface-container)', color: u.role_id === 1 ? 'var(--primary)' : 'var(--on-surface)' }}>
                    {u.role_id === 1 ? <ShieldCheck size={12} style={{ marginRight: '4px' }} /> : null}
                    {u.role_id === 1 ? 'Admin' : 'Owner'}
                  </span>
                </td>
                <td style={{ fontSize: '12px', opacity: 0.6 }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
