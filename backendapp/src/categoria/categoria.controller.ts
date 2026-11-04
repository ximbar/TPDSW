import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Producto } from '../producto/producto.entity.js'
import { Categoria } from './categoria.entity.js'

const em = orm.em

export async function findAll(req: Request, res: Response) {
  try {
    const categorias = await em.find(Categoria, {})
    res.status(200).json({ message: 'categorias encontradas', data: categorias })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const categoria = await em.findOneOrFail(Categoria, { id })
    res.status(200).json({ message: 'categoria encontrada', data: categoria })
  } catch (error: any) {
    res.status(404).json({ message: 'categoria no encontrada' })
  }
}

export async function add(req: Request, res: Response) {
  try {
    const categoria = em.create(Categoria, req.body)
    await em.flush()
    res.status(201).json({ message: 'categoria creada', data: categoria })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const categoria = await em.findOneOrFail(Categoria, { id })
    em.assign(categoria, req.body)
    await em.flush()
    res.status(200).json({ message: 'categoria actualizada', data: categoria })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);

    const categoria = await em.findOne(Categoria, { id });
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const cantidadProductos = await em.count(Producto, { categoria: id });
    if (cantidadProductos > 0) {
      return res.status(400).json({
        message: `No se puede eliminar la categoría porque tiene ${cantidadProductos} producto(s) asignado(s). Reasigne o elimine esos productos primero.`
      });
    }

    await em.removeAndFlush(categoria);
    res.status(200).json({ message: 'Categoría eliminada con éxito' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al eliminar la categoría' });
  }
}
