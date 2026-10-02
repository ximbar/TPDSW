import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './carta.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const cartaRouter = Router()

cartaRouter.get('/', findAll)
cartaRouter.get('/:id', findOne)
cartaRouter.post('/', verifyToken, isAdmin, add)
cartaRouter.put('/:id', verifyToken, isAdmin, update)
cartaRouter.delete('/:id', verifyToken, isAdmin, remove)
