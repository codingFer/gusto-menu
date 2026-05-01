const API_URL = import.meta.env.VITE_API_URL;

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
  return data;
}

export async function register(username, password, email) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al registrarse');
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
