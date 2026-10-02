import { useState } from 'react'
import { api } from '../api/client.js'

export default function AdminPanel({ categorias, productos, onProductosCambiaron }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleCrear = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await api.crearProducto({
        nombre,
        descripcion,
        precio: Number(precio),
        categoria: Number(categoriaId),
      })
      setNombre('')
      setDescripcion('')
      setPrecio('')
      onProductosCambiaron()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    try {
      await api.eliminarProducto(id)
      onProductosCambiaron()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-panel">
      <h2 className="section-title">Administrar productos</h2>

      <form className="admin-form" onSubmit={handleCrear}>
        <div className="field">
          <label htmlFor="admin-nombre">Nombre</label>
          <input id="admin-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="admin-desc">Descripción</label>
          <input id="admin-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="admin-precio">Precio</label>
          <input
            id="admin-precio"
            type="number"
            min="0"
            step="1"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="admin-categoria">Categoría</label>
          <select
            id="admin-categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Elegí una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="feedback error">{error}</p>}

        <button className="confirm-btn" type="submit" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear producto'}
        </button>
      </form>

      <h3 className="admin-list-title">Productos de esta categoría</h3>
      {productos.length === 0 ? (
        <p className="empty-state">No hay productos cargados en esta categoría.</p>
      ) : (
        <ul className="admin-list">
          {productos.map((p) => (
            <li key={p.id} className="admin-list-item">
              <span>
                {p.nombre} — ${Number(p.precio).toFixed(0)}
              </span>
              <button className="cart-item-remove" onClick={() => handleEliminar(p.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
