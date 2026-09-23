# Backend UTN-Eat

## Requisitos previos
- Node.js 20+
- MySQL corriendo localmente

## Instalación

```bash
cd backendapp
npm install
cp .env.example .env
```

Editá `.env` con los datos de tu base de datos MySQL (usuario, contraseña, nombre de la BD).
La base de datos tiene que existir antes de arrancar el proyecto; MikroORM crea las
tablas solo, pero no la base en sí:

```sql
CREATE DATABASE utneat;
```

## Levantar el servidor en modo desarrollo

```bash
npm run dev
```

Levanta el server en `http://localhost:3000` con recarga automática, y al arrancar
sincroniza el esquema (crea las tablas según las entidades).

## Probar el CRUD de ejemplo (Categoría)

- `GET    /api/categorias`
- `GET    /api/categorias/:id`
- `POST   /api/categorias` (body: `{ "nombre": "Bebidas", "descripcion": "..." }`)
- `PUT    /api/categorias/:id`
- `DELETE /api/categorias/:id`

## Estructura del proyecto

```
src/
  shared/db/          -> configuración de MikroORM y del EntityManager
  categoria/           -> CRUD completo (entidad + controller + rutas) — TU PLANTILLA
  usuario/              -> entidad lista, falta controller + rutas
  medioDePago/          -> entidad lista, falta controller + rutas
  producto/             -> entidad lista, falta controller + rutas
  carta/                -> entidad lista, falta controller + rutas
  pedido/                -> entidad lista, falta controller + rutas
  detallePedido/         -> entidad lista, falta controller + rutas
  app.ts                -> arma la app Express y monta las rutas
  index.ts               -> punto de entrada
```

## Cómo seguir (para cada entidad restante)

Tomá `categoria.controller.ts` y `categoria.routes.ts` como plantilla:

1. Copiá `categoria.controller.ts` a la carpeta de la entidad (ej: `usuario/usuario.controller.ts`)
   y reemplazá `Categoria` por la entidad correspondiente (ej: `Usuario`).
2. Copiá `categoria.routes.ts` de la misma forma.
3. Registrá el nuevo router en `app.ts` (descomentá las líneas correspondientes).

### Nota técnica: tipos explícitos en las entidades

Vas a notar que cada `@Property()` y `@PrimaryKey()` lleva un `type` explícito
(ej: `{ type: 'string' }`). Esto es porque el proyecto usa `tsx` para correr
TypeScript directamente, y a diferencia de `ts-node`, `tsx` no emite metadata de
tipos automáticamente. Si creás una propiedad nueva, acordate de ponerle el `type`
a mano o vas a tener errores.

### Para los CRUDs dependientes (Producto depende de Categoria, Carta depende de Producto)

```ts
export async function add(req: Request, res: Response) {
  try {
    const categoria = await em.findOneOrFail(Categoria, { id: req.body.categoria })
    const producto = em.create(Producto, { ...req.body, categoria })
    await em.flush()
    res.status(201).json({ message: 'producto creado', data: producto })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
```

### Casos de uso especiales

- **Realizar un pedido (carrito take away)**: `POST /api/pedidos` que reciba productos +
  cantidades, calcule el total y cree el Pedido con sus DetallePedido en una transacción
  (`em.transactional()`).
- **Cambiar estado de un pedido**: `PATCH /api/pedidos/:id/estado`.
