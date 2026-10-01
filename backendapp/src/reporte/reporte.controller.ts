import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Pedido, EstadoPedido } from '../pedido/pedido.entity.js'

const em = orm.em

/**
 * CASO DE USO: Generar reporte de cierre de caja
 *
 * GET /api/reportes/cierreCaja?fecha=2026-09-30
 * Si no se manda "fecha", usa el día de hoy.
 *
 * Solo cuenta los pedidos en estado ENTREGADO de ese día (los PENDIENTE,
 * EN_PREPARACION o CANCELADO no se facturan todavía / no se facturan).
 *
 * Devuelve: total general, cantidad de pedidos, y el desglose por medio de pago
 * (cuanto entró en efectivo, cuanto en tarjeta, etc.) que es lo típico que
 * se necesita para cerrar una caja.
 */
export async function cierreCaja(req: Request, res: Response) {
  try {
    const hoy = new Date()
    const fechaHoyLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    const fechaParam = (req.query.fecha as string) || fechaHoyLocal // YYYY-MM-DD

    const inicioDia = new Date(`${fechaParam}T00:00:00`)
    const finDia = new Date(`${fechaParam}T23:59:59.999`)

    if (isNaN(inicioDia.getTime())) {
      return res.status(400).json({ message: 'fecha invalida, usar formato YYYY-MM-DD' })
    }

    const pedidos = await em.find(
      Pedido,
      {
        estado: EstadoPedido.ENTREGADO,
        fecha: { $gte: inicioDia, $lte: finDia },
      },
      { populate: ['medioDePago'] }
    )

    const totalGeneral = pedidos.reduce((acc, p) => acc + Number(p.total), 0)

    // agrupamos por medio de pago
    const desglosePorMedioDePago: Record<string, { cantidadPedidos: number; total: number }> = {}

    for (const pedido of pedidos) {
      const nombreMedio = pedido.medioDePago.nombre
      if (!desglosePorMedioDePago[nombreMedio]) {
        desglosePorMedioDePago[nombreMedio] = { cantidadPedidos: 0, total: 0 }
      }
      desglosePorMedioDePago[nombreMedio].cantidadPedidos += 1
      desglosePorMedioDePago[nombreMedio].total += Number(pedido.total)
    }

    res.status(200).json({
      message: 'reporte generado',
      data: {
        fecha: fechaParam,
        cantidadPedidos: pedidos.length,
        totalGeneral,
        desglosePorMedioDePago,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
