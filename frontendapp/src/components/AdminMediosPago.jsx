import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export function AdminMediosPago({ onMedioPagosCambiaron }) {
  const [medioPagos, setMedioPagos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // 1. OBTENER MEDIOS DE PAGO
  const cargarMedioPagos = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await api.getMediosDePago();
      const lista = Array.isArray(data) ? data : (data?.data || []);
      setMedioPagos(lista);
    } catch (err) {
      setError(err.message || 'Error al obtener medios de pago');
      setMedioPagos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMedioPagos();
  }, []);

  // 2. CREAR MEDIO DE PAGO
  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError('');
    try {
      await api.crearMedioPago({ nombre });
      setNombre('');
      cargarMedioPagos();
      if (onMedioPagosCambiaron) onMedioPagosCambiaron();
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. EDITAR MEDIO DE PAGO
  const handleGuardarEdicion = async (id) => {
    setError('');
    try {
      await api.actualizarMedioPago(id, { nombre: nombreEditado });
      setEditandoId(null);
      cargarMedioPagos();
      if (onMedioPagosCambiaron) onMedioPagosCambiaron();
    } catch (err) {
      setError(err.message);
    }
  };

  // 4. ELIMINAR MEDIO DE PAGO
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este medio de pago?')) return;
    setError('');
    try {
      await api.eliminarMedioPago(id);
      await cargarMedioPagos();
      if (onMedioPagosCambiaron) onMedioPagosCambiaron();
    } catch (err) {
      setError(err.message || 'Error al eliminar el medio de pago');
    }
  };

  return (
    <div style={{ marginTop: '1rem', color: '#1f2937' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Gestión de Medios de Pago</h3>
      
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Formulario de Alta */}
      <form onSubmit={handleCrear} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Nombre del nuevo medio de pago (ej. Mercado Pago)..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            flex: 1,
            padding: '0.6rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.6rem 1.2rem',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Agregar Medio de Pago
        </button>
      </form>

      {/* Listado */}
      {cargando ? (
        <p>Cargando medios de pago...</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem 1rem', width: '80px' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Nombre</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(medioPagos) && medioPagos.length > 0 ? (
                medioPagos.map((medioPago) => (
                  <tr key={medioPago.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{medioPago.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {editandoId === medioPago.id ? (
                        <input
                          value={nombreEditado}
                          onChange={(e) => setNombreEditado(e.target.value)}
                          style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      ) : (
                        medioPago.nombre
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {editandoId === medioPago.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleGuardarEdicion(medioPago.id)}
                            style={{ marginRight: '0.4rem', padding: '0.3rem 0.6rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoId(null)}
                            style={{ padding: '0.3rem 0.6rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoId(medioPago.id);
                              setNombreEditado(medioPago.nombre);
                            }}
                            style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminar(medioPago.id)}
                            style={{ padding: '0.3rem 0.6rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                    No hay medios de pago registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}