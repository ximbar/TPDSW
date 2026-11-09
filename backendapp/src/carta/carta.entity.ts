import { Entity, Property, PrimaryKey, ManyToMany, Collection } from '@mikro-orm/core';
import { Producto } from '../producto/producto.entity.js';

@Entity({ tableName: 'carta' })
export class Carta {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string', nullable: false })
  nombre!: string;

  @Property({ type: 'date', nullable: true })
  fecha_vigencia?: string;
  
  @Property({ type: 'number', default: 0 })
  descuento: number = 0;

  @ManyToMany({
    entity: () => Producto,
    pivotTable: 'carta_productos',
    joinColumn: 'carta_id',
    inverseJoinColumn: 'producto_id',
    owner: true,
  })
  productos = new Collection<Producto>(this);
}