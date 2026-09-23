import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core'

export enum RolUsuario {
  CLIENTE = 'CLIENTE',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

@Entity()
export class Usuario {
  @PrimaryKey({ type: 'number' })
  id!: number

  @Property({ type: 'string', nullable: false })
  nombre!: string

  @Property({ type: 'string', nullable: false, unique: true })
  email!: string

  @Property({ type: 'string', nullable: false })
  password!: string

  @Enum(() => RolUsuario)
  rol!: RolUsuario
}
