import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRestaurantes, getUsers, register, updateRestaurante, updateUser } from '../api';
import { 
  LayoutDashboard, 
  Plus, 
  ExternalLink, 
  Settings, 
  UtensilsCrossed,
  Store,
  Users,
  ShieldCheck,
  Mail,
  UserPlus,
  ArrowLeft,
  Save,
  X,
  Edit2,
  KeyRound
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser, showToast } = useApp();
  const [restaurantes, setRestaurantes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurantes'); // 'restaurantes' | 'users'
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingRes, setEditingRes] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

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

  if (!user) return null;

  return (
    <div className="container animate-in container--wide" style={{ minHeight: 'calc(100vh - var(--navbar-h) - 80px)' }}>
      {/* Edit Restaurant Modal */}
      {editingRes && (
        <EditModal 
          res={editingRes} 
          onClose={() => setEditingRes(null)} 
          onSaved={() => { setEditingRes(null); fetchData(); }} 
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserEditModal 
          targetUser={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSaved={() => { setEditingUser(null); fetchData(); }} 
        />
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Panel de Control</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>
            Hola, <b>{user.username}</b>. {user.role_id === 1 ? 'Administrador del sistema.' : 'Gestiona tus restaurantes aquí.'}
          </p>
        </div>
        <div className="dashboard-actions">
          {user.role_id === 1 && (
            <div className="tabs" style={{ background: 'var(--surface-container)', padding: '4px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '4px' }}>
              <button 
                className={`btn btn--sm ${activeTab === 'restaurantes' ? 'btn--primary' : 'btn--ghost'}`}
                style={{ border: 'none', boxShadow: activeTab === 'restaurantes' ? undefined : 'none' }}
                onClick={() => { setActiveTab('restaurantes'); setShowCreateUser(false); }}
              >
                <Store size={16} /> Restaurantes
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
        </div>
      </div>

      {activeTab === 'restaurantes' ? (
        <RestaurantsView 
          restaurantes={restaurantes} 
          loading={loading} 
          onEdit={(res) => navigate(`/crear?id=${res.id}`)}
          isAdmin={user.role_id === 1}
        />
      ) : (
        <UsersView 
          users={users} 
          loading={loading} 
          showCreate={showCreateUser}
          setShowCreate={setShowCreateUser}
          onUserCreated={fetchData}
          onEditUser={(u) => setEditingUser(u)}
        />
      )}
    </div>
  );
};

const EditModal = ({ res, onClose, onSaved }) => {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({ ...res });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateRestaurante(res.id, formData);
      showToast('✅ Cambios guardados');
      onSaved();
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="section-card animate-in modal-content">
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        <h2 style={{ marginBottom: 'var(--space-xl)', fontWeight: 800 }}>Editar Negocio</h2>
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nombre del Negocio</label>
            <input className="form-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input className="form-input" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Slug (URL)</label>
            <input className="form-input" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost btn--full" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary btn--full" disabled={isSaving}>
              {isSaving ? 'Guardando...' : <><Save size={18} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserEditModal = ({ targetUser, onClose, onSaved }) => {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({ 
    username: targetUser.username, 
    email: targetUser.email, 
    role_id: targetUser.role_id,
    password: '' 
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(targetUser.id, formData);
      showToast('✅ Usuario actualizado');
      onSaved();
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="section-card animate-in modal-content">
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        <h2 style={{ marginBottom: 'var(--space-xl)', fontWeight: 800 }}>Editar Usuario</h2>
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <input className="form-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Rol</label>
            <select className="form-input" value={formData.role_id} onChange={e => setFormData({...formData, role_id: parseInt(e.target.value)})}>
              <option value="2">Owner (Restaurante)</option>
              <option value="1">Admin (Sistema)</option>
            </select>
          </div>
          
          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <KeyRound size={16} /> Reiniciar Contraseña
            </label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="Nueva contraseña (dejar vacío para no cambiar)" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn--ghost btn--full" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary btn--full" disabled={isSaving}>
              {isSaving ? 'Actualizar' : <><Save size={18} /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RestaurantsView = ({ restaurantes, loading, onEdit, isAdmin }) => (
  <div className="menu-grid">
    {!loading && restaurantes.length === 0 && (
      <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-2xl)', opacity: 0.7 }}>
        <Store size={48} style={{ margin: '0 auto var(--space-md)', display: 'block' }} />
        <p>No hay restaurantes asociados a esta cuenta.</p>
      </div>
    )}

    {!loading && restaurantes.map(res => (
      <div key={res.id} className="card animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', position: 'relative' }}>
        <button 
          className="btn btn--icon btn--sm" 
          style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px' }}
          onClick={() => onEdit(res)}
          title="Editar negocio"
        >
          <Settings size={18} />
        </button>

        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <div style={{ background: 'var(--surface-container)', width: '56px', height: '56px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ overflow: 'hidden', paddingRight: '32px' }}>
            <h3 style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.nombre}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>/{res.slug}</span>
              {isAdmin && (
                <span className="badge" style={{ fontSize: '10px', background: 'var(--primary-container)', color: 'var(--primary)', padding: '2px 6px' }}>
                  <Users size={10} style={{ marginRight: '4px' }} /> {res.owner_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'auto' }}>
          <button className="btn btn--primary btn--sm btn--full" onClick={() => window.open(`/#/menu?d=${res.id}`, '_blank')}>
            <ExternalLink size={16} /> Ver Menú Digital
          </button>
        </div>
      </div>
    ))}
  </div>
);

const UsersView = ({ users, loading, showCreate, setShowCreate, onUserCreated, onEditUser }) => {
  const { showToast } = useApp();
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role_id: 2,
    restaurant_name: '',
    whatsapp: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(
        newUser.username, 
        newUser.password, 
        newUser.email, 
        newUser.role_id,
        newUser.restaurant_name,
        newUser.whatsapp
      );
      showToast('✅ Usuario y restaurante creados');
      setShowCreate(false);
      setNewUser({ username: '', email: '', password: '', role_id: 2, restaurant_name: '', whatsapp: '' });
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input className="form-input" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          </div>

          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-xs)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: '14px', color: 'var(--primary)' }}>Datos del Restaurante</h4>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">Nombre del Negocio</label>
              <input className="form-input" placeholder="Ej: Pizzería Roma" value={newUser.restaurant_name} onChange={e => setNewUser({...newUser, restaurant_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input className="form-input" placeholder="Ej: 59170000000" value={newUser.whatsapp} onChange={e => setNewUser({...newUser, whatsapp: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rol</label>
            <select className="form-input" value={newUser.role_id} onChange={e => setNewUser({...newUser, role_id: parseInt(e.target.value)})}>
              <option value="2">Owner (Restaurante)</option>
              <option value="1">Admin (Sistema)</option>
            </select>
          </div>
          <button className="btn btn--primary btn--full btn--pill" type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : <><UserPlus size={18} /> Crear Usuario Completo</>}
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
              <th>Acciones</th>
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
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => onEditUser(u)}>
                    <Edit2 size={16} /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
