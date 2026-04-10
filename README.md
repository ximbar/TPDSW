# Propuesta TP DSW

## Grupo
### Integrantes
* 52620 - Gomez, Celeste (Com 304)
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

<img width="1912" height="933" alt="image" src="https://github.com/user-attachments/assets/194bff58-87d3-4b1c-a12a-d3d2782e073c" />

*Link con la imagen*: https://drive.google.com/file/d/1OBiu_aYYQtGYvflXqaoManRGZXkH2aMC/view?usp=drive_link

## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Categoria <br>3. CRUD Medio de Pago|
|CRUD dependiente|1. CRUD Producto {depende de} CRUD Categoria<br>2. CRUD Carta {depende de} CRUD Producto |
|Listado<br>+<br>detalle| 1. Listado de productos filtrado por categoría, muestra nombre y precio => detalle muestra descripción completa y permite ir al CRUD de Producto.<br> 2. Listado de pedidos filtrado por estado (Pendiente, En Preparación), muestra nro, alumno y total => detalle muestra los datos completos del pedido y los productos seleccionados (Detalle)|
|CUU/Epic|1. Realizar un pedido (carrito de compras tipo Take Away)..<br>2. Cambiar el estado de un pedido (Ej: de "Pendiente" a "Listo para retirar" por parte del bar).|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Categoria<br>2. CRUD Usuario<br>3. CRUD Producto<br>4. CRUD Medio de Pago (Efectivo, MercadoPago, etc.)<br>5. CRUD Cliente<br>6. CRUD Administrador|
|CUU/Epic|1. Realizar un Pedido (Take Away)<br>2. Cambiar el estado de un pedido<br>3. Generar reporte de cierre de caja (total vendido en el dia)|


### Alcance Adicional Voluntario


|Req|Detalle|
|:-|:-|
|Listados |- <br>-|
|CUU/Epic|-<br>-|
|Otros|-|

