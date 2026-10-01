import { Router } from 'express'
import { findAll, findOne, realizarPedido, cambiarEstado, remove } from './pedido.controller.js'

export const pedidoRouter = Router()

pedidoRouter.get('/', findAll) // soporta ?estado=PENDIENTE
pedidoRouter.get('/:id', findOne)
pedidoRouter.post('/', realizarPedido) // caso de uso: realizar pedido (carrito)
pedidoRouter.patch('/:id/estado', cambiarEstado) // caso de uso: cambiar estado
pedidoRouter.delete('/:id', remove)
