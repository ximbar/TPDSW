import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './categoria.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const categoriaRouter = Router()

categoriaRouter.get('/', findAll)
categoriaRouter.get('/:id', findOne)
categoriaRouter.post('/', verifyToken, isAdmin, add)
categoriaRouter.put('/:id', verifyToken, isAdmin, update)
categoriaRouter.delete('/:id', verifyToken, isAdmin, remove)
