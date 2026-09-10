# MascotICA's - Panel Admin (version simplificada Web)

Segundo avance del proyecto: sistema de adopcion de mascotas y venta de
insumos, reescrito como una aplicacion **100% HTML + CSS + JavaScript**,
sin backend, sin base de datos externa y sin necesidad de instalar Java,
Maven ni nada. Los datos se guardan en el propio navegador
(`localStorage`), y la app conserva **todas las funciones** de la version
anterior (Spring Boot + Thymeleaf + H2).

## Como ejecutarlo (dar "run")

- **Windows:** doble clic en `run.bat`
- **Mac:** doble clic en `run.command`
- **Linux:** doble clic en `run.sh` (o `./run.sh` desde la terminal)

Cualquiera de los tres abre automaticamente `index.html` en tu navegador
por defecto. No hace falta levantar ningun servidor.

> Alternativa: tambien puedes abrir `index.html` directamente
> haciendole doble clic desde el explorador de archivos.

## Usuarios de prueba

| Rol      | Correo               | Contrasena |
|----------|-----------------------|------------|
| Admin    | admin@albergue.com    | admin123   |
| Cliente  | cliente@correo.com    | 123456     |

## Estructura del proyecto

```
petshop-web/
├── index.html                 # Punto de entrada, redirige segun sesion
├── login.html                 # Inicio de sesion
├── run.bat / run.sh / run.command   # Lanzadores (abren el navegador)
├── css/
│   └── styles.css             # Estilos generales de toda la app
├── js/
│   ├── storage.js             # "Base de datos" en localStorage + CRUD
│   ├── auth.js                # Sesion y proteccion de rutas por rol
│   └── ui.js                  # Navbar dinamico, alertas, helpers
├── admin/                     # Panel de administrador (rol ADMIN)
│   ├── dashboard.html         # Estadisticas generales
│   ├── mascotas.html          # Listado + filtro por estado
│   ├── mascota-form.html      # Alta / edicion de mascota
│   ├── productos.html         # Listado + filtro por categoria
│   ├── producto-form.html     # Alta / edicion de producto
│   └── solicitudes.html       # Aprobar / rechazar solicitudes
└── catalogo/                  # Vista del cliente (rol CLIENTE)
    ├── index.html              # Catalogo de mascotas y productos
    └── mis-solicitudes.html    # Historial de solicitudes propias
```

## Funciones incluidas

- **Login / Logout** con roles `ADMIN` y `CLIENTE`.
- **Dashboard admin**: total de mascotas, disponibles/adoptadas,
  productos en catalogo y solicitudes pendientes.
- **Mascotas (admin)**: crear, editar, eliminar, filtrar por estado
  y cambiar estado (`DISPONIBLE`, `EN_PROCESO`, `ADOPTADO`).
- **Productos (admin)**: crear, editar, eliminar, filtrar por
  categoria (`ALIMENTO`, `HIGIENE`), control de stock.
- **Solicitudes (admin)**: listar, filtrar por estado, aprobar o
  rechazar solicitudes de adopcion/compra.
- **Catalogo (cliente)**: ver mascotas disponibles y productos con
  stock, enviar solicitud de adopcion o de compra.
- **Mis solicitudes (cliente)**: ver el estado de las solicitudes
  propias.
- **Reglas de negocio** identicas a la version Spring Boot:
  - Al solicitar una adopcion, la mascota pasa a `EN_PROCESO`.
  - Al aprobar la adopcion, pasa a `ADOPTADO`; al rechazarla, vuelve
    a `DISPONIBLE`.
  - Al solicitar una compra se valida el stock disponible (no se
    descuenta todavia).
  - Al aprobar la compra se descuenta el stock; al rechazarla, no se
    modifica.

## Nota sobre los datos

Los datos (usuarios, mascotas, productos y solicitudes) se guardan en
el `localStorage` del navegador que uses, por lo que persisten entre
sesiones en ese mismo navegador/equipo. Si quieres reiniciar todo a
los datos de prueba originales, abre la consola del navegador (F12) y
ejecuta:

```js
localStorage.clear();
```

y recarga la pagina.
