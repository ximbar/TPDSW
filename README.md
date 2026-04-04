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
![imagen del modelo]()



*Nota*: incluir un link con la imagen de un modelo, puede ser modelo de dominio, diagrama de clases, DER. Si lo prefieren pueden utilizar diagramas con [Mermaid](https://mermaid.js.org) en lugar de imágenes.

## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Categoria|
|CRUD dependiente|1. CRUD Producto {depende de} CRUD Categoria<br> |
|Listado<br>+<br>detalle| 1. Listado de habitaciones filtrado por tipo de habitación, muestra nro y tipo de habitación => detalle CRUD Habitacion<br> 2. Listado de reservas filtrado por rango de fecha, muestra nro de habitación, fecha inicio y fin estadía, estado y nombre del cliente => detalle muestra datos completos de la reserva y del cliente|
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

