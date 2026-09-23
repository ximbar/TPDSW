import express from 'express'
import cors from 'cors'
import { forkEntityManager } from './shared/db/RequestContext.js'
import { categoriaRouter } from './categoria/categoria.routes.js'
// A medida que armes cada CRUD, importa su router aca:
// import { usuarioRouter } from './usuario/usuario.routes.js'
// import { productoRouter } from './producto/producto.routes.js'
// import { cartaRouter } from './carta/carta.routes.js'
// import { medioDePagoRouter } from './medioDePago/medioDePago.routes.js'
// import { pedidoRouter } from './pedido/pedido.routes.js'

export const app = express()

app.use(cors())
app.use(express.json())
app.use(forkEntityManager)

app.use('/api/categorias', categoriaRouter)
// app.use('/api/usuarios', usuarioRouter)
// app.use('/api/productos', productoRouter)
// app.use('/api/cartas', cartaRouter)
// app.use('/api/mediosDePago', medioDePagoRouter)
// app.use('/api/pedidos', pedidoRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'recurso no encontrado' })
})
