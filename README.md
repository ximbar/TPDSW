# Propuesta TP DSW

## Grupo
### Integrantes
* 52320 - Gomez, Celeste (Com 304)
* 52571 - Ferzola, Ornella (Com 301)
* 53072 - Deatriz, Esteban (Com 304)

### Repositorios
* [frontend app](./backendapp/)
* [backend app](./frontendapp/)

## Tema
### Descripción
UTN-Eat es una aplicación web desarrollada para digitalizar y optimizar la experiencia en el bar de la Facultad. 
Este proyecto nace con el objetivo de evitar las largas filas y la saturación de pedidos durante los recreos, ofreciendo una comunicacion directa entre los estudiantes y el personal del bar.

### Modelo
<img width="1896" height="1020" alt="image" src="https://github.com/user-attachments/assets/9da4da6a-0f64-4cb7-bff9-55f96d445e0b" />


*Link con la imagen*: https://drive.google.com/file/d/1OBiu_aYYQtGYvflXqaoManRGZXkH2aMC/view?usp=drive_link

## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Categoria|
|CRUD dependiente|1. CRUD Producto {depende de} CRUD Categoria<br> |
|Listado<br>+<br>detalle| 1. Listado de productos filtrado por categoría, muestra nombre y precio => detalle muestra descripción completa y permite ir al CRUD de Producto.<br> 2. Listado de pedidos filtrado por estado (Pendiente, En Preparación), muestra nro, alumno y total => detalle muestra los datos completos del pedido y los productos seleccionados (Detalle)|
|CUU/Epic|1. Realizar un pedido (carrito de compras tipo Take Away)..<br>2. Cambiar el estado de un pedido (Ej: de "Pendiente" a "Listo para retirar" por parte del bar).|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Categoria<br>2. CRUD Usuario<br>3. CRUD Producto<br>4. CRUD Medio de Pago (Efectivo, MercadoPago, etc.)<br>5. CRUD Cliente<br>6. CRUD Administrador|
|CUU/Epic|1. Realizar un Pedido (Take Away)<br>2. Cambiar el estado de un pedido<br>3. Generar reporte de cierre de caja (total vendido en el dia)|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Listados |- <br>-|
|CUU/Epic|-<br>-|
|Otros|-|

