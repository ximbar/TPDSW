import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './medioDePago.controller.js'

export const medioDePagoRouter = Router()

medioDePagoRouter.get('/', findAll)
medioDePagoRouter.get('/:id', findOne)
medioDePagoRouter.post('/', add)
medioDePagoRouter.put('/:id', update)
medioDePagoRouter.delete('/:id', remove)
