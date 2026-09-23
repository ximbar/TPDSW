import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Categoria {
  @PrimaryKey({ type: 'number' })
  id!: number

  @Property({ type: 'string', nullable: false })
  nombre!: string

  @Property({ type: 'string', nullable: true })
  descripcion?: string
}
