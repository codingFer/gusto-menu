const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeader() {
  const user = JSON.parse(localStorage.getItem('gustomenu_user') || '{}');
  const token = localStorage.getItem('gustomenu_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
  
  // Store token
  if (data.token) localStorage.setItem('gustomenu_token', data.token);
  
  return data;
}

export async function register(username, password, email, role_id) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ username, password, email, role_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al registrarse');
  return data;
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeader()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener usuarios');
  return data;
}

export async function getRestaurantes() {
  const res = await fetch(`${API_URL}/restaurantes`);
  if (!res.ok) throw new Error('Error al obtener restaurantes');
  return res.json();
}

export async function getRestauranteBySlug(slug) {
  const res = await fetch(`${API_URL}/restaurantes/${slug}`);
  if (!res.ok) throw new Error('Restaurante no encontrado');
  return res.json();
}

export async function createRestaurante(restData) {
  const res = await fetch(`${API_URL}/restaurantes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(restData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear restaurante');
  return data;
}
