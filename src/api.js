const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeader() {
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
  
  if (data.token) localStorage.setItem('gustomenu_token', data.token);
  return data;
}

export async function register(username, password, email, role_id, restaurant_name, whatsapp) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ username, password, email, role_id, restaurant_name, whatsapp }),
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

export async function updateUser(id, userData) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
  return data;
}

export async function getRestaurantes() {
  const res = await fetch(`${API_URL}/restaurantes`, {
    headers: getAuthHeader()
  });
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

export async function createFullMenu(menuData) {
  const res = await fetch(`${API_URL}/restaurantes/full`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(menuData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al guardar el menú');
  return data;
}

export async function updateRestaurante(id, restData) {
  const res = await fetch(`${API_URL}/restaurantes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(restData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar el restaurante');
  return data;
}