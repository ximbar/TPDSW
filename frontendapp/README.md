# Frontend UTN-Eat

App en React (Vite) para el flujo del cliente: ver productos por categoría, armar
un carrito y confirmar el pedido.

## Requisitos
- Node.js 20+
- El backend corriendo en `http://localhost:3000` (ver `backendapp/README.md`)

## Instalación

```bash
cd frontendapp
npm install
cp .env.example .env
```

El `.env` solo necesita `VITE_API_URL`, que ya viene apuntando a
`http://localhost:3000`. Si tu backend corre en otro puerto, cambialo ahí.

## Levantar en modo desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:5173`. Necesita que el backend esté corriendo
al mismo tiempo (en otra terminal) para poder traer categorías, productos,
usuarios y medios de pago.

## Cómo está armado

```
src/
  api/client.js        -> todas las llamadas a la API en un solo lugar
  components/
    Header.jsx           -> logo + botón del carrito
    CategoryTabs.jsx      -> pestañas de categorías
    ProductGrid.jsx        -> grilla que lista productos de ProductCard
    ProductCard.jsx          -> una tarjeta de producto con selector de cantidad
    CartDrawer.jsx            -> panel lateral: carrito + checkout + confirmación
  App.jsx                -> arma el estado (carrito, categoría activa) y conecta todo
  styles.css              -> toda la identidad visual (colores, tipografía)
```

## Flujo que cubre

1. Al entrar, carga las categorías y selecciona la primera automáticamente
2. Al elegir una categoría, trae los productos de esa categoría (`GET /api/productos?categoria=`)
3. "Agregar" suma el producto al carrito (con la cantidad elegida) y abre el panel
4. En el panel, elegís usuario y medio de pago (no hay login real todavía, se elige de una lista)
5. "Confirmar pedido" llama a `POST /api/pedidos` y muestra el número de pedido y el total

## Qué le falta para estar completo (fuera del alcance de esta primera versión)

- Login real (hoy se elige el usuario de un dropdown)
- Pantallas de administración (crear/editar categorías, productos, etc. — hoy
  solo se usan vía `curl` o Postman contra el backend)
- Ver el estado del propio pedido después de confirmarlo
