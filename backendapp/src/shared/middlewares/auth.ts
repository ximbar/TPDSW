import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  id: number
  rol: 'CLIENTE' | 'ADMINISTRADOR'
}

// Express no sabe de este campo por default, lo agregamos "a mano"
declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload
    }
  }
}

// Verifica que venga un token valido en el header Authorization: Bearer <token>
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'falta iniciar sesion' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secreto') as TokenPayload
    req.usuario = payload
    next()
  } catch (error) {
    return res.status(401).json({ message: 'sesion invalida o vencida' })
  }
}

// Se usa DESPUES de verifyToken. Corta el paso si el usuario no es administrador
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.usuario?.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ message: 'esta accion requiere permisos de administrador' })
  }
  next()
}
