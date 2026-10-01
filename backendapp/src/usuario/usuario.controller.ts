import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Usuario } from './usuario.entity.js'

const em = orm.em

export async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(Usuario, {})
    res.status(200).json({ message: 'usuarios encontrados', data: usuarios })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, { id })
    res.status(200).json({ message: 'usuario encontrado', data: usuario })
  } catch (error: any) {
    res.status(404).json({ message: 'usuario no encontrado' })
  }
}

export async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body)
    await em.flush()
    res.status(201).json({ message: 'usuario creado', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, { id })
    em.assign(usuario, req.body)
    await em.flush()
    res.status(200).json({ message: 'usuario actualizado', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const usuario = em.getReference(Usuario, id)
    await em.removeAndFlush(usuario)
    res.status(200).json({ message: 'usuario eliminado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
