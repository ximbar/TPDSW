import { useState } from 'react'

export default function ProductCard({ producto, onAdd }) {
  const [cantidad, setCantidad] = useState(1)

  const restar = () => setCantidad((c) => Math.max(1, c - 1))
  const sumar = () => setCantidad((c) => c + 1)

  const agregar = () => {
    onAdd(producto, cantidad)
    setCantidad(1)
  }

  return (
    <article className="card">
      <h3 className="card-name">{producto.nombre}</h3>
      {producto.descripcion && <p className="card-desc">{producto.descripcion}</p>}
      <div className="card-footer">
        <span className="card-price">${Number(producto.precio).toFixed(0)}</span>
        <div className="qty-control">
          <button className="qty-btn" onClick={restar} aria-label="Restar cantidad">
            −
          </button>
          <span className="qty-value">{cantidad}</span>
          <button className="qty-btn" onClick={sumar} aria-label="Sumar cantidad">
            +
          </button>
        </div>
      </div>
      <button className="add-btn" onClick={agregar}>
        Agregar
      </button>
    </article>
  )
}
