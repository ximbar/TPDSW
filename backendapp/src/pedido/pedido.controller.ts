import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Pedido, EstadoPedido } from './pedido.entity.js'
import { DetallePedido } from '../detallePedido/detallePedido.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { MedioDePago } from '../medioDePago/medioDePago.entity.js'
import { Producto } from '../producto/producto.entity.js'

const em = orm.em

// GET /api/pedidos  -> lista todos
// GET /api/pedidos?estado=PENDIENTE -> lista filtrada por estado (pedido del enunciado)
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
 *
 * Requiere estar logueado (ver middleware verifyToken en las rutas).
 * El usuario del pedido se toma del TOKEN, no del body: así nadie puede
 * hacer un pedido a nombre de otra persona mandando un id distinto.
 *
 * Body esperado:
 * {
 *   "medioDePago": 1,
 *   "items": [
 *     { "producto": 1, "cantidad": 2 },
 *     { "producto": 3, "cantidad": 1 }
 *   ]
 * }
 *
 * No confiamos en el precio que mande el cliente: lo buscamos nosotros en la
 * base para cada producto, así evitamos que alguien lo manipule desde el front.
 */
export async function realizarPedido(req: Request, res: Response) {
  const usuarioId = req.usuario!.id // viene del token (verifyToken ya lo validó)
  const { medioDePago, items } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'el pedido necesita al menos un producto (items)' })
  }

  try {
    // em.transactional agrupa todo en una transacción:
    // si algo falla a mitad de camino, se revierte TODO (no queda un pedido a medias)
    const pedidoCreado = await em.transactional(async (tem) => {
      const usuarioEntity = await tem.findOneOrFail(Usuario, { id: usuarioId })
      const medioDePagoEntity = await tem.findOneOrFail(MedioDePago, { id: medioDePago })

      const pedido = tem.create(Pedido, {
        usuario: usuarioEntity,
        medioDePago: medioDePagoEntity,
        estado: EstadoPedido.PENDIENTE,
        fecha: new Date(),
        total: 0, // se recalcula abajo
      })

      let total = 0

      for (const item of items) {
        const producto = await tem.findOneOrFail(Producto, { id: item.producto })
        const cantidad = Number(item.cantidad)

        if (!cantidad || cantidad <= 0) {
          throw new Error(`cantidad invalida para el producto ${producto.id}`)
        }

        const subtotal = Number(producto.precio) * cantidad
        total += subtotal

        tem.create(DetallePedido, {
          pedido,
          producto,
          cantidad,
          precioUnitario: producto.precio, // precio "congelado" al momento del pedido
        })
      }

      pedido.total = total
      await tem.flush()
      return pedido
    })

    // recargamos el pedido ya creado con sus relaciones para devolverlo completo
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
 * PATCH /api/pedidos/:id/estado   body: { "estado": "EN_PREPARACION" }
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
