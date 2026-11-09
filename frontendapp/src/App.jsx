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
import { AdminMediosPago } from "./components/AdminMediosPago.jsx";
import MisPedidos from "./components/MisPedidos.jsx";

export default function App() {
  const [usuario, setUsuario] = useState(getUsuarioGuardado());
  const [vista, setVista] = useState(() => {
    return localStorage.getItem("vistaActual") || "menu";
  });

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
  const [cartas, setCartas] = useState([]);

  // Apartado Mis Pedidos del cliente
  const [mostrarMisPedidos, setMostrarMisPedidos] = useState(false);
  const [misPedidos, setMisPedidos] = useState([]);
  const [cargandoMisPedidos, setCargandoMisPedidos] = useState(false);

  const haySesion = Boolean(getToken() && usuario);

  const getEstadoVigencia = (fecha) => {
    if (!fecha) {
      return { tipo: 'vigente', texto: 'Vigente', color: '#86efac', fondo: '#14532d', borde: '#15803d', esHoy: true };
    }

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const fechaCartaStr = fecha.split('T')[0];

    if (fechaCartaStr < hoyStr) {
      return { tipo: 'vencido', texto: 'Perdió vigencia', color: '#fca5a5', fondo: '#7f1d1d', borde: '#991b1b', esHoy: false };
    } else if (fechaCartaStr === hoyStr) {
      return { tipo: 'vigente', texto: 'En vigencia hoy', color: '#86efac', fondo: '#14532d', borde: '#15803d', esHoy: true };
    } else {
      return { tipo: 'proxima', texto: 'Próxima a regir', color: '#fef08a', fondo: '#78350f', borde: '#d97706', esHoy: false };
    }
  };

  const recargarCategorias = async () => {
    try {
      const res = await api.getCategorias();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setCategorias(data);
    } catch (err) {
      console.error('Error al recargar categorías:', err);
    }
  };

  const recargarCartas = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/cartas");
      const data = await res.json();
      setCartas(data.data || []);
    } catch (err) {
      console.error("Error al recargar cartas:", err);
    }
  };

  const cargarMisPedidos = async () => {
    setCargandoMisPedidos(true);
    try {
      const res = await api.getMisPedidos();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setMisPedidos(data);
    } catch (err) {
      console.error("Error al cargar mis pedidos:", err);
    } finally {
      setCargandoMisPedidos(false);
    }
  };

  const abrirMisPedidos = () => {
    cargarMisPedidos();
    setMostrarMisPedidos(true);
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
        recargarCartas();
      } catch (err) {
        setErrorGeneral(
          "No se pudo conectar con el servidor. Confirmá que el backend esté corriendo en " +
            (import.meta.env.VITE_API_URL || "http://localhost:3000"),
        );
      }
    }
    cargarDatosIniciales();
  }, [haySesion]);

  const recargarProductos = () => {
    setCargandoProductos(true);

    if (vista === "admin") {
      api
        .getProductos()
        .then(setProductos)
        .catch(() => setProductos([]))
        .finally(() => setCargandoProductos(false));
    } else if (categoriaSeleccionada) {
      api
        .getProductosPorCategoria(categoriaSeleccionada)
        .then(setProductos)
        .catch(() => setProductos([]))
        .finally(() => setCargandoProductos(false));
    } else {
      setProductos([]);
      setCargandoProductos(false);
    }
  };

  const recargarMediosDePago = () => {
    api.getMediosDePago()
      .then(setMediosDePago)
      .catch(err => console.error("Error recargando medios de pago:", err));
  };
  
  useEffect(() => {
    recargarProductos();
    if (vista === "menu") {
      recargarCartas();
    }
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
    setMostrarMisPedidos(false);
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
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

    const existente = cartItems.find((item) => item.producto.id === producto.id);
    const cantidadActual = existente ? existente.cantidad : 0;
    const nuevaCantidad = cantidadActual + cantidad;

    if (esMenuDelDia && nuevaCantidad > 1) {
      alert('Solo se permite comprar como máximo 1 unidad del Menú del Día por pedido.');
      return;
    }

    const stockDisponible = producto.stock !== undefined ? Number(producto.stock) : 1;
    if (nuevaCantidad > stockDisponible) {
      alert(`No hay suficiente stock disponible. Stock máximo: ${stockDisponible}`);
      return;
    }

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

  const encargarCarta = (carta) => {
    const estado = getEstadoVigencia(carta.fecha_vigencia);

    if (!estado.esHoy) {
      alert(
        estado.tipo === 'proxima'
          ? 'Esta promoción aún no está disponible para hoy.'
          : 'Esta promoción ya no se encuentra en vigencia.'
      );
      return;
    }

    if (!carta.productos || carta.productos.length === 0) {
      alert("Esta promoción no contiene productos disponibles.");
      return;
    }

    const yaTienePromo = cartItems.some((item) =>
      item.esPromo && item.promoId === carta.id
    );

    if (yaTienePromo) {
      alert("Solo se permite pedir 1 unidad de esta promoción por alumno.");
      return;
    }

    for (const prod of carta.productos) {
      const stockDisp = prod.stock !== undefined ? Number(prod.stock) : 1;
      const enCarrito = cartItems.find((it) => it.producto.id === prod.id)?.cantidad || 0;
      if (enCarrito + 1 > stockDisp) {
        alert(`No hay stock suficiente para el producto: ${prod.nombre}`);
        return;
      }
    }

    const descuentoPorc = Number(carta.descuento) || 0;
    const factorPrecio = (100 - descuentoPorc) / 100;

    setCartItems((prev) => {
      let nuevoCarrito = [...prev];
      for (const prod of carta.productos) {
        const precioConDescuento = Math.round(Number(prod.precio) * factorPrecio);
        const productoModificado = {
          ...prod,
          precio: precioConDescuento,
          precioOriginal: Number(prod.precio),
        };

        const index = nuevoCarrito.findIndex((it) => it.producto.id === prod.id);
        if (index >= 0) {
          nuevoCarrito[index] = {
            ...nuevoCarrito[index],
            producto: productoModificado,
            cantidad: nuevoCarrito[index].cantidad + 1,
            esPromo: true,
            promoId: carta.id,
            promoNombre: carta.nombre,
          };
        } else {
          nuevoCarrito.push({
            producto: productoModificado,
            cantidad: 1,
            esPromo: true,
            promoId: carta.id,
            promoNombre: carta.nombre,
          });
        }
      }
      return nuevoCarrito;
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
        precioUnitario: Number(item.producto.precio), // Envía el precio con descuento
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
        onAbrirMisPedidos={abrirMisPedidos}
      />

      {errorGeneral && (
        <p className="feedback error" style={{ margin: "1rem 1.5rem" }}>
          {errorGeneral}
        </p>
      )}

      {/* BOTÓN RÁPIDO A MIS PEDIDOS */}
      <div style={{ maxWidth: '1200px', margin: '0.8rem auto 0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={abrirMisPedidos}
          style={{
            background: '#1e3a8a',
            color: '#93c5fd',
            border: '1px solid #3b82f6',
            padding: '0.45rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          📦 Mis Pedidos y Estados
        </button>
      </div>

      <main className="main">
        {vista === "admin" ? (
          <AdminPanel
            categorias={categorias}
            productos={productos}
            onProductosCambiaron={recargarProductos}
            onCategoriasCambiaron={recargarCategorias}
            onMediosPagoCambiaron={recargarMediosDePago}
          />
        ) : vista === "misPedidos" ? (
          <MisPedidos />
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

            {/* SECCIÓN CARTAS / PROMOS */}
            {cartas.length > 0 && (
              <div style={{ marginTop: "3rem", width: "100%", maxWidth: "900px", margin: "3rem auto 0 auto" }}>
                <h3 style={{ fontSize: "1.5rem", color: "#f59e0b", textAlign: "center", marginBottom: "1.2rem" }}>
                  ⭐ Menús del Día y Promociones Especiales
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {cartas.map((c) => {
                    const estado = getEstadoVigencia(c.fecha_vigencia);
                    const subtotal = c.productos?.reduce((acc, p) => acc + Number(p.precio || 0), 0) || 0;
                    const descuentoPorc = Number(c.descuento) || 0;
                    const totalFinal = Math.round(subtotal * ((100 - descuentoPorc) / 100));

                    return (
                      <div
                        key={c.id}
                        style={{
                          background: "#1f2937",
                          border: `1px solid ${estado.borde}`,
                          opacity: estado.esHoy ? 1 : 0.8,
                          borderRadius: "8px",
                          padding: "1.2rem",
                          color: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                            <h4 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#38bdf8", marginBottom: "0.4rem" }}>
                              {c.nombre}
                            </h4>
                            <span style={{
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              padding: "3px 7px",
                              borderRadius: "4px",
                              background: estado.fondo,
                              color: estado.color,
                              whiteSpace: "nowrap"
                            }}>
                              {estado.texto}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                            <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0 }}>
                              Vigencia: {c.fecha_vigencia ? c.fecha_vigencia.split("T")[0] : "Disponible"}
                            </p>
                            {descuentoPorc > 0 && (
                              <span style={{ fontSize: "0.75rem", fontWeight: "bold", background: "#b45309", color: "#fef3c7", padding: "1px 6px", borderRadius: "4px" }}>
                                {descuentoPorc}% OFF
                              </span>
                            )}
                          </div>

                          <strong style={{ fontSize: "0.85rem", color: "#d1d5db" }}>Incluye:</strong>
                          <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#e5e7eb" }}>
                            {c.productos && c.productos.length > 0 ? (
                              c.productos.map((p) => (
                                <li key={p.id}>
                                  {p.nombre} (${Number(p.precio).toFixed(0)})
                                </li>
                              ))
                            ) : (
                              <li style={{ color: "#9ca3af" }}>Sin productos especificados</li>
                            )}
                          </ul>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.8rem", borderTop: "1px solid #374151", paddingTop: "0.6rem" }}>
                            <span style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Total Combo:</span>
                            <div style={{ textAlign: "right" }}>
                              {descuentoPorc > 0 && (
                                <span style={{ fontSize: "0.9rem", color: "#9ca3af", textDecoration: "line-through", marginRight: "0.5rem" }}>
                                  ${subtotal.toFixed(0)}
                                </span>
                              )}
                              <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#22c55e" }}>
                                ${totalFinal.toFixed(0)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!estado.esHoy}
                            onClick={() => encargarCarta(c)}
                            style={{
                              width: "100%",
                              background: estado.esHoy ? "#2f4f2f" : "#374151",
                              color: estado.esHoy ? "#fff" : "#9ca3af",
                              border: "none",
                              padding: "0.6rem 1rem",
                              borderRadius: "6px",
                              fontWeight: "600",
                              cursor: estado.esHoy ? "pointer" : "not-allowed"
                            }}
                          >
                            {estado.esHoy 
                              ? "Pedir Menú / Promo (Máx. 1)" 
                              : (estado.tipo === 'proxima' ? "Disponible a partir de su vigencia" : "Promoción fuera de vigencia")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <button
              className="btn-volver"
              onClick={() => setCategoriaSeleccionada(null)}
            >
              ← Atrás
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

      {/* MODAL HISTORIAL DE PEDIDOS CON DESGLOSE DE PROMOS Y PRECIOS TACHADOS */}
      {mostrarMisPedidos && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}>
          <div style={{
            background: "#1e293b",
            padding: "2rem",
            borderRadius: "12px",
            maxWidth: "650px",
            width: "92%",
            maxHeight: "85vh",
            overflowY: "auto",
            border: "1px solid #334155",
            color: "#fff",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, color: "#f59e0b", fontSize: "1.4rem", fontWeight: "bold" }}>
                📦 Mis Pedidos Realizados
              </h3>
              <button
                type="button"
                onClick={() => setMostrarMisPedidos(false)}
                style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontWeight: "bold" }}
              >
                ✕ Cerrar
              </button>
            </div>

            {cargandoMisPedidos ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "1.5rem 0" }}>Cargando pedidos...</p>
            ) : misPedidos.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>
                Todavía no realizaste ningún pedido.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {misPedidos.map((ped) => {
                  const est = String(ped.estado || "PENDIENTE").toUpperCase();
                  const badge = {
                    LISTO_PARA_RETIRAR: { bg: "#854d0e", text: "#fef08a", label: "¡Listo para retirar!" },
                    ENTREGADO: { bg: "#14532d", text: "#86efac", label: "Entregado" },
                    CANCELADO: { bg: "#7f1d1d", text: "#fca5a5", label: "Cancelado" },
                    PENDIENTE: { bg: "#1e3a8a", text: "#93c5fd", label: "Pendiente en cocina" },
                  }[est] || { bg: "#1e3a8a", text: "#93c5fd", label: ped.estado };

                  return (
                    <div key={ped.id} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                        <span style={{ fontWeight: "bold", fontSize: "1.05rem", color: "#38bdf8" }}>
                          Pedido #{ped.id}
                        </span>
                        <span style={{
                          padding: "3px 10px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold",
                          background: badge.bg, color: badge.text
                        }}>
                          {badge.label}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "#94a3b8", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "0.6rem" }}>
                        Fecha: {new Date(ped.fecha).toLocaleString("es-AR")}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.8rem" }}>
                        {(ped.detalles || ped.items || []).map((det, i) => {
                          const cant = Number(det.cantidad) || 1;
                          const precioCobradoU = Number(det.precioUnitario ?? det.producto?.precio ?? 0);
                          const precioBaseU = Number(det.producto?.precio || precioCobradoU);
                          const esPromo = precioBaseU > precioCobradoU && precioCobradoU > 0;
                          const porcentajeDesc = esPromo ? Math.round(((precioBaseU - precioCobradoU) / precioBaseU) * 100) : 0;
                          const subtotal = precioCobradoU * cant;

                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem", borderBottom: "1px dashed #1e293b", paddingBottom: "0.3rem" }}>
                              <div>
                                <span style={{ fontWeight: "500" }}>{det.producto?.nombre || det.nombre} (x{cant})</span>
                                {esPromo && (
                                  <span style={{ marginLeft: "8px", background: "#b45309", color: "#fef3c7", fontSize: "0.75rem", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px" }}>
                                    🏷️ Promo {porcentajeDesc}% OFF
                                  </span>
                                )}
                              </div>
                              <div>
                                {esPromo && (
                                  <span style={{ color: "#94a3b8", textDecoration: "line-through", marginRight: "8px", fontSize: "0.85rem" }}>
                                    ${(precioBaseU * cant).toFixed(0)}
                                  </span>
                                )}
                                <span style={{ color: "#22c55e", fontWeight: "bold" }}>
                                  ${subtotal.toFixed(0)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", fontWeight: "bold", fontSize: "1.15rem", color: "#22c55e", borderTop: "1px solid #1e293b", paddingTop: "0.5rem" }}>
                        Total abonado: ${Number(ped.total).toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
