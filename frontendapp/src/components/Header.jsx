export default function Header({ usuario, cartCount, onOpenCart, onLogout, vista, onCambiarVista }) {
  const esAdmin = usuario?.rol === 'ADMINISTRADOR'

  return (
    <header className="header">
      <p className="logo">
        UTN <span>Eat</span>
      </p>

      <div className="header-right">
        {esAdmin && (
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${vista === 'menu' ? 'active' : ''}`}
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
