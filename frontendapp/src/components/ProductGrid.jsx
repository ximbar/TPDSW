import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ productos, loading, onAdd }) {
  if (loading) {
    return <p className="empty-state">Cargando productos...</p>
  }

  if (productos.length === 0) {
    return <p className="empty-state">No hay productos en esta categoría todavía.</p>
  }

  return (
    <div className="grid">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} onAdd={onAdd} />
      ))}
    </div>
  )
}
