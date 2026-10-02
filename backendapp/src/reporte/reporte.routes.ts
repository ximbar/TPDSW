import { Router } from 'express'
import { cierreCaja } from './reporte.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const reporteRouter = Router()

reporteRouter.get('/cierreCaja', verifyToken, isAdmin, cierreCaja)
