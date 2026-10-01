import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { MedioDePago } from './medioDePago.entity.js'

const em = orm.em

export async function findAll(req: Request, res: Response) {
  try {
    const mediosDePago = await em.find(MedioDePago, {})
    res.status(200).json({ message: 'medios de pago encontrados', data: mediosDePago })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const medioDePago = await em.findOneOrFail(MedioDePago, { id })
    res.status(200).json({ message: 'medio de pago encontrado', data: medioDePago })
  } catch (error: any) {
    res.status(404).json({ message: 'medio de pago no encontrado' })
  }
}

export async function add(req: Request, res: Response) {
  try {
    const medioDePago = em.create(MedioDePago, req.body)
    await em.flush()
    res.status(201).json({ message: 'medio de pago creado', data: medioDePago })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const medioDePago = await em.findOneOrFail(MedioDePago, { id })
    em.assign(medioDePago, req.body)
    await em.flush()
    res.status(200).json({ message: 'medio de pago actualizado', data: medioDePago })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const medioDePago = em.getReference(MedioDePago, id)
    await em.removeAndFlush(medioDePago)
    res.status(200).json({ message: 'medio de pago eliminado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
