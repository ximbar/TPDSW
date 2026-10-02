import { Router } from 'express'
import {
  findAll,
  findOne,
  findMisPedidos,
  realizarPedido,
  cambiarEstado,
  remove,
} from './pedido.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const pedidoRouter = Router()

pedidoRouter.get('/mios', verifyToken, findMisPedidos) // el cliente ve sus propios pedidos
pedidoRouter.get('/', verifyToken, isAdmin, findAll) // el admin ve todos (soporta ?estado=PENDIENTE)
pedidoRouter.get('/:id', verifyToken, findOne)
pedidoRouter.post('/', verifyToken, realizarPedido) // cualquier usuario logueado puede pedir
pedidoRouter.patch('/:id/estado', verifyToken, isAdmin, cambiarEstado) // solo admin cambia estados
pedidoRouter.delete('/:id', verifyToken, isAdmin, remove)
