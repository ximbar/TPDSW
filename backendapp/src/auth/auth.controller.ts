import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { orm } from '../shared/db/orm.js'
import { Usuario, RolUsuario } from '../usuario/usuario.entity.js'

const em = orm.em

function generarToken(usuario: Usuario) {
  return jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET || 'secreto', {
    expiresIn: '7d',
  })
}

// nunca devolvemos el hash de la contraseña al frontend
function usuarioSinPassword(usuario: Usuario) {
  const { password, ...resto } = usuario
  return resto
}

// POST /api/auth/register - cualquier persona se puede registrar, siempre como CLIENTE
export async function register(req: Request, res: Response) {
  try {
    const { nombre, email, password } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'nombre, email y password son obligatorios' })
    }
    if (password.length < 4) {
      return res.status(400).json({ message: 'la contraseña debe tener al menos 4 caracteres' })
    }

    const existente = await em.findOne(Usuario, { email })
    if (existente) {
      return res.status(409).json({ message: 'ya existe una cuenta con ese email' })
    }

    const passwordHasheada = await bcrypt.hash(password, 10)
    const usuario = em.create(Usuario, {
      nombre,
      email,
      password: passwordHasheada,
      rol: RolUsuario.CLIENTE, // nadie se puede auto-asignar ADMINISTRADOR desde el registro
    })
    await em.flush()

    const token = generarToken(usuario)
    res.status(201).json({
      message: 'cuenta creada',
      data: { usuario: usuarioSinPassword(usuario), token },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const usuario = await em.findOne(Usuario, { email })
    if (!usuario) {
      return res.status(401).json({ message: 'email o contraseña incorrectos' })
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password)
    if (!passwordCorrecta) {
      return res.status(401).json({ message: 'email o contraseña incorrectos' })
    }

    const token = generarToken(usuario)
    res.status(200).json({
      message: 'sesion iniciada',
      data: { usuario: usuarioSinPassword(usuario), token },
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
