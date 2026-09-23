import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class MedioDePago {
  @PrimaryKey({ type: 'number' })
  id!: number

  @Property({ type: 'string', nullable: false })
  nombre!: string
}
