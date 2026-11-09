export default function Header({ usuario, cartCount, onOpenCart, onLogout, vista, onCambiarVista }) {
  const esAdmin = usuario?.rol === 'ADMINISTRADOR'

  return (
    <header className="header">
      {/* Hacemos que el logo también sirva para volver al menú principal */}
      <p className="logo" style={{ cursor: 'pointer' }} onClick={() => onCambiarVista('menu')}>
        UTN <span>Eat</span>
      </p>

      <div className="header-right">
        {esAdmin && (
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${vista === 'menu' || vista === 'misPedidos' ? 'active' : ''}`}
              onClick={() => onCambiarVista('menu')}
            >
              Menú
            </button>
            <button
              className={`view-toggle-btn ${vista === 'admin' ? 'active' : ''}`}
              onClick={() => onCambiarVista('admin')}
            >
              Administrar
            </button>
          </div>
        )}

        <span className="header-user">Hola, {usuario?.nombre}</span>

        {/* NUEVO BOTÓN: MIS PEDIDOS (Solo se muestra si no estamos en el panel de admin) */}
        {vista !== 'admin' && (
          <button 
            onClick={() => onCambiarVista(vista === 'misPedidos' ? 'menu' : 'misPedidos')}
            style={{
              background: vista === 'misPedidos' ? '#eab308' : 'transparent',
              color: vista === 'misPedidos' ? '#000' : '#eab308',
              border: '1px solid #eab308',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '0.5rem'
            }}
          >
            {vista === 'misPedidos' ? '← Volver al Menú' : '📦 Mis Pedidos'}
          </button>
        )}

        {/* Carrito de compras (solo se muestra cuando estamos eligiendo comida) */}
        {vista === 'menu' && (
          <button className="cart-button" onClick={onOpenCart}>
            Tu pedido
            <span className="cart-count">{cartCount}</span>
          </button>
        )}

        <button className="logout-btn" onClick={onLogout}>
          Salir
        </button>
      </div>
    </header>
  )
}