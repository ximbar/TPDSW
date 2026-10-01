import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './carta.controller.js'

export const cartaRouter = Router()

cartaRouter.get('/', findAll)
cartaRouter.get('/:id', findOne)
cartaRouter.post('/', add)
cartaRouter.put('/:id', update)
cartaRouter.delete('/:id', remove)
