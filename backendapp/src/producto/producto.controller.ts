import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Producto } from './producto.entity.js'
import { Categoria } from '../categoria/categoria.entity.js'
import { Carta } from '../carta/carta.entity.js'

const em = orm.em

export async function findAll(req: Request, res: Response) {
  try {
    // populate trae tambien los datos de categoria y carta, no solo el id
    const productos = await em.find(Producto, {}, { populate: ['categoria', 'carta'] })
    res.status(200).json({ message: 'productos encontrados', data: productos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// GET /api/productos?categoria=3 -> lista filtrada por categoria (pedido del enunciado)
export async function findByCategoria(req: Request, res: Response) {
  try {
    const categoriaId = Number.parseInt(req.query.categoria as string)
    const productos = await em.find(Producto, { categoria: categoriaId }, { populate: ['categoria'] })
    res.status(200).json({ message: 'productos encontrados', data: productos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const producto = await em.findOneOrFail(Producto, { id }, { populate: ['categoria', 'carta'] })
    res.status(200).json({ message: 'producto encontrado', data: producto })
  } catch (error: any) {
    res.status(404).json({ message: 'producto no encontrado' })
  }
}

export async function add(req: Request, res: Response) {
  try {
    const categoria = await em.findOneOrFail(Categoria, { id: req.body.categoria })
    const carta = req.body.carta ? await em.findOneOrFail(Carta, { id: req.body.carta }) : undefined

    const producto = em.create(Producto, { ...req.body, categoria, carta })
    await em.flush()
    res.status(201).json({ message: 'producto creado', data: producto })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const producto = await em.findOneOrFail(Producto, { id })

    if (req.body.categoria) {
      req.body.categoria = await em.findOneOrFail(Categoria, { id: req.body.categoria })
    }
    if (req.body.carta) {
      req.body.carta = await em.findOneOrFail(Carta, { id: req.body.carta })
    }

    em.assign(producto, req.body)
    await em.flush()
    res.status(200).json({ message: 'producto actualizado', data: producto })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const producto = em.getReference(Producto, id)
    await em.removeAndFlush(producto)
    res.status(200).json({ message: 'producto eliminado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
