import { Router } from 'express'
import { findAll, findOne, findByCategoria, add, update, remove } from './producto.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const productoRouter = Router()

// lectura: publica, cualquiera puede ver el menu
productoRouter.get('/', (req, res) => {
  if (req.query.categoria) return findByCategoria(req, res)
  return findAll(req, res)
})
productoRouter.get('/:id', findOne)

// escritura: solo administradores
productoRouter.post('/', verifyToken, isAdmin, add)
productoRouter.put('/:id', verifyToken, isAdmin, update)
productoRouter.delete('/:id', verifyToken, isAdmin, remove)
