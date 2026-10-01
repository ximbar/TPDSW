import { Router } from 'express'
import { cierreCaja } from './reporte.controller.js'

export const reporteRouter = Router()

reporteRouter.get('/cierreCaja', cierreCaja)
