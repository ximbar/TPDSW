import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ productos, loading, onAdd }) {
  if (loading) {
    return <p className="empty-state">Cargando productos...</p>
  }

  if (productos.length === 0) {
    return <div className="pantalla-vacia">
              <h2>🍽️ Ups...</h2>
              <p>Aún no hay stock disponible.</p>
            </div>
  }

  return (
    <div className="grid">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} onAdd={onAdd} />
      ))}
    </div>
  )
}
