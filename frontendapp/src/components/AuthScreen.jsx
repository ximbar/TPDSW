import { useState } from 'react'
import { api } from '../api/client.js'

export default function AuthScreen({ onAuthenticated }) {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const data =
        modo === 'login'
          ? await api.login({ email, password })
          : await api.register({ nombre, email, password })
      onAuthenticated(data.token, data.usuario)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="logo" style={{ marginBottom: '0.3rem' }}>
          UTN <span>Eat</span>
        </p>
        <h1 className="auth-title">{modo === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</h1>

        {modo === 'registro' && (
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </div>

        {error && <p className="feedback error">{error}</p>}

        <button className="confirm-btn" type="submit" disabled={enviando}>
          {enviando ? 'Un momento...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setError('')
            setModo(modo === 'login' ? 'registro' : 'login')
          }}
        >
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </form>
    </div>
  )
}
