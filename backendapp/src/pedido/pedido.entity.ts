import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Enum, Collection, Cascade, Rel } from '@mikro-orm/core'
import { Usuario } from '../usuario/usuario.entity.js'
import { MedioDePago } from '../medioDePago/medioDePago.entity.js'
import { DetallePedido } from '../detallePedido/detallePedido.entity.js'

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO_PARA_RETIRAR = 'LISTO_PARA_RETIRAR',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

@Entity()
export class Pedido {
  @PrimaryKey({ type: 'number' })
  id!: number

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>

  @ManyToOne(() => MedioDePago, { nullable: false })
  medioDePago!: Rel<MedioDePago>

  @Enum(() => EstadoPedido)
  estado: EstadoPedido = EstadoPedido.PENDIENTE

  @Property({ type: 'date', nullable: false })
  fecha: Date = new Date()

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total!: number

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, { cascade: [Cascade.ALL] })
  detalles = new Collection<DetallePedido>(this)
}
