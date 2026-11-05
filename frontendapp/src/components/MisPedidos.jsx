import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMisPedidos()
      .then(data => {
        setPedidos(Array.isArray(data) ? data : (data?.data || []));
      })
      .catch(err => setError(err.message || 'Error al cargar tus pedidos'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando tus pedidos...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', color: '#1f2937' }}>
        🛒 Mis Pedidos
      </h2>
      
      {pedidos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '1.1rem', marginTop: '2rem' }}>
          Todavía no realizaste ningún pedido.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pedidos.map(p => {
             // Determinamos el color de la etiqueta según el estado
             let colorFondo = '#e0f2fe';
             let colorTexto = '#0369a1';
             if (p.estado === 'PENDIENTE') { colorFondo = '#fef08a'; colorTexto = '#854d0e'; }
             if (p.estado === 'EN_PREPARACION') { colorFondo = '#ffedd5'; colorTexto = '#c2410c'; }
             if (p.estado === 'LISTO_PARA_RETIRAR') { colorFondo = '#dcfce7'; colorTexto = '#15803d'; }
             if (p.estado === 'ENTREGADO') { colorFondo = '#f3f4f6'; colorTexto = '#374151'; }
             
             const itemsPedido = p.detalles || p.items || p.DetallePedidos || [];

             return (
              <div key={p.id} style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '1.5rem', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#111827' }}>Pedido #{p.id}</span>
                  <span style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', background: colorFondo, color: colorTexto }}>
                    {p.estado.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <p style={{ margin: '0.5rem 0', color: '#374151' }}><strong>Medio de Pago:</strong> {p.medioDePago?.nombre || 'N/A'}</p>
                
                <div style={{ margin: '1rem 0', background: '#f9fafb', padding: '1rem', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Detalle de productos:</strong>
                  <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#4b5563' }}>
                    {itemsPedido.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.cantidad}x</span> {item.producto?.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p style={{ margin: '0.5rem 0', fontSize: '1.25rem', textAlign: 'right', color: '#16a34a' }}>
                  <strong>Total: ${p.total}</strong>
                </p>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}