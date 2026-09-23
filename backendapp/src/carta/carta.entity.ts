import { Entity, PrimaryKey, Property, OneToMany, Cascade, Collection } from '@mikro-orm/core'
import { Producto } from '../producto/producto.entity.js'

@Entity()
export class Carta {
  @PrimaryKey({ type: 'number' })
  id!: number

  @Property({ type: 'string', nullable: false })
  nombre!: string

  @Property({ type: 'date', nullable: true })
  fechaVigencia?: Date

  @OneToMany(() => Producto, (producto) => producto.carta, { cascade: [Cascade.ALL] })
  productos = new Collection<Producto>(this)
}
