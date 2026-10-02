import { getToken } from './session.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message || `Error ${res.status}`)
  }
  return body.data
}

export const api = {
  // auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  // menu (lectura publica)
  getCategorias: () => request('/api/categorias'),
  getProductosPorCategoria: (categoriaId) => request(`/api/productos?categoria=${categoriaId}`),
  getMediosDePago: () => request('/api/mediosDePago'),

  // administracion de productos (requiere admin, el token ya va solo)
  crearProducto: (payload) => request('/api/productos', { method: 'POST', body: JSON.stringify(payload) }),
  eliminarProducto: (id) => request(`/api/productos/${id}`, { method: 'DELETE' }),

  // pedidos (requiere estar logueado)
  realizarPedido: (payload) => request('/api/pedidos', { method: 'POST', body: JSON.stringify(payload) }),
  getMisPedidos: () => request('/api/pedidos/mios'),
}
