import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { CategoriasAdmin } from './CategoriasAdmin.jsx';
import { AdminMediosPago } from './AdminMediosPago.jsx';
import CartasAdmin from './CartasAdmin.jsx';

export default function AdminPanel({
  categorias,
  productos,
  onProductosCambiaron,
  onCategoriasCambiaron,
  onMediosPagoCambiaron,
}) {
  const [tabActiva, setTabActiva] = useState(() => {
    return localStorage.getItem('admin_tab_activa') || 'productos';
  });

  useEffect(() => {
    localStorage.setItem('admin_tab_activa', tabActiva);
  }, [tabActiva]);

  // Estados del CRUD de Producto
  const [stock, setStock] = useState('1');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagenesEncontradas, setImagenesEncontradas] = useState([]);
  const [buscandoImagen, setBuscandoImagen] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  // Filtros del CRUD
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Requerimiento 1: Listado de productos + Detalle
  const [filtroCatListado, setFiltroCatListado] = useState('');
  const [productoSeleccionadoDetalle, setProductoSeleccionadoDetalle] = useState(null);

  // Requerimiento 2: Listado de pedidos + Detalle
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState('');
  const [pedidoSeleccionadoDetalle, setPedidoSeleccionadoDetalle] = useState(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  const cargarPedidos = async () => {
    setCargandoPedidos(true);
    try {
      const res = await api.getPedidos();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      setCargandoPedidos(false);
    }
  };

  useEffect(() => {
    if (tabActiva === 'listadoPedidos') {
      cargarPedidos();
    }
  }, [tabActiva]);

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoriaId('');
    setStock('1');
    setImagenUrl('');
    setImagenesEncontradas([]);
    setProductoEnEdicion(null);
    setError('');
  };

  // Búsqueda de imágenes en la web
  const handleBuscarImagenWeb = async () => {
    if (!nombre.trim()) {
      alert('Ingresá el nombre del producto primero (ej: "Sánguche de milanesa").');
      return;
    }

    setBuscandoImagen(true);
    setImagenesEncontradas([]);
    try {
      const res = await fetch(
        `http://localhost:3000/api/productos/buscar-imagen?q=${encodeURIComponent(nombre.trim())}`
      );
      const json = await res.json();
      const lista = json.data || [];

      if (lista.length === 0) {
        alert('No se encontraron imágenes en la web para ese término. Probá ingresando una URL directa.');
      } else {
        setImagenesEncontradas(lista);
        setImagenUrl(lista[0]);
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar con el servidor para buscar imágenes.');
    } finally {
      setBuscandoImagen(false);
    }
  };

  // Carga desde archivo local
  const handleCargarArchivoLocal = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenUrl(reader.result);
        setImagenesEncontradas([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const precioCorregido = String(precio).replace(',', '.');

      const datosProducto = {
        nombre,
        descripcion,
        precio: precioCorregido,
        categoria: Number(categoriaId),
        stock: stock !== '' ? Number(stock) : 1,
        imagen: imagenUrl || undefined,
      };

      if (productoEnEdicion) {
        await api.actualizarProducto(productoEnEdicion.id, datosProducto);
      } else {
        await api.crearProducto(datosProducto);
      }

      limpiarFormulario();
      onProductosCambiaron();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleEditar = (producto) => {
    setProductoEnEdicion(producto);
    setNombre(producto.nombre || '');
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio || '');
    const catId = producto.categoria?.id || producto.categoria || producto.categoria_id;
    setCategoriaId(catId);
    setStock(producto.stock !== undefined ? producto.stock : 1);
    setImagenUrl(producto.imagen || '');
    setImagenesEncontradas([]);
    setTabActiva('productos');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este producto?')) return;
    try {
      await api.eliminarProducto(id);
      if (productoEnEdicion && productoEnEdicion.id === id) {
        limpiarFormulario();
      }
      onProductosCambiaron();
    } catch (err) {
      setError(err.message);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = filtroCategoria
      ? String(p.categoria?.id || p.categoria || p.categoria_id) === String(filtroCategoria)
      : true;
    const nombreSeguro = p.nombre ? String(p.nombre).toLowerCase() : '';
    const busquedaSegura = busqueda ? busqueda.toLowerCase().trim() : '';
    return coincideCategoria && nombreSeguro.includes(busquedaSegura);
  });

  const productosListadoFiltrados = productos.filter((p) => {
    if (!filtroCatListado) return true;
    return String(p.categoria?.id || p.categoria || p.categoria_id) === String(filtroCatListado);
  });

  const pedidosFiltrados = pedidos.filter((ped) => {
    if (!filtroEstadoPedido) return true;
    return String(ped.estado || '').toUpperCase() === String(filtroEstadoPedido).toUpperCase();
  });

  return (
    <div className="contenedor-admin">
      {/* BOTONES DE PESTAÑAS */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setTabActiva('productos')}
          style={{
            padding: '0.6rem 1.2rem',
            background: tabActiva === 'productos' ? '#2f4f2f' : '#e5e7eb',
            color: tabActiva === 'productos' ? '#ffffff' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Gestión de Productos
        </button>
        <button
          type="button"
          onClick={() => setTabActiva('categorias')}
          style={{
            padding: '0.6rem 1.2rem',
            background: tabActiva === 'categorias' ? '#2f4f2f' : '#e5e7eb',
            color: tabActiva === 'categorias' ? '#ffffff' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Gestión de Categorías
        </button>
        <button
          type="button"
          onClick={() => setTabActiva('mediosPago')}
          style={{
            padding: '0.6rem 1.2rem',
            background: tabActiva === 'mediosPago' ? '#2f4f2f' : '#e5e7eb',
            color: tabActiva === 'mediosPago' ? '#ffffff' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Gestión de Medios de Pago
        </button>
        <button
          type="button"
          onClick={() => setTabActiva('cartas')}
          style={{
            padding: '0.6rem 1.2rem',
            background: tabActiva === 'cartas' ? '#2f4f2f' : '#e5e7eb',
            color: tabActiva === 'cartas' ? '#ffffff' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Gestión de Cartas
        </button>

        {/* PESTAÑA REQUERIMIENTO 1 */}
        <button
          type="button"
          onClick={() => setTabActiva('listadoProductos')}
          style={{
            padding: '0.6rem 1.2rem',
            background: tabActiva === 'listadoProductos' ? '#2f4f2f' : '#e5e7eb',
            color: tabActiva === 'listadoProductos' ? '#ffffff' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📋 Listado Productos (Detalle)
        </button>

        {/* PESTAÑA REQUERIMIENTO 2 */}
        <button
          type="button"
          onClick={() => setTabActiva('listadoPedidos')}
          style={{
            padding: '0.6rem 1.2rem',
            background: tabActiva === 'listadoPedidos' ? '#2f4f2f' : '#e5e7eb',
            color: tabActiva === 'listadoPedidos' ? '#ffffff' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📦 Listado Pedidos (Detalle)
        </button>
      </div>

      {/* RENDERIZADO DE PESTAÑAS */}
      {tabActiva === 'categorias' && (
        <CategoriasAdmin onCategoriasCambiaron={onCategoriasCambiaron} />
      )}

      {tabActiva === 'mediosPago' && (
        <AdminMediosPago onMedioPagosCambiaron={onMediosPagoCambiaron} />
      )}

      {tabActiva === 'cartas' && <CartasAdmin />}

      {/* REQUERIMIENTO 1: Listado de productos filtrado por categoría + Detalle */}
      {tabActiva === 'listadoProductos' && (
        <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '8px', color: '#fff' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#38bdf8' }}>
            1. Listado de Productos por Categoría
          </h2>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontWeight: '600' }}>Filtrar por Categoría:</label>
            <select
              value={filtroCatListado}
              onChange={(e) => setFiltroCatListado(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', background: '#111827', color: '#fff', border: '1px solid #374151' }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '2px solid #374151' }}>
                <th style={{ padding: '0.8rem' }}>Nombre</th>
                <th style={{ padding: '0.8rem' }}>Precio</th>
                <th style={{ padding: '0.8rem' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosListadoFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>
                    No hay productos para esta categoría.
                  </td>
                </tr>
              ) : (
                productosListadoFiltrados.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '0.8rem', fontWeight: '500' }}>{p.nombre}</td>
                    <td style={{ padding: '0.8rem', color: '#22c55e', fontWeight: 'bold' }}>
                      ${Number(p.precio).toFixed(0)}
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <button
                        type="button"
                        onClick={() => setProductoSeleccionadoDetalle(p)}
                        style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Ver Detalle Completo
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {productoSeleccionadoDetalle && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%', border: '1px solid #374151', color: '#fff' }}>
                <h3 style={{ fontSize: '1.4rem', color: '#38bdf8', marginBottom: '1rem' }}>
                  Detalle del Producto: {productoSeleccionadoDetalle.nombre}
                </h3>
                {productoSeleccionadoDetalle.imagen && (
                  <img
                    src={productoSeleccionadoDetalle.imagen}
                    alt={productoSeleccionadoDetalle.nombre}
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '1rem' }}
                  />
                )}
                <p style={{ margin: '0.5rem 0' }}><strong>Descripción completa:</strong></p>
                <p style={{ color: '#d1d5db', background: '#111827', padding: '0.8rem', borderRadius: '6px', minHeight: '60px' }}>
                  {productoSeleccionadoDetalle.descripcion || 'Sin descripción detallada disponible.'}
                </p>
                <p style={{ marginTop: '0.8rem' }}><strong>Precio:</strong> ${Number(productoSeleccionadoDetalle.precio).toFixed(0)}</p>
                <p><strong>Stock disponible:</strong> {productoSeleccionadoDetalle.stock ?? 1}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const prod = productoSeleccionadoDetalle;
                      setProductoSeleccionadoDetalle(null);
                      handleEditar(prod);
                    }}
                    style={{ background: '#16a34a', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✏️ Ir a editar al CRUD de Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductoSeleccionadoDetalle(null)}
                    style={{ background: '#4b5563', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REQUERIMIENTO 2: Listado de pedidos filtrado por estado + Detalle + Cambio de Estado */}
      {tabActiva === 'listadoPedidos' && (
        <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '8px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>
              📦 Listado y Gestión de Pedidos
            </h2>
            <button
              type="button"
              onClick={cargarPedidos}
              style={{ background: '#374151', color: '#fff', border: '1px solid #4b5563', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🔄 Refrescar pedidos
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: '600' }}>Filtrar por Estado:</label>
            <select
              value={filtroEstadoPedido}
              onChange={(e) => setFiltroEstadoPedido(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', background: '#111827', color: '#fff', border: '1px solid #374151' }}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="LISTO_PARA_RETIRAR">Listo para retirar</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {cargandoPedidos ? (
            <p style={{ color: '#9ca3af' }}>Cargando pedidos...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#111827', borderBottom: '2px solid #374151' }}>
                    <th style={{ padding: '0.8rem' }}>Nro</th>
                    <th style={{ padding: '0.8rem' }}>Alumno / Usuario</th>
                    <th style={{ padding: '0.8rem' }}>Estado</th>
                    <th style={{ padding: '0.8rem' }}>Cambiar Estado</th>
                    <th style={{ padding: '0.8rem' }}>Total</th>
                    <th style={{ padding: '0.8rem' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>
                        No se encontraron pedidos con el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    pedidosFiltrados.map((ped) => {
                      const estActual = String(ped.estado || 'PENDIENTE').toUpperCase();

                      const estadoBadge = () => {
                        if (estActual === 'LISTO_PARA_RETIRAR') return { bg: '#854d0e', text: '#fef08a', label: 'Listo para retirar' };
                        if (estActual === 'ENTREGADO') return { bg: '#14532d', text: '#86efac', label: 'Entregado' };
                        if (estActual === 'CANCELADO') return { bg: '#7f1d1d', text: '#fca5a5', label: 'Cancelado' };
                        return { bg: '#1e3a8a', text: '#93c5fd', label: 'Pendiente' };
                      };
                      const badge = estadoBadge();

                      const handleActualizarEstado = async (nuevoEstado) => {
                        try {
                          await api.cambiarEstadoPedido(ped.id, nuevoEstado);
                          await cargarPedidos();
                          if (pedidoSeleccionadoDetalle && pedidoSeleccionadoDetalle.id === ped.id) {
                            setPedidoSeleccionadoDetalle((prev) => ({ ...prev, estado: nuevoEstado }));
                          }
                        } catch (err) {
                          alert('Error al actualizar estado: ' + err.message);
                        }
                      };

                      return (
                        <tr key={ped.id} style={{ borderBottom: '1px solid #374151' }}>
                          <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>#{ped.id}</td>
                          <td style={{ padding: '0.8rem' }}>
                            {ped.usuario?.nombre || ped.usuario?.email || ped.alumno || 'Alumno registrado'}
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <span style={{
                              padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                              background: badge.bg, color: badge.text
                            }}>
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <select
                              value={estActual}
                              onChange={(e) => handleActualizarEstado(e.target.value)}
                              style={{
                                background: '#111827',
                                color: '#fff',
                                border: '1px solid #4b5563',
                                padding: '0.3rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="PENDIENTE">Pendiente</option>
                              <option value="LISTO_PARA_RETIRAR">Listo para retirar</option>
                              <option value="ENTREGADO">Entregado</option>
                              <option value="CANCELADO">Cancelado</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.8rem', color: '#22c55e', fontWeight: 'bold' }}>
                            ${Number(ped.total || 0).toFixed(0)}
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <button
                              type="button"
                              onClick={() => setPedidoSeleccionadoDetalle(ped)}
                              style={{ background: '#d97706', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* MODAL DETALLE CON ETIQUETAS DE PROMO Y PRECIO TACHADO */}
          {pedidoSeleccionadoDetalle && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', maxWidth: '580px', width: '90%', border: '1px solid #334155', color: '#fff' }}>
                <h3 style={{ fontSize: '1.4rem', color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Detalle del Pedido #{pedidoSeleccionadoDetalle.id}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', color: '#cbd5e1', fontSize: '0.95rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>Alumno: <strong style={{ color: '#fff' }}>{pedidoSeleccionadoDetalle.usuario?.nombre || 'Alumno'}</strong></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Estado:</span>
                    <select
                      value={String(pedidoSeleccionadoDetalle.estado || 'PENDIENTE').toUpperCase()}
                      onChange={async (e) => {
                        const nuevo = e.target.value;
                        try {
                          await api.cambiarEstadoPedido(pedidoSeleccionadoDetalle.id, nuevo);
                          setPedidoSeleccionadoDetalle((prev) => ({ ...prev, estado: nuevo }));
                          cargarPedidos();
                        } catch (err) {
                          alert('Error: ' + err.message);
                        }
                      }}
                      style={{ background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.85rem' }}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="LISTO_PARA_RETIRAR">Listo para retirar</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.6rem', color: '#38bdf8' }}>
                  Productos seleccionados:
                </h4>
                
                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', maxHeight: '240px', overflowY: 'auto', border: '1px solid #1e293b' }}>
                  {(() => {
                    const items = pedidoSeleccionadoDetalle.detalles || pedidoSeleccionadoDetalle.items || [];
                    if (items.length === 0) {
                      return <p style={{ color: '#94a3b8', margin: 0 }}>No hay ítems registrados.</p>;
                    }
                    return items.map((item, idx) => {
                      const nombreProd = item.producto?.nombre || item.nombre || `Producto #${item.productoId || idx + 1}`;
                      const cant = Number(item.cantidad) || 1;
                      const precioCobradoU = Number(item.precioUnitario ?? item.producto?.precio ?? 0);
                      const precioBaseU = Number(item.producto?.precio || precioCobradoU);
                      const esPromo = precioBaseU > precioCobradoU && precioCobradoU > 0;
                      const porcentajeDesc = esPromo ? Math.round(((precioBaseU - precioCobradoU) / precioBaseU) * 100) : 0;
                      const subtotal = precioCobradoU * cant;

                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #1e293b' }}>
                          <div>
                            <span style={{ fontWeight: '500' }}>{nombreProd} (x{cant})</span>
                            {esPromo && (
                              <span style={{ marginLeft: '8px', background: '#b45309', color: '#fef3c7', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                                🏷️ Promo {porcentajeDesc}% OFF
                              </span>
                            )}
                          </div>
                          <div>
                            {esPromo && (
                              <span style={{ color: '#94a3b8', textDecoration: 'line-through', marginRight: '8px', fontSize: '0.85rem' }}>
                                ${(precioBaseU * cant).toFixed(0)}
                              </span>
                            )}
                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                              ${subtotal.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '0.8rem', borderTop: '1px solid #334155' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22c55e' }}>
                    Total: ${Number(pedidoSeleccionadoDetalle.total || 0).toFixed(0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPedidoSeleccionadoDetalle(null)}
                    style={{ background: '#475569', color: '#fff', padding: '0.6rem 1.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRUD DE PRODUCTOS */}
      {tabActiva === 'productos' && (
        <>
          <div className="barra-superior-admin">
            <h2 className="titulo-seccion">Panel de Control de Productos</h2>
            <button className="boton-nuevo" onClick={limpiarFormulario}>+ Nuevo Producto</button>
          </div>

          <div className="disposicion-admin">
            <section className="seccion-lista-admin">
              <div className="filtro-admin" style={{ display: 'flex', gap: '0.8rem' }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="selector-filtro"
                  style={{ flex: 1 }}
                />
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="selector-filtro"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="contenedor-lista-admin">
                {productosFiltrados.length === 0 ? (
                  <p className="estado-vacio">No hay productos para mostrar.</p>
                ) : (
                  <ul className="lista-cuadricula-admin">
                    {productosFiltrados.map((p) => {
                      const nombreCat =
                        p.categoria?.nombre ||
                        categorias.find((c) => c.id === (p.categoria?.id || p.categoriaId || p.categoria))?.nombre ||
                        'Sin categoría';
                      return (
                        <li key={p.id} className="tarjeta-item-admin">
                          <div className="info-item">
                            <strong className="nombre-item">{p.nombre}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', margin: '4px 0', display: 'inline-block' }}>
                              {nombreCat}
                            </span>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <span className="precio-item">${Number(p.precio).toFixed(0)}</span>
                              <span style={{ fontSize: '0.85rem', color: Number(p.stock) > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                Stock: {p.stock !== undefined ? p.stock : 1}
                              </span>
                            </div>
                          </div>
                          <div className="acciones-item">
                            <button type="button" className="boton-accion editar" onClick={() => handleEditar(p)}>Editar</button>
                            <button type="button" className="boton-accion borrar" onClick={() => handleEliminar(p.id)}>Borrar</button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section className="seccion-formulario-admin">
              <div className="tarjeta-formulario-admin">
                <h3>{productoEnEdicion ? 'Editando Producto' : 'Crear Nuevo Producto'}</h3>

                <form className="formulario-admin" onSubmit={handleGuardar}>
                  <div className="campo">
                    <label>Nombre</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: Milanesa con papas" />
                  </div>
                  <div className="campo">
                    <label>Descripción</label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows="3"
                      placeholder="Detalles del plato..."
                    />
                  </div>
                  <div className="fila-campos">
                    <div className="campo mitad">
                      <label>Precio ($)</label>
                      <input
                        type="text"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                        placeholder="Ej: 3000"
                      />
                    </div>
                    <div className="campo mitad">
                      <label>Categoría</label>
                      <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                        <option value="" disabled>Seleccionar...</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label>Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                      placeholder="Ej: 10"
                    />
                  </div>

                  {/* BÚSQUEDA WEB REAL DE IMÁGENES */}
                  <div className="campo" style={{ background: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid #374151' }}>
                    <label style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.95rem' }}>Imagen del Producto</label>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        placeholder="Pega la URL de una foto o búscala..."
                        value={imagenUrl}
                        onChange={(e) => setImagenUrl(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', background: '#1f2937', color: '#fff', border: '1px solid #4b5563', borderRadius: '4px' }}
                      />
                      <button
                        type="button"
                        onClick={handleBuscarImagenWeb}
                        disabled={buscandoImagen}
                        style={{
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0 1rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}
                      >
                        {buscandoImagen ? 'Buscando...' : '🔍 Buscar en la Web'}
                      </button>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.8rem' }}>
                      <span>O subir desde tu computadora: </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCargarArchivoLocal}
                        style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}
                      />
                    </div>

                    {imagenesEncontradas.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.8rem', color: '#38bdf8', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                          Seleccioná la imagen que prefieras (hacé clic en una):
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          {imagenesEncontradas.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt="Opción"
                              onClick={() => setImagenUrl(url)}
                              style={{
                                width: '100%',
                                height: '75px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                border: imagenUrl === url ? '3px solid #22c55e' : '1px solid #374151',
                                opacity: imagenUrl === url ? 1 : 0.7,
                                transition: 'all 0.2s'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {imagenUrl && (
                      <div style={{ textAlign: 'center', background: '#0f172a', padding: '0.6rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.4rem 0' }}>Imagen que se guardará:</p>
                        <img
                          src={imagenUrl}
                          alt="Previsualización final"
                          style={{ maxHeight: '130px', maxWidth: '100%', borderRadius: '6px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {error && <p className="mensaje-error">{error}</p>}

                  <div className="acciones-formulario">
                    {productoEnEdicion && (
                      <button type="button" className="boton-cancelar" onClick={limpiarFormulario}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="boton-guardar" disabled={enviando}>
                      {enviando ? 'Guardando...' : (productoEnEdicion ? 'Actualizar' : 'Crear Producto')}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
