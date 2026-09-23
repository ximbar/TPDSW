import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core'
import { Categoria } from '../categoria/categoria.entity.js'
import { Carta } from '../carta/carta.entity.js'

@Entity()
export class Producto {
  @PrimaryKey({ type: 'number' })
  id!: number

  @Property({ type: 'string', nullable: false })
  nombre!: string

  @Property({ type: 'text', nullable: true })
  descripcion?: string

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precio!: number

  @ManyToOne(() => Categoria, { nullable: false })
  categoria!: Rel<Categoria>

  @ManyToOne(() => Carta, { nullable: true })
  carta?: Rel<Carta>
}
