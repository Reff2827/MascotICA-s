# MascotICA's

Sistema web para la gestión de adopción de mascotas y venta de productos para mascotas.

El proyecto está desarrollado con **HTML, CSS y JavaScript**, utilizando **Supabase** como servicio backend. Supabase proporciona la autenticación de usuarios, la base de datos PostgreSQL y las políticas de seguridad mediante Row Level Security (RLS).

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Supabase
- PostgreSQL, proporcionado mediante Supabase
- Supabase Auth para autenticación
- Supabase Storage para almacenamiento de archivos e imágenes

No es necesario instalar Java, Maven, Spring Boot, MySQL ni PostgreSQL localmente.

## Cómo ejecutar el proyecto

El proyecto puede ejecutarse desde el navegador o mediante un servidor local.

### Opción recomendada

Abrir el proyecto en Visual Studio Code y utilizar una extensión como **Live Server** para ejecutar `index.html`.

Para que las funciones conectadas a Supabase trabajen correctamente, se debe contar con la configuración correspondiente en:

`js/supabaseClient.js`

## Autenticación

La autenticación se realiza mediante **Supabase Auth**.

El proceso de inicio de sesión utiliza:

1. Correo electrónico.
2. Contraseña.
3. Código PIN enviado al correo electrónico.
4. Verificación del código mediante Supabase.

Los perfiles de usuario se almacenan en la tabla `perfiles` y pueden tener uno de los siguientes roles:

- `ADMIN`
- `CLIENTE`

El registro de nuevos usuarios crea automáticamente su perfil mediante un trigger de Supabase.

## Base de datos

La información principal del sistema se almacena en **PostgreSQL mediante Supabase**.

No es necesario instalar PostgreSQL de forma local, ya que la base de datos es administrada desde el proyecto de Supabase.

### Tablas principales

#### `perfiles`

Almacena la información adicional de los usuarios autenticados.

Campos principales:

- `id`
- `nombre`
- `rol`

#### `mascotas`

Almacena las mascotas disponibles para adopción.

Campos principales:

- `id_mascota`
- `nombre`
- `especie`
- `raza`
- `edad`
- `estado`
- `imagen_url`

Estados disponibles:

- `DISPONIBLE`
- `EN_PROCESO`
- `ADOPTADO`

#### `productos`

Almacena los productos disponibles para la venta.

Campos principales:

- `id_producto`
- `nombre`
- `categoria`
- `precio`
- `stock`
- `imagen_url`

Categorías:

- `ALIMENTO`
- `HIGIENE`

#### `solicitudes`

Registra las solicitudes realizadas por los clientes.

Campos principales:

- `id_solicitud`
- `id_usuario`
- `tipo`
- `ref_id`
- `cantidad`
- `fecha`
- `estado`
- `evaluacion`

Tipos de solicitud:

- `ADOPCION`
- `COMPRA`

Estados:

- `PENDIENTE`
- `APROBADA`
- `RECHAZADA`

## Seguridad

El proyecto utiliza **Row Level Security (RLS)** de Supabase.

Las principales reglas son:

- Los usuarios pueden consultar su propio perfil.
- Los administradores pueden gestionar mascotas y productos.
- Las mascotas y productos pueden ser consultados públicamente.
- Los clientes pueden crear sus propias solicitudes.
- Los clientes pueden consultar sus propias solicitudes.
- Los administradores pueden consultar y gestionar las solicitudes.

Además, se utiliza la función `es_admin()` para validar los permisos administrativos.

## Estructura del proyecto

```text
Mascoticas/
├── index.html
├── login.html
├── README.md
│
├── admin/
│   ├── dashboard.html
│   ├── mascotas.html
│   ├── mascota-form.html
│   ├── productos.html
│   ├── producto-form.html
│   └── solicitudes.html
│
├── cliente/
│   ├── index.html
│   └── mis-solicitudes.html
│
├── css/
│   └── styles.css
│
├── js/
│   ├── auth.js
│   ├── storage.js
│   ├── supabaseClient.js
│   ├── ui.js
│   └── theme.js
│
└── img/
    ├── mascotas/
    └── productos/