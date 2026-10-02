export default function CategoryTabs({ categorias, selectedId, onSelect }) {
  if (categorias.length === 0) return null

  return (
    <nav className="tabs">
      {categorias.map((categoria) => (
        <button
          key={categoria.id}
          className={`tab ${categoria.id === selectedId ? 'active' : ''}`}
          onClick={() => onSelect(categoria.id)}
        >
          {categoria.nombre}
        </button>
      ))}
    </nav>
  )
}
