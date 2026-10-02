const TOKEN_KEY = 'utneat_token'
const USUARIO_KEY = 'utneat_usuario'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsuarioGuardado() {
  const raw = localStorage.getItem(USUARIO_KEY)
  return raw ? JSON.parse(raw) : null
}

export function guardarSesion(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
}
