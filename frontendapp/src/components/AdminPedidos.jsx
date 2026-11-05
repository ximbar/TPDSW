import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const cargarPedidos = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await api.getTodosLosPedidos(filtroEstado);
      setPedidos(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError(err.message || 'Error al cargar pedidos');
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  // Recarga los pedidos cada vez que cambiás el filtro
  useEffect(() => {
    cargarPedidos();
  }, [filtroEstado]);

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.cambiarEstadoPedido(id, nuevoEstado);
      cargarPedidos(); // Recargamos la lista para ver el cambio
      if (pedidoSeleccionado?.id === id) {
        setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado });
      }
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  // Función para sacar los items del pedido (ataja distintos nombres posibles que le haya puesto tu compañero)
  const itemsPedido = pedidoSeleccionado?.detalles || pedidoSeleccionado?.items || pedidoSeleccionado?.DetallePedidos || [];

  return (
    <div style={{ marginTop: '1rem', color: '#1f2937' }}>
      
      {/* Barra superior de Filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <label style={{ fontWeight: 600 }}>Filtrar listado por estado:</label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '150px' }}
        >
          <option value="">Todos los pedidos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_PREPARACION">En Preparación</option>
          <option value="LISTO_PARA_RETIRAR">Listos para retirar</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
        <button onClick={cargarPedidos} style={{ padding: '0.5rem 1rem', background: '#eab308', color: '#000', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          ↻ Refrescar
        </button>
      </div>

      {error && <p style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '6px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* COLUMNA IZQUIERDA: Lista de Pedidos */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {cargando ? (
            <p style={{ padding: '1.5rem', textAlign: 'center' }}>Cargando pedidos...</p>
          ) : pedidos.length === 0 ? (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>No se encontraron pedidos con este estado.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#1f2937', color: 'white' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Nro.</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Alumno (Usuario)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => {
                  const nombreUsuario = p.usuario?.nombre || p.usuario?.email || 'Alumno #' + (p.usuarioId || p.usuario || 'N/A');
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', background: pedidoSeleccionado?.id === p.id ? '#f0fdf4' : 'transparent' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>#{p.id}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{nombreUsuario}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>${p.total}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                         <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', background: p.estado === 'PENDIENTE' ? '#fef08a' : p.estado === 'ENTREGADO' ? '#bbf7d0' : '#e0f2fe', color: '#1f2937' }}>
                           {p.estado}
                         </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setPedidoSeleccionado(p)}
                          style={{ padding: '0.4rem 0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Ver Detalle →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* COLUMNA DERECHA: Detalle del Pedido (cumple la rúbrica) */}
        {pedidoSeleccionado && (
          <div style={{ width: '380px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Pedido #{pedidoSeleccionado.id}</h4>
              <button onClick={() => setPedidoSeleccionado(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0.3rem 0' }}><strong>Alumno:</strong> {pedidoSeleccionado.usuario?.nombre || pedidoSeleccionado.usuario?.email || 'N/A'}</p>
              <p style={{ margin: '0.3rem 0' }}><strong>Medio de Pago:</strong> {pedidoSeleccionado.medioDePago?.nombre || 'N/A'}</p>
              <p style={{ margin: '0.3rem 0', fontSize: '1.2rem', color: '#16a34a' }}><strong>Total: ${pedidoSeleccionado.total}</strong></p>
            </div>
            
            <div style={{ margin: '1.5rem 0' }}>
              <h5 style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '4px', margin: '0 0 0.5rem 0' }}>📋 Productos Seleccionados:</h5>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                {itemsPedido.length > 0 ? (
                  itemsPedido.map((detalle, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{detalle.cantidad}x</span> {detalle.producto?.nombre || 'Producto eliminado'} <br/>
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Precio unitario: ${detalle.precioUnitario || detalle.precio}</span>
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#ef4444' }}>No se cargaron los detalles</li>
                )}
              </ul>
            </div>

            {/* SECCIÓN CAMBIAR ESTADO */}
            <div style={{ marginTop: '2rem', padding: '1.2rem', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#0f766e' }}>Cambiar Estado del Pedido:</label>
              <select 
                value={pedidoSeleccionado.estado}
                onChange={(e) => handleActualizarEstado(pedidoSeleccionado.id, e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #99f6e4', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold' }}
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PREPARACION">En Preparación</option>
                <option value="LISTO_PARA_RETIRAR">Listo para retirar</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: '#0f766e', margin: 0 }}>* El cambio se guarda automáticamente al seleccionar.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}