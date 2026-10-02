import { useEffect, useState } from 'react'
import { api } from './api/client.js'
import { getToken, getUsuarioGuardado, guardarSesion, cerrarSesion } from './api/session.js'
import Header from './components/Header.jsx'
import CategoryTabs from './components/CategoryTabs.jsx'
import ProductGrid from './components/ProductGrid.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import AuthScreen from './components/AuthScreen.jsx'
import AdminPanel from './components/AdminPanel.jsx'

export default function App() {
  const [usuario, setUsuario] = useState(getUsuarioGuardado())
  const [vista, setVista] = useState('menu') // 'menu' | 'admin'

  const [categorias, setCategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [cartItems, setCartItems] = useState([]) // [{ producto, cantidad }]
  const [cartOpen, setCartOpen] = useState(false)
  const [mediosDePago, setMediosDePago] = useState([])
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState('')

  const haySesion = Boolean(getToken() && usuario)

  // Carga inicial: categorias y medios de pago (publico, no hace falta estar logueado)
  useEffect(() => {
    if (!haySesion) return
    async function cargarDatosIniciales() {
      try {
        const [cats, medios] = await Promise.all([api.getCategorias(), api.getMediosDePago()])
        setCategorias(cats)
        setMediosDePago(medios)
        if (cats.length > 0) setCategoriaSeleccionada(cats[0].id)
      } catch (err) {
        setErrorGeneral(
          'No se pudo conectar con el servidor. Confirmá que el backend esté corriendo en ' +
            (import.meta.env.VITE_API_URL || 'http://localhost:3000')
        )
      }
    }
    cargarDatosIniciales()
  }, [haySesion])

  const recargarProductos = () => {
    if (!categoriaSeleccionada) return
    setCargandoProductos(true)
    api
      .getProductosPorCategoria(categoriaSeleccionada)
      .then(setProductos)
      .catch(() => setProductos([]))
      .finally(() => setCargandoProductos(false))
  }

  // Cada vez que cambia la categoria seleccionada, recargamos los productos
  useEffect(() => {
    recargarProductos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaSeleccionada])

  const handleAuthenticated = (token, usuarioData) => {
    guardarSesion(token, usuarioData)
    setUsuario(usuarioData)
  }

  const handleLogout = () => {
    cerrarSesion()
    setUsuario(null)
    setCartItems([])
    setPedidoConfirmado(null)
    setVista('menu')
  }

  const agregarAlCarrito = (producto, cantidad) => {
    setCartItems((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        )
      }
      return [...prev, { producto, cantidad }]
    })
    setCartOpen(true)
  }

  const quitarDelCarrito = (productoId) => {
    setCartItems((prev) => prev.filter((item) => item.producto.id !== productoId))
  }

  const confirmarPedido = async (medioDePagoId) => {
    const payload = {
      medioDePago: Number(medioDePagoId),
      items: cartItems.map((item) => ({ producto: item.producto.id, cantidad: item.cantidad })),
    }
    const pedido = await api.realizarPedido(payload)
    setPedidoConfirmado(pedido)
  }

  const empezarNuevoPedido = () => {
    setCartItems([])
    setPedidoConfirmado(null)
    setCartOpen(false)
  }

  const cantidadEnCarrito = cartItems.reduce((acc, item) => acc + item.cantidad, 0)

  if (!haySesion) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="app">
      <Header
        usuario={usuario}
        cartCount={cantidadEnCarrito}
        onOpenCart={() => setCartOpen(true)}
        onLogout={handleLogout}
        vista={vista}
        onCambiarVista={setVista}
      />

      {errorGeneral && (
        <p className="feedback error" style={{ margin: '1rem 1.5rem' }}>
          {errorGeneral}
        </p>
      )}

      <CategoryTabs
        categorias={categorias}
        selectedId={categoriaSeleccionada}
        onSelect={setCategoriaSeleccionada}
      />

      <main className="main">
        {vista === 'admin' ? (
          <AdminPanel
            categorias={categorias}
            productos={productos}
            onProductosCambiaron={recargarProductos}
          />
        ) : (
          <ProductGrid productos={productos} loading={cargandoProductos} onAdd={agregarAlCarrito} />
        )}
      </main>

      {vista === 'menu' && (
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onRemove={quitarDelCarrito}
          mediosDePago={mediosDePago}
          onConfirm={confirmarPedido}
          pedidoConfirmado={pedidoConfirmado}
          onNuevoPedido={empezarNuevoPedido}
        />
      )}
    </div>
  )
}
