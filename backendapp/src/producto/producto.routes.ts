import { Router } from 'express'
import { findAll, findOne, findByCategoria, add, update, remove } from './producto.controller.js'

export const productoRouter = Router()

// si viene ?categoria=x filtra, si no, trae todos
productoRouter.get('/', (req, res) => {
  if (req.query.categoria) return findByCategoria(req, res)
  return findAll(req, res)
})
productoRouter.get('/:id', findOne)
productoRouter.post('/', add)
productoRouter.put('/:id', update)
productoRouter.delete('/:id', remove)
