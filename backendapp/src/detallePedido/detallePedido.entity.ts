import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core'
import { Pedido } from '../pedido/pedido.entity.js'
import { Producto } from '../producto/producto.entity.js'

@Entity()
export class DetallePedido {
  @PrimaryKey({ type: 'number' })
  id!: number

  @ManyToOne(() => Pedido, { nullable: false })
  pedido!: Rel<Pedido>

  @ManyToOne(() => Producto, { nullable: false })
  producto!: Rel<Producto>

  @Property({ type: 'number', nullable: false })
  cantidad!: number

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precioUnitario!: number
}
