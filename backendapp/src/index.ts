import 'dotenv/config'
import { app } from './app.js'
import { syncSchema } from './shared/db/orm.js'

const PORT = process.env.PORT || 3000

await syncSchema()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
