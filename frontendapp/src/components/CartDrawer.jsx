import { useState } from 'react'

export default function CartDrawer({
  open,
  onClose,
  items,
  onRemove,
  mediosDePago,
  onConfirm,
  pedidoConfirmado,
  onNuevoPedido,
}) {
  const [medioDePagoId, setMedioDePagoId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const total = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)

  const puedeConfirmar = items.length > 0 && medioDePagoId && !enviando

  const handleConfirmar = async () => {
    setError('')
    setEnviando(true)
    try {
      await onConfirm(medioDePagoId)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const handleCerrar = () => {
    setError('')
    onClose()
  }

  return (
    <>
      <div className="overlay" onClick={handleCerrar} />
      <aside className="drawer">
        <div className="drawer-header">
          <h2 className="drawer-title">
            {pedidoConfirmado ? 'Pedido confirmado' : 'Tu pedido'}
          </h2>
          <button className="drawer-close" onClick={handleCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>

        {pedidoConfirmado ? (
          <div className="drawer-body">
            <div className="confirmation">
              <p className="card-price" style={{ fontSize: '2rem' }}>
                #{pedidoConfirmado.id}
              </p>
              <h3 className="confirmation-title">¡Listo, ya lo registramos!</h3>
              <p className="cart-item-sub">
                Total ${Number(pedidoConfirmado.total).toFixed(0)} · Estado: {pedidoConfirmado.estado}
              </p>
              <button className="confirm-btn" style={{ marginTop: '1.5rem' }} onClick={onNuevoPedido}>
                Hacer otro pedido
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {items.length === 0 ? (
                <p className="empty-state">Todavía no agregaste nada.</p>
              ) : (
                items.map((item) => (
                  <div className="cart-item" key={item.producto.id}>
                    <div>
                      <p className="cart-item-name">
                        {item.cantidad} × {item.producto.nombre}
                      </p>
                      <p className="cart-item-sub">
                        ${Number(item.producto.precio * item.cantidad).toFixed(0)}
                      </p>
                    </div>
                    <button className="cart-item-remove" onClick={() => onRemove(item.producto.id)}>
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="drawer-footer">
              <div className="total-row">
                <span className="total-label">Total</span>
                <span className="total-value">${total.toFixed(0)}</span>
              </div>

              <div className="field">
                <label htmlFor="medioDePago">Medio de pago</label>
                <select
                  id="medioDePago"
                  value={medioDePagoId}
                  onChange={(e) => setMedioDePagoId(e.target.value)}
                >
                  <option value="">Elegí cómo pagás</option>
                  {mediosDePago.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="feedback error">{error}</p>}

              <button className="confirm-btn" disabled={!puedeConfirmar} onClick={handleConfirmar}>
                {enviando ? 'Confirmando...' : 'Confirmar pedido'}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
