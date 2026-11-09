import React, { useState, useEffect } from 'react';
import { getToken } from '../api/session.js';

export default function CartasAdmin() {
  const [cartas, setCartas] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_vigencia: '',
    descuento: 0,
    productosIds: []
  });
  const [editId, setEditId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');

  const hoyObj = new Date();
  const hoyStr = `${hoyObj.getFullYear()}-${String(hoyObj.getMonth() + 1).padStart(2, '0')}-${String(hoyObj.getDate()).padStart(2, '0')}`;

  const getHeaders = () => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    try {
      const [resCartas, resProd] = await Promise.all([
        fetch('http://localhost:3000/api/cartas', { headers: getHeaders() }),
        fetch('http://localhost:3000/api/productos', { headers: getHeaders() })
      ]);

      const dataCartas = await resCartas.json();
      const dataProd = await resProd.json();

      if (!resCartas.ok) throw new Error(dataCartas.message || 'Error al obtener cartas');
      if (!resProd.ok) throw new Error(dataProd.message || 'Error al obtener productos');

      // Aseguramos que siempre sean arrays válidos
      setCartas(Array.isArray(dataCartas.data) ? dataCartas.data : (Array.isArray(dataCartas) ? dataCartas : []));
      setProductosDisponibles(Array.isArray(dataProd.data) ? dataProd.data : (Array.isArray(dataProd) ? dataProd : []));
    } catch (err) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getEstadoVigencia = (fecha) => {
    if (!fecha) {
      return {
        texto: '● En vigencia permanente',
        color: '#15803d',
        fondo: '#dcfce7',
        detalle: '(Sin límite)'
      };
    }

    const fechaCartaStr = String(fecha).split('T')[0];

    if (fechaCartaStr < hoyStr) {
      return {
        texto: '● Perdió vigencia',
        color: '#b91c1c',
        fondo: '#fee2e2',
        detalle: `(Venció: ${fechaCartaStr})`
      };
    } else if (fechaCartaStr === hoyStr) {
      return {
        texto: '● En vigencia',
        color: '#15803d',
        fondo: '#dcfce7',
        detalle: `(Hoy: ${fechaCartaStr})`
      };
    } else {
      return {
        texto: '● Próxima a regir',
        color: '#854d0e',
        fondo: '#fef08a',
        detalle: `(Inicia: ${fechaCartaStr})`
      };
    }
  };

  const handleCheckboxChange = (id) => {
    const numId = Number(id);
    setFormData((prev) => {
      const idsActuales = prev.productosIds || [];
      const exists = idsActuales.includes(numId);
      return {
        ...prev,
        productosIds: exists
          ? idsActuales.filter((pId) => pId !== numId)
          : [...idsActuales, numId]
      };
    });
  };

  const limpiarFormulario = () => {
    setFormData({ nombre: '', fecha_vigencia: '', descuento: 0, productosIds: [] });
    setEditId(null);
    setBusquedaProducto('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    if (formData.fecha_vigencia && formData.fecha_vigencia < hoyStr) {
      setError('No puedes crear ni editar una carta con fecha anterior al día actual.');
      return;
    }

    if (!formData.productosIds || formData.productosIds.length === 0) {
      setError('Debes seleccionar al menos un producto para la carta o combo.');
      return;
    }

    try {
      const url = editId
        ? `http://localhost:3000/api/cartas/${editId}`
        : 'http://localhost:3000/api/cartas';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          fecha_vigencia: formData.fecha_vigencia || null,
          descuento: Number(formData.descuento) || 0,
          productosIds: formData.productosIds
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Error en la operación');

      setMensajeExito(editId ? '¡Carta actualizada con éxito!' : '¡Carta creada con éxito!');
      limpiarFormulario();
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (item) => {
    setEditId(item.id);
    setFormData({
      nombre: item.nombre || '',
      fecha_vigencia: item.fecha_vigencia ? String(item.fecha_vigencia).split('T')[0] : '',
      descuento: item.descuento ? Number(item.descuento) : 0,
      productosIds: Array.isArray(item.productos) ? item.productos.map((p) => Number(p.id)) : []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta carta / menú?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/cartas/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No se pudo eliminar');
      setMensajeExito('Carta eliminada.');
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const productosFiltrados = (productosDisponibles || []).filter((prod) =>
    (prod.nombre || '').toLowerCase().includes((busquedaProducto || '').toLowerCase())
  );

  // Cálculos seguros con comprobación de existencia
  const subtotalFormulario = (productosDisponibles || [])
    .filter((p) => (formData.productosIds || []).includes(Number(p.id)))
    .reduce((acc, p) => acc + Number(p.precio || 0), 0);

  const porcentajeDescuento = Math.max(0, Math.min(100, Number(formData.descuento) || 0));
  const totalFormularioConDescuento = Math.round(subtotalFormulario * ((100 - porcentajeDescuento) / 100));

  return (
    <div className="contenedor-admin">
      <div className="barra-superior-admin">
        <h2 className="titulo-seccion">Gestión de Cartas y Menús del Día</h2>
        <button type="button" className="boton-nuevo" onClick={limpiarFormulario}>
          + Nueva Carta
        </button>
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {mensajeExito && (
        <div style={{ background: '#14532d', color: '#86efac', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {mensajeExito}
        </div>
      )}

      <div className="disposicion-admin">
        {/* LISTADO DE CARTAS */}
        <section className="seccion-lista-admin">
          <div className="contenedor-lista-admin">
            {cargando ? (
              <p className="estado-vacio">Cargando cartas registradas...</p>
            ) : (!cartas || cartas.length === 0) ? (
              <p className="estado-vacio">No hay cartas ni menús creados todavía.</p>
            ) : (
              <ul className="lista-cuadricula-admin">
                {cartas.map((c) => {
                  const estado = getEstadoVigencia(c.fecha_vigencia);
                  const prodsCarta = Array.isArray(c.productos) ? c.productos : [];
                  const subtotalCarta = prodsCarta.reduce((acc, p) => acc + Number(p.precio || 0), 0);
                  const desc = Number(c.descuento) || 0;
                  const precioFinalCalculado = Math.round(subtotalCarta * ((100 - desc) / 100));

                  return (
                    <li key={c.id} className="tarjeta-item-admin">
                      <div className="info-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <strong className="nombre-item" style={{ fontSize: '1.15rem' }}>{c.nombre}</strong>
                          {desc > 0 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#b45309', color: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                              -{desc}% OFF
                            </span>
                          )}
                        </div>
                        
                        <div style={{ marginTop: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              color: estado.color,
                              background: estado.fondo,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}
                          >
                            {estado.texto} {estado.detalle}
                          </span>
                        </div>

                        <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                          <strong style={{ color: '#d1d5db' }}>Productos incluidos:</strong>
                          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', listStyleType: 'disc' }}>
                            {prodsCarta.length > 0 ? (
                              prodsCarta.map((prod) => (
                                <li key={prod.id} style={{ color: '#f3f4f6' }}>
                                  {prod.nombre} (${Number(prod.precio).toFixed(0)})
                                </li>
                              ))
                            ) : (
                              <li style={{ color: '#ef4444' }}>Sin productos asignados</li>
                            )}
                          </ul>
                        </div>

                        <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Total con descuento:</span>
                          <div>
                            {desc > 0 && (
                              <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.85rem', marginRight: '0.5rem' }}>
                                ${subtotalCarta.toFixed(0)}
                              </span>
                            )}
                            <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#22c55e' }}>
                              ${precioFinalCalculado.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="acciones-item">
                        <button type="button" className="boton-accion editar" onClick={() => handleEditar(c)}>
                          Editar
                        </button>
                        <button type="button" className="boton-accion borrar" onClick={() => handleEliminar(c.id)}>
                          Borrar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* FORMULARIO */}
        <section className="seccion-formulario-admin">
          <div className="tarjeta-formulario-admin">
            <h3>{editId ? 'Editar Carta / Menú' : 'Crear Nueva Carta'}</h3>

            <form className="formulario-admin" onSubmit={handleSubmit}>
              <div className="campo">
                <label>Nombre de la Carta / Combo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Menú Estudiantil Mediodía"
                  required
                />
              </div>

              <div className="fila-campos">
                <div className="campo mitad">
                  <label>Fecha de Vigencia</label>
                  <input
                    type="date"
                    min={hoyStr}
                    style={{ colorScheme: 'dark', cursor: 'pointer' }}
                    value={formData.fecha_vigencia}
                    onChange={(e) => setFormData({ ...formData, fecha_vigencia: e.target.value })}
                  />
                </div>
                <div className="campo mitad">
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ej: 15"
                    value={formData.descuento}
                    onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                  />
                </div>
              </div>

              {formData.productosIds && formData.productosIds.length > 0 && (
                <div style={{ background: '#111827', padding: '0.75rem', borderRadius: '6px', border: '1px solid #374151', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
                    <span>Subtotal normal:</span>
                    <span>${subtotalFormulario.toFixed(0)}</span>
                  </div>
                  {porcentajeDescuento > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', marginTop: '0.2rem' }}>
                      <span>Descuento aplicado ({porcentajeDescuento}%):</span>
                      <span>-${(subtotalFormulario - totalFormularioConDescuento).toFixed(0)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.4rem', borderTop: '1px solid #1f2937', paddingTop: '0.3rem' }}>
                    <span>Precio Promocional Final:</span>
                    <span>${totalFormularioConDescuento.toFixed(0)}</span>
                  </div>
                </div>
              )}

              <div className="campo">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Productos Componentes</label>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                    {(formData.productosIds || []).length} seleccionado(s)
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="🔍 Buscar producto en la lista..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  style={{
                    marginBottom: '0.6rem',
                    background: '#111827',
                    border: '1px solid #374151',
                    fontSize: '0.85rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />

                <div 
                  style={{ 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    background: '#111827', 
                    border: '1px solid #374151', 
                    borderRadius: '6px', 
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {productosFiltrados.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', padding: '0.8rem', margin: 0, textAlign: 'center' }}>
                      No se encontraron productos coincidentes.
                    </p>
                  ) : (
                    productosFiltrados.map((prod) => {
                      const seleccionado = (formData.productosIds || []).includes(Number(prod.id));
                      return (
                        <label 
                          key={prod.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.8rem',
                            borderBottom: '1px solid #1f2937',
                            cursor: 'pointer',
                            background: seleccionado ? '#1e293b' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                              type="checkbox"
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              checked={seleccionado}
                              onChange={() => handleCheckboxChange(prod.id)}
                            />
                            <span style={{ fontSize: '0.9rem', color: seleccionado ? '#fff' : '#e5e7eb', fontWeight: seleccionado ? '600' : 'normal' }}>
                              {prod.nombre}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold' }}>
                            ${Number(prod.precio).toFixed(0)}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="acciones-formulario">
                {editId && (
                  <button type="button" className="boton-cancelar" onClick={limpiarFormulario}>
                    Cancelar
                  </button>
                )}
                <button type="submit" className="boton-guardar">
                  {editId ? 'Guardar Cambios' : 'Crear Carta'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}