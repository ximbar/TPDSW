import { Router } from 'express'
import { findAll, findOne, findByCategoria, add, update, remove } from './producto.controller.js'
import { verifyToken, isAdmin } from '../shared/middlewares/auth.js'

export const productoRouter = Router()

// Búsqueda de imágenes en la web (DEBE IR ANTES DE /:id)
productoRouter.get('/buscar-imagen', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
    }

    const urlBusqueda = `https://duckduckgo.com/i.js?l=es-es&o=json&q=${encodeURIComponent(q + ' comida plato')}`;
    const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`);
    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=['"]([^'"]+)['"]/);
    const vqd = vqdMatch ? vqdMatch[1] : '';

    const imageRes = await fetch(`${urlBusqueda}&vqd=${vqd}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const data = await imageRes.json();
    const resultados = (data.results || []).slice(0, 6).map((item: any) => item.image);

    if (resultados.length === 0) {
      const fallback = [
        `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600`,
        `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600`,
      ];
      return res.json({ data: fallback });
    }

    res.json({ data: resultados });
  } catch (error: any) {
    console.error('Error buscando imágenes web:', error);
    res.status(500).json({ message: 'Error al buscar imágenes en la web', data: [] });
  }
});

// Lectura: publica, cualquiera puede ver el menu
productoRouter.get('/', (req, res) => {
  if (req.query.categoria) return findByCategoria(req, res)
  return findAll(req, res)
})

productoRouter.get('/:id', findOne)

// Escritura: solo administradores
productoRouter.post('/', verifyToken, isAdmin, add)
productoRouter.put('/:id', verifyToken, isAdmin, update)
productoRouter.delete('/:id', verifyToken, isAdmin, remove)