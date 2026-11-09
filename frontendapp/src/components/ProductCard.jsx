import { useState } from 'react';

export default function ProductCard({ producto, onAdd }) {
  const [cantidad, setCantidad] = useState(1);

  const restar = () => setCantidad((c) => Math.max(1, c - 1));
  const sumar = () => setCantidad((c) => c + 1);

  const agregar = () => {
    onAdd(producto, cantidad);
    setCantidad(1);
  };

  const fotoFallback =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';

  // Prioriza la URL guardada en la base de datos
  const imagenUrl =
    producto.imagen && producto.imagen.trim() !== ''
      ? producto.imagen
      : fotoFallback;

  return (
    <article className="card">
      <img
        src={imagenUrl}
        alt={producto.nombre}
        className="card-image"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fotoFallback;
        }}
      />

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
  );
}