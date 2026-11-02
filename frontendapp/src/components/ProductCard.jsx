import { useState } from 'react'

export default function ProductCard({ producto, onAdd }) {
  const [cantidad, setCantidad] = useState(1)

  const restar = () => setCantidad((c) => Math.max(1, c - 1))
  const sumar = () => setCantidad((c) => c + 1)

  const agregar = () => {
    onAdd(producto, cantidad)
    setCantidad(1)
  }

  // --- TRUCO DE IMÁGENES DE MENTIRA ---
  // Acá enlazamos el nombre exacto del producto con una foto sacada de internet (Unsplash)
  const imagenesFalsas = {
    'Café Submarino': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=500',
    'Medialunas (x3)': 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&q=80&w=500',
    'Sánguche de Milanesa': 'https://images.unsplash.com/photo-1627308595229-7830f5c9273f?auto=format&fit=crop&q=80&w=500', 
    'Fideos con Bolognesa': 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&q=80&w=500'
  }
  
  // Si agregás un producto nuevo y no está en la lista de arriba, le pone una foto genérica
  const imagenMostrar = imagenesFalsas[producto.nombre] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500';
  // ------------------------------------

  return (
    <article className="card">
      {/* Acá insertamos la foto que definimos arriba */}
      <img src={imagenMostrar} alt={producto.nombre} className="card-image" />
      
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