import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Pedido, EstadoPedido } from './pedido.entity.js'
import { DetallePedido } from '../detallePedido/detallePedido.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { MedioDePago } from '../medioDePago/medioDePago.entity.js'
import { Producto } from '../producto/producto.entity.js'

const em = orm.em

// GET /api/pedidos -> lista todos
// GET /api/pedidos?estado=PENDIENTE -> lista filtrada por estado
export async function findAll(req: Request, res: Response) {
  try {
    const filtro = req.query.estado ? { estado: req.query.estado as EstadoPedido } : {}
    const pedidos = await em.find(Pedido, filtro, {
      populate: ['usuario', 'medioDePago', 'detalles', 'detalles.producto'],
      orderBy: { fecha: 'DESC' },
    })
    res.status(200).json({ message: 'pedidos encontrados', data: pedidos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const pedido = await em.findOneOrFail(
      Pedido,
      { id },
      { populate: ['usuario', 'medioDePago', 'detalles', 'detalles.producto'] }
    )
    res.status(200).json({ message: 'pedido encontrado', data: pedido })
  } catch (error: any) {
    res.status(404).json({ message: 'pedido no encontrado' })
  }
}

// GET /api/pedidos/mios -> el cliente logueado ve solo sus propios pedidos
export async function findMisPedidos(req: Request, res: Response) {
  try {
    const usuarioId = req.usuario!.id
    const pedidos = await em.find(
      Pedido,
      { usuario: usuarioId },
      { populate: ['medioDePago', 'detalles', 'detalles.producto'], orderBy: { fecha: 'DESC' } }
    )
    res.status(200).json({ message: 'pedidos encontrados', data: pedidos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * CASO DE USO: Realizar pedido (carrito take away)
 * Respeta el precio con descuento enviado desde las cartas/promos.
 */
export async function realizarPedido(req: Request, res: Response) {
  const usuarioId = req.usuario!.id
  const { medioDePago, items } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'el pedido necesita al menos un producto (items)' })
  }

  try {
    const pedidoCreado = await em.transactional(async (tem) => {
      const usuarioEntity = await tem.findOneOrFail(Usuario, { id: usuarioId })
      const medioDePagoEntity = await tem.findOneOrFail(MedioDePago, { id: medioDePago })

      const pedido = tem.create(Pedido, {
        usuario: usuarioEntity,
        medioDePago: medioDePagoEntity,
        estado: EstadoPedido.PENDIENTE,
        fecha: new Date(),
        total: 0,
      })

      let total = 0

      for (const item of items) {
        const producto = await tem.findOneOrFail(Producto, { id: item.producto })
        const cantidad = Number(item.cantidad)

        if (!cantidad || cantidad <= 0) {
          throw new Error(`cantidad invalida para el producto ${producto.id}`)
        }

        // Si viene con descuento desde la promo, se toma ese precio rebajado
        const precioUnitario =
          item.precioUnitario !== undefined && Number(item.precioUnitario) > 0
            ? Number(item.precioUnitario)
            : Number(producto.precio)

        const subtotal = precioUnitario * cantidad
        total += subtotal

        tem.create(DetallePedido, {
          pedido,
          producto,
          cantidad,
          precioUnitario,
        })
      }

      pedido.total = total
      await tem.flush()
      return pedido
    })

    const pedidoCompleto = await em.findOneOrFail(
      Pedido,
      { id: pedidoCreado.id },
      { populate: ['usuario', 'medioDePago', 'detalles', 'detalles.producto'] }
    )

    res.status(201).json({ message: 'pedido realizado', data: pedidoCompleto })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * CASO DE USO: Cambiar estado de pedido
 */
export async function cambiarEstado(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const nuevoEstado: EstadoPedido = req.body.estado

    if (!Object.values(EstadoPedido).includes(nuevoEstado)) {
      return res.status(400).json({
        message: `estado invalido. valores permitidos: ${Object.values(EstadoPedido).join(', ')}`,
      })
    }

    const pedido = await em.findOneOrFail(Pedido, { id })
    pedido.estado = nuevoEstado
    await em.flush()

    res.status(200).json({ message: 'estado actualizado', data: pedido })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const pedido = em.getReference(Pedido, id)
    await em.removeAndFlush(pedido)
    res.status(200).json({ message: 'pedido eliminado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
