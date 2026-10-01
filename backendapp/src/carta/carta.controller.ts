import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Carta } from './carta.entity.js'

const em = orm.em

export async function findAll(req: Request, res: Response) {
  try {
    const cartas = await em.find(Carta, {}, { populate: ['productos'] })
    res.status(200).json({ message: 'cartas encontradas', data: cartas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const carta = await em.findOneOrFail(Carta, { id }, { populate: ['productos'] })
    res.status(200).json({ message: 'carta encontrada', data: carta })
  } catch (error: any) {
    res.status(404).json({ message: 'carta no encontrada' })
  }
}

export async function add(req: Request, res: Response) {
  try {
    const carta = em.create(Carta, req.body)
    await em.flush()
    res.status(201).json({ message: 'carta creada', data: carta })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const carta = await em.findOneOrFail(Carta, { id })
    em.assign(carta, req.body)
    await em.flush()
    res.status(200).json({ message: 'carta actualizada', data: carta })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const carta = em.getReference(Carta, id)
    await em.removeAndFlush(carta)
    res.status(200).json({ message: 'carta eliminada' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
