import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './usuario.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const usuarioRouter = Router()

// gestion de cuentas: solo administradores (el alta normal de un cliente es /api/auth/register)
usuarioRouter.get('/', verifyToken, isAdmin, findAll)
usuarioRouter.get('/:id', verifyToken, isAdmin, findOne)
usuarioRouter.post('/', verifyToken, isAdmin, add)
usuarioRouter.put('/:id', verifyToken, isAdmin, update)
usuarioRouter.delete('/:id', verifyToken, isAdmin, remove)
