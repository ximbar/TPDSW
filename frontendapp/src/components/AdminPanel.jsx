import { useState, useEffect } from 'react'
import { api } from '../api/client.js'
import { CategoriasAdmin } from './CategoriasAdmin.jsx'
import { AdminMediosPago } from './AdminMediosPago.jsx'
import { AdminPedidos } from './AdminPedidos.jsx'
export default function AdminPanel({ categorias, productos, onProductosCambiaron, onCategoriasCambiaron, onMediosPagoCambiaron }) {
  const [tabActiva, setTabActiva] = useState(() => {
    return localStorage.getItem('admin_tab_activa') || 'productos';
  });
  useEffect(() => {
    localStorage.setItem('admin_tab_activa', tabActiva);
  }, [tabActiva]);
  const [stock, setStock] = useState('1')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  
  const [productoEnEdicion, setProductoEnEdicion] = useState(null)
  
  // Estados para nuestros dos filtros (categoría y texto)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const limpiarFormulario = () => {
    setNombre('')
    setDescripcion('')
    setPrecio('')
    setCategoriaId('')
    setStock('1')
    setProductoEnEdicion(null)
    setError('')
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const precioCorregido = String(precio).replace(',', '.');
      
      const datosProducto = {
        nombre,
        descripcion,
        precio: precioCorregido, 
        categoria: Number(categoriaId),
        stock: stock !== '' ? Number(stock) : 1,
      }
      if (productoEnEdicion) {
        await api.actualizarProducto(productoEnEdicion.id, datosProducto)
      } else {
        await api.crearProducto(datosProducto)
      }
      
      limpiarFormulario()
      onProductosCambiaron()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const handleEditar = (producto) => {
    setProductoEnEdicion(producto)
    setNombre(producto.nombre)
    setDescripcion(producto.descripcion)
    setPrecio(producto.precio)
    const catId = producto.categoria?.id || producto.categoria || producto.categoria_id;
    setCategoriaId(catId);
    setStock(producto.stock !== undefined ? producto.stock : 1)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este producto?')) return;
    
    try {
      await api.eliminarProducto(id)
      if (productoEnEdicion && productoEnEdicion.id === id) {
        limpiarFormulario()
      }
      onProductosCambiaron()
    } catch (err) {
      setError(err.message)
    }
  }

// Lógica del buscador: Filtra por categoría Y por lo que escribas
  const productosFiltrados = productos.filter(p => {
    // 1. Verificamos la categoría asegurándonos de convertir todo a texto para comparar
    const coincideCategoria = filtroCategoria 
      ? String(p.categoria?.id || p.categoria || p.categoria_id) === String(filtroCategoria) 
      : true;
      
    // 2. Verificamos el nombre manejando posibles errores si el nombre viene vacío o nulo
    const nombreSeguro = p.nombre ? String(p.nombre).toLowerCase() : '';
    const busquedaSegura = busqueda ? busqueda.toLowerCase().trim() : '';
    const coincideNombre = nombreSeguro.includes(busquedaSegura);
    
    return coincideCategoria && coincideNombre;
  });

  return (
    <div className="contenedor-admin">
      {/* BOTONES DE PESTAÑAS */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem' }}>
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
            cursor: 'pointer'
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
            cursor: 'pointer'
          }}
        >
          Gestión de Categorías
        </button>
        {/* BOTÓN NUEVO: */}
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
            cursor: 'pointer'
          }}
        >
          Gestión de Medios de Pago
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('pedidos')}
          style={{
            padding: '0.6rem 1.2rem',
            background: tabActiva === 'pedidos' ? '#2f4f2f' : '#e5e7eb',
            color: tabActiva === 'pedidos' ? '#ffffff' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Gestión de Pedidos
        </button>


      </div>


      {/* LÓGICA DE RENDERIZADO */}
      {tabActiva === 'categorias' && (
        <CategoriasAdmin onCategoriasCambiaron={onCategoriasCambiaron} />
      )}
      
      {tabActiva === 'mediosPago' && (
        <AdminMediosPago onMedioPagosCambiaron={onMediosPagoCambiaron} />
      )}
      
      {tabActiva === 'pedidos' && (
        <AdminPedidos />
      )}


      {tabActiva === 'productos' && (
        <>
      <div className="barra-superior-admin">
        <h2 className="titulo-seccion">Panel de Control de Productos</h2>
        <button className="boton-nuevo" onClick={limpiarFormulario}>+ Nuevo Producto</button>
      </div>

      <div className="disposicion-admin">
        
        {/* COLUMNA IZQUIERDA: Lista de Productos */}
        <section className="seccion-lista-admin">
          
          {/* NUEVO BUSCADOR Y FILTRO */}
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
              {categorias.map(c => (
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
                        {/* Etiqueta de Categoría */}
                        <span style={{ fontSize: '0.8rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', margin: '4px 0', display: 'inline-block' }}>
                          {nombreCat}
                        </span>
                        {/* Precio y Stock */}
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

        {/* COLUMNA DERECHA: Formulario */}
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
)
}