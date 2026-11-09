import { Request, Response } from 'express';
import { orm } from '../shared/db/orm.js';
import { Carta } from './carta.entity.js';
import { Producto } from '../producto/producto.entity.js';

const em = orm.em;

export async function findAll(req: Request, res: Response) {
  try {
    const cartas = await em.find(Carta, {}, { populate: ['productos'] });
    res.status(200).json({ data: cartas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const carta = await em.findOneOrFail(Carta, { id }, { populate: ['productos'] });
    res.status(200).json({ data: carta });
  } catch (error: any) {
    res.status(404).json({ message: 'Carta no encontrada' });
  }
}

export async function add(req: Request, res: Response) {
  try {
    // 1. Extraemos descuento del req.body
    const { nombre, fecha_vigencia, productosIds, descuento } = req.body;

    const carta = em.create(Carta, {
      nombre,
      fecha_vigencia: fecha_vigencia || undefined,
      descuento: Number(descuento) || 0, // 2. Se lo asignamos a la entidad
    });

    if (Array.isArray(productosIds) && productosIds.length > 0) {
      const productos = await em.find(Producto, { id: { $in: productosIds } });
      carta.productos.set(productos);
    }

    await em.flush();
    res.status(201).json({ message: 'Carta creada exitosamente', data: carta });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const carta = await em.findOneOrFail(Carta, { id }, { populate: ['productos'] });

    // 1. Extraemos descuento del req.body
    const { nombre, fecha_vigencia, productosIds, descuento } = req.body;

    carta.nombre = nombre ?? carta.nombre;
    if (fecha_vigencia !== undefined) {
      carta.fecha_vigencia = fecha_vigencia || undefined;
    }
    // 2. Si viene descuento, lo actualizamos
    if (descuento !== undefined) {
      carta.descuento = Number(descuento) || 0;
    }

    if (Array.isArray(productosIds)) {
      const productos = await em.find(Producto, { id: { $in: productosIds } });
      carta.productos.set(productos);
    }

    await em.flush();
    res.status(200).json({ message: 'Carta actualizada exitosamente', data: carta });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const carta = await em.findOneOrFail(Carta, { id });
    await em.removeAndFlush(carta);
    res.status(200).json({ message: 'Carta eliminada exitosamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
