import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../api';
import { LogIn, Lock, User, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, showToast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('⚠️ Ingresa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const data = await login(username, password);
      loginUser(data.user);
      showToast('✅ Bienvenid@, ' + data.user.username);
      navigate('/dashboard');
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-in">
      <div className="section-card" style={{ maxWidth: '400px', margin: 'var(--space-2xl) auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🍽️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Iniciar Sesión</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Accede a tu panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                <User size={20} />
              </span>
              <input 
                className="form-input" 
                type="text" 
                name="username"
                autoComplete="username"
                placeholder="Tu nombre de usuario" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                <Lock size={20} />
              </span>
              <input 
                className="form-input" 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                autoComplete="current-password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '48px', paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'transparent',
                  color: 'var(--on-surface-variant)',
                  opacity: 0.6,
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            className="btn btn--primary btn--full btn--pill" 
            type="submit" 
            disabled={loading}
            style={{ marginTop: 'var(--space-md)' }}
          >
            {loading ? 'Cargando...' : <><LogIn size={20} /> Entrar</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
          ¿No tienes cuenta? Contacta con administración
        </div>
      </div>
    </div>
  );
};

export default Login;
