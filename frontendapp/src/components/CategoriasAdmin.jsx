import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export function CategoriasAdmin({ onCategoriasCambiaron }) {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // 1. OBTENER CATEGORÍAS
  const cargarCategorias = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await api.getCategorias();
      const lista = Array.isArray(data) ? data : (data?.data || []);
      setCategorias(lista);
    } catch (err) {
      setError(err.message || 'Error al obtener categorías');
      setCategorias([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // 2. CREAR CATEGORÍA
  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError('');
    try {
      await api.crearCategoria({ nombre });
      setNombre('');
      cargarCategorias();
      if (onCategoriasCambiaron) onCategoriasCambiaron();
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. EDITAR CATEGORÍA
  const handleGuardarEdicion = async (id) => {
    setError('');
    try {
      await api.actualizarCategoria(id, { nombre: nombreEditado });
      setEditandoId(null);
      cargarCategorias();
      if (onCategoriasCambiaron) onCategoriasCambiaron();
    } catch (err) {
      setError(err.message);
    }
  };

  // 4. ELIMINAR CATEGORÍA
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta categoría?')) return;
    setError('');
    try {
      await api.eliminarCategoria(id);
      await cargarCategorias();
      if (onCategoriasCambiaron) onCategoriasCambiaron();
    } catch (err) {
      setError(err.message || 'Error al eliminar la categoría');
    }
  };

  return (
    <div style={{ marginTop: '1rem', color: '#1f2937' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Gestión de Categorías</h3>
      
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Formulario de Alta */}
      <form onSubmit={handleCrear} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Nombre de la nueva categoría..."
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
          + Agregar Categoría
        </button>
      </form>

      {/* Listado */}
      {cargando ? (
        <p>Cargando categorías...</p>
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
              {Array.isArray(categorias) && categorias.length > 0 ? (
                categorias.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{cat.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {editandoId === cat.id ? (
                        <input
                          value={nombreEditado}
                          onChange={(e) => setNombreEditado(e.target.value)}
                          style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      ) : (
                        cat.nombre
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {editandoId === cat.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleGuardarEdicion(cat.id)}
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
                              setEditandoId(cat.id);
                              setNombreEditado(cat.nombre);
                            }}
                            style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminar(cat.id)}
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
                    No hay categorías registradas.
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