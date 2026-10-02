import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './medioDePago.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const medioDePagoRouter = Router()

medioDePagoRouter.get('/', findAll)
medioDePagoRouter.get('/:id', findOne)
medioDePagoRouter.post('/', verifyToken, isAdmin, add)
medioDePagoRouter.put('/:id', verifyToken, isAdmin, update)
medioDePagoRouter.delete('/:id', verifyToken, isAdmin, remove)
