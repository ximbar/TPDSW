import { useEffect, useState } from "react";
import { api } from "./api/client.js";
import {
  getToken,
  getUsuarioGuardado,
  guardarSesion,
  cerrarSesion,
} from "./api/session.js";
import Header from "./components/Header.jsx";
import CategoryTabs from "./components/CategoryTabs.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

export default function App() {
  const [usuario, setUsuario] = useState(getUsuarioGuardado());
  // Reemplazá el valor por defecto:
  const [vista, setVista] = useState(() => {
    return localStorage.getItem("vistaActual") || "menu";
  });
  // Y agregá este efecto justo abajo para guardar cada cambio de pantalla:
  useEffect(() => {
    localStorage.setItem("vistaActual", vista);
  }, [vista]);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mediosDePago, setMediosDePago] = useState([]);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState("");

  const haySesion = Boolean(getToken() && usuario);
  const recargarCategorias = async () => {
     try {
      const res = await api.getCategorias();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setCategorias(data);
    } catch (err) {
      console.error('Error al recargar categorías:', err);
    }
  };

  useEffect(() => {
    if (!haySesion) return;
    async function cargarDatosIniciales() {
      try {
        const [cats, medios] = await Promise.all([
          api.getCategorias(),
          api.getMediosDePago(),
        ]);
        setCategorias(cats);
        setMediosDePago(medios);
      } catch (err) {
        setErrorGeneral(
          "No se pudo conectar con el servidor. Confirmá que el backend esté corriendo en " +
            (import.meta.env.VITE_API_URL || "http://localhost:3000"),
        );
      }
    }
    cargarDatosIniciales();
  }, [haySesion]);

  // ACÁ ESTÁ EL ARREGLO:
  const recargarProductos = () => {
    setCargandoProductos(true);

    // Si estamos en la vista de admin, pedimos TODOS los productos (sin filtrar)
    if (vista === "admin") {
      api
        .getProductos()
        .then(setProductos)
        .catch(() => setProductos([]))
        .finally(() => setCargandoProductos(false));
    }
    // Si somos clientes y elegimos una categoría, pedimos solo esos
    else if (categoriaSeleccionada) {
      api
        .getProductosPorCategoria(categoriaSeleccionada)
        .then(setProductos)
        .catch(() => setProductos([]))
        .finally(() => setCargandoProductos(false));
    }
    // Si no somos admin y no elegimos categoría, no traemos nada
    else {
      setProductos([]);
      setCargandoProductos(false);
    }
  };

  // Ahora le avisamos al sistema que recargue si cambiamos de categoría O de vista (menú a admin)
  useEffect(() => {
    recargarProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaSeleccionada, vista]);

  const handleAuthenticated = (token, usuarioData) => {
    guardarSesion(token, usuarioData);
    setUsuario(usuarioData);
    setCategoriaSeleccionada(null);
  };

  const handleLogout = () => {
    cerrarSesion();
    setUsuario(null);
    setCartItems([]);
    setPedidoConfirmado(null);
    setVista("menu");
    setCategoriaSeleccionada(null);
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    // 1. Detectar si el producto pertenece a "Menú del Día"
    const catNombre =
      producto.categoria?.nombre ||
      categorias.find(
        (c) => c.id === (producto.categoria?.id || producto.categoriaId || producto.categoria)
      )?.nombre ||
      '';

    const esMenuDelDia = catNombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes('menu del dia');

    // 2. Verificar cuántas unidades ya tiene en el carrito
    const existente = cartItems.find((item) => item.producto.id === producto.id);
    const cantidadActual = existente ? existente.cantidad : 0;
    const nuevaCantidad = cantidadActual + cantidad;

    // 3. Regla de negocio: Máximo 1 unidad para "Menú del Día"
    if (esMenuDelDia && nuevaCantidad > 1) {
      alert('Solo se permite comprar como máximo 1 unidad del Menú del Día por pedido.');
      return;
    }

    // 4. Regla general: No exceder el stock disponible
    const stockDisponible = producto.stock !== undefined ? Number(producto.stock) : 1;
    if (nuevaCantidad > stockDisponible) {
      alert(`No hay suficiente stock disponible. Stock máximo: ${stockDisponible}`);
      return;
    }

    // 5. Actualizar el carrito
    setCartItems((prev) => {
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { producto, cantidad }];
    });

    setCartOpen(true);
  };

  const quitarDelCarrito = (productoId) => {
    setCartItems((prev) =>
      prev.filter((item) => item.producto.id !== productoId),
    );
  };

  const confirmarPedido = async (medioDePagoId) => {
    const payload = {
      medioDePago: Number(medioDePagoId),
      items: cartItems.map((item) => ({
        producto: item.producto.id,
        cantidad: item.cantidad,
      })),
    };
    const pedido = await api.realizarPedido(payload);
    setPedidoConfirmado(pedido);
  };

  const empezarNuevoPedido = () => {
    setCartItems([]);
    setPedidoConfirmado(null);
    setCartOpen(false);
  };

  const cantidadEnCarrito = cartItems.reduce(
    (acc, item) => acc + item.cantidad,
    0,
  );

  if (!haySesion) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
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
        <p className="feedback error" style={{ margin: "1rem 1.5rem" }}>
          {errorGeneral}
        </p>
      )}

      <main className="main">
        {vista === "admin" ? (
          <AdminPanel
            categorias={categorias}
            productos={productos}
            onProductosCambiaron={recargarProductos}
            onCategoriasCambiaron={recargarCategorias}
          />
        ) : categoriaSeleccionada === null ? (
          <div className="selector-categorias">
            <h2
              style={{
                textAlign: "center",
                marginBottom: "2rem",
                fontSize: "2rem",
              }}
            >
              ¿Qué tenés ganas de comer?
            </h2>
            <div className="botones-grandes">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  className="btn-categoria-gigante"
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              className="btn-volver"
              onClick={() => setCategoriaSeleccionada(null)}
            >
              ← Volver a elegir turno
            </button>
            <ProductGrid
              productos={productos}
              loading={cargandoProductos}
              onAdd={agregarAlCarrito}
            />
          </div>
        )}
      </main>

      {vista === "menu" && (
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
  );
}
