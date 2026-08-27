uwu# Backend UTN-Eat
## Requisitos previos
- Node.js 20+
- MySQL corriendo localmente (o Docker) , de momento vamos a usar MySQL total estamos probando 


Aca dejo un tutorial de como instalar la BD , chequen los comandos porque yo lo hago en linux y los puse para mi ahora.
No se si cd o cp sea igual en la terminal por windows.

## Instalación

```bash 
cd backendapp
npm install
cp .env.example .env
```

Editá `.env` con los datos de tu base de datos MySQL (usuario, contraseña, nombre de la BD).
La base de datos (`utneat` u otro nombre que elijas) tiene que existir antes de arrancar
el proyecto; MikroORM crea las tablas solo, pero no la base en sí. Podés crearla con:

```sql
CREATE DATABASE utneat;
```

## Levantar el servidor en modo desarrollo

```bash
npm run dev
```

Esto levanta el server en `http://localhost:3000` con recarga automática, y al arrancar
sincroniza el esquema (crea las tablas según las entidades).

## Probar el CRUD de ejemplo (Categoría)

Con Postman, Thunder Client o curl:

- `GET    /api/categorias` — listar todas
- `GET    /api/categorias/:id` — obtener una
- `POST   /api/categorias` — crear (body: `{ "nombre": "Bebidas", "descripcion": "..." }`)
- `PUT    /api/categorias/:id` — actualizar
- `DELETE /api/categorias/:id` — eliminar

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
3. Registrá el nuevo router en `app.ts` (ya están las líneas comentadas, solo hay que
   descomentarlas y agregar el import).

### Para los CRUDs dependientes (Producto depende de Categoria, Carta depende de Producto)

En el `add` (POST), en vez de mandar `req.body` directo a `em.create`, hay que resolver
la entidad relacionada primero. Ejemplo para Producto:

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

### Casos de uso especiales (no son CRUD simple)

- **Realizar un pedido (carrito take away)**: un endpoint `POST /api/pedidos` que reciba
  una lista de productos + cantidades, calcule el total y cree el Pedido junto con sus
  DetallePedido en una sola operación (usando `em.transactional()` de MikroORM).
- **Cambiar estado de un pedido**: un endpoint específico, ej. `PATCH /api/pedidos/:id/estado`,
  que reciba el nuevo estado y actualice solo ese campo (con validación de qué transiciones
  de estado son válidas).