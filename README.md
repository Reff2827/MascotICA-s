# MascotICA's

Sistema web para la gestión de adopción de mascotas, venta de productos para mascotas y reporte de mascotas abandonadas.

El proyecto está desarrollado con **HTML, CSS y JavaScript**, utilizando **Supabase** como servicio backend. Supabase proporciona la autenticación de usuarios, la base de datos PostgreSQL, el almacenamiento de imágenes, la actualización en tiempo real, las políticas de seguridad (Row Level Security) y las funciones Edge para el pago en línea.

## Funcionalidades

### Cliente

- Registro e inicio de sesión con correo, contraseña y código PIN.
- Consulta de mascotas disponibles y solicitud de adopción con documento de identidad (DNI o CE), fecha de nacimiento (mayor de 18 años) y evaluación de adopción responsable.
- **MascotICA's Match:** cuestionario de 8 preguntas que recomienda mascotas compatibles, con porcentaje de coincidencia y razones. Al ingresar se muestra una invitación para probarlo.
- Catálogo de productos con stock, carrito de compras y pedidos.
- Pago en línea con **Izipay** y **boleta digital** con código QR (consultable e imprimible).
- Consulta de sus solicitudes y pedidos en «Mis solicitudes».
- Ficha digital de adopción con código QR y ficha pública (QR / NFC) sin datos personales.
- Reporte de mascotas abandonadas con fotos y ubicación, y mapa de reportes en tiempo real.

### Administrador

- Dashboard con estadísticas, solicitudes pendientes y alertas de stock bajo.
- Gestión de mascotas y productos (registrar, editar, eliminar).
- Gestión de solicitudes de adopción (aprobar o rechazar).
- Gestión de pedidos de compra, con estado, comprador y boleta.
- Gestión de reportes de mascotas abandonadas.

## Tecnologías utilizadas

- HTML5, CSS3 y JavaScript
- Bootstrap 5 y Bootstrap Icons
- Supabase: PostgreSQL, Auth, Storage, Realtime y Edge Functions (Deno)
- Leaflet y OpenStreetMap (mapas)
- qrcodejs (códigos QR)
- Izipay (pasarela de pago, formulario Krypton)
- Intifact (consulta de documentos DNI, CE y RUC, mediante una función Edge)
- WhatsApp (`wa.me`) para contactar a quien reportó una mascota

No es necesario instalar Java, Maven, Spring Boot, MySQL ni PostgreSQL localmente.

## Cómo ejecutar el proyecto

El proyecto puede ejecutarse desde el navegador o mediante un servidor local.

### Opción recomendada

Abrir el proyecto en Visual Studio Code y utilizar una extensión como **Live Server** para ejecutar `index.html`.

Para que las funciones conectadas a Supabase trabajen correctamente, se debe contar con la configuración correspondiente en:

`js/supabaseClient.js`

### Funciones Edge (pago en línea)

Las funciones de `supabase/functions/` se publican con la CLI de Supabase (incluida en `package.json`):

npm install
npx supabase functions deploy izipay-crear-pago
npx supabase functions deploy izipay-resultado-pago

Variables de entorno (secretos) que necesitan las funciones de Izipay:

- `IZIPAY_API_URL`
- `IZIPAY_USERNAME`
- `IZIPAY_PASSWORD_TEST`
- `IZIPAY_PUBLIC_KEY_TEST`

Se configuran con `npx supabase secrets set NOMBRE=valor`. Actualmente el pago funciona con las credenciales de **prueba** de Izipay. Ambas funciones tienen `verify_jwt = false` en `supabase/config.toml`, porque `izipay-resultado-pago` recibe la notificación de Izipay; por eso valida la firma (`kr-hash`, HMAC-SHA256) antes de confirmar o rechazar un pago.

La consulta de documentos (`intifact-consultar-documento`) también es una función Edge de Supabase; su código no está en esta carpeta, así que debe estar desplegada en el proyecto de Supabase.

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

La información principal del sistema se almacena en **PostgreSQL mediante Supabase**. No es necesario instalar PostgreSQL de forma local, ya que la base de datos es administrada desde el proyecto de Supabase.

### Tablas principales

#### `perfiles`

Información adicional de los usuarios autenticados.

- `id`, `nombre`, `rol`

#### `mascotas`

Mascotas del albergue.

- `id_mascota`, `nombre`, `especie`, `raza`, `edad`, `sexo`, `estado`, `imagen_url`
- Datos para Match: `tamano`, `nivel_actividad`, `personalidad`, `convive_ninos`, `convive_mascotas`

Estados: `DISPONIBLE`, `EN_PROCESO`, `ADOPTADO`.

#### `productos`

Productos a la venta.

- `id_producto`, `nombre`, `categoria`, `precio`, `stock`, `imagen_url`

Categorías: `ALIMENTO`, `HIGIENE`.

#### `solicitudes`

Solicitudes de adopción realizadas por los clientes.

- `id_solicitud`, `id_usuario`, `tipo`, `ref_id`, `cantidad`, `fecha`, `estado`, `evaluacion` (JSON)
- `tipo_documento`, `numero_documento`, `fecha_nacimiento` (también existe `dni`)

Tipos: `ADOPCION`, `COMPRA` (las compras ahora se registran en `pedidos`). Estados: `PENDIENTE`, `APROBADA`, `RECHAZADA`.

#### `fichas_adopcion`

Ficha digital de cada adopción aprobada.

- `id_ficha`, `codigo` (único), `id_solicitud`, `id_mascota`, `id_usuario`, `fecha_adopcion`
- Datos copiados de la mascota y del adoptante (`nombre_mascota`, `especie`, `raza`, `edad`, `sexo`, `imagen_url`, `tipo_documento`, `numero_documento`, `fecha_nacimiento`)

#### `pedidos`

Compras de productos.

- `id_pedido`, `id_usuario`, `fecha`, `total`, `estado`, `vence_en`, `pagado_en`, `entregado_en`
- `numero_boleta`, `boleta_codigo`, `pago_referencia`, `motivo_rechazo`
- `nombre_comprador`, `tipo_documento`, `numero_documento`

Estados: `PENDIENTE_PAGO`, `PAGADO`, `RECHAZADO`, `VENCIDO`, `ENTREGADO`.

#### `pedido_items`

Detalle de productos de cada pedido.

- `id_item`, `id_pedido`, `id_producto`, `nombre_producto`, `precio_unitario`, `cantidad`, `subtotal`

#### `pet_reports`

Reportes de mascotas abandonadas.

- `id`, `user_id`, `pet_name`, `species`, `status`, `description`, `zone`, `lat`, `lng`
- `photo_url_1`, `photo_url_2`, `photo_url_3`
- `contact_name`, `contact_phone`, `contact_phone_country`, `created_at`

#### `match_invitaciones`

Decisión del cliente ante la invitación a MascotICA's Match.

- `usuario_id`, `decision`, `respondido_en`

### Funciones de base de datos (RPC)

- `es_admin()`: indica si el usuario autenticado es administrador.
- `solicitar_adopcion`, `aprobar_adopcion`: registran y aprueban solicitudes de adopción.
- `obtener_ficha_publica`: devuelve solo los datos públicos de una ficha.
- `crear_pedido`: registra un pedido con sus productos.
- `obtener_boleta_publica`: devuelve los datos de una boleta a partir de su código.
- Funciones que confirman o rechazan el pago de un pedido, usadas por `izipay-resultado-pago`.

## Seguridad

El proyecto utiliza **Row Level Security (RLS)** de Supabase. Las principales reglas son:

- Los usuarios consultan su propio perfil; los administradores pueden ver todos.
- Las mascotas y los productos se consultan públicamente; solo los administradores los modifican.
- Los clientes crean y consultan sus propias solicitudes; los administradores las consultan y gestionan.
- Cada cliente consulta solo sus propios pedidos, ítems y fichas de adopción; los administradores ven todos.
- Los reportes de mascotas son públicos para consulta; cada usuario crea los suyos y puede borrarlos (o el administrador).
- Cada cliente consulta, registra y actualiza solo su propia invitación a Match.

Además:

- Los datos de la tarjeta se ingresan en el formulario de Izipay y no se almacenan en el sistema.
- El resultado del pago se valida en el servidor mediante firma antes de marcar el pedido como pagado.
- La ficha pública (QR / NFC) no expone nombre ni documento del adoptante.

## Estructura del proyecto

Mascoticas/
├── index.html
├── login.html
├── README.md
├── package.json
│
├── admin/
│   ├── dashboard.html
│   ├── mascotas.html
│   ├── mascota-form.html
│   ├── productos.html
│   ├── producto-form.html
│   ├── solicitudes.html
│   ├── compras.html
│   └── reportes.html
│
├── cliente/
│   ├── index.html
│   ├── match.html
│   ├── mis-solicitudes.html
│   ├── boleta.html
│   ├── ficha-adopcion.html
│   ├── ficha-publica.html
│   └── perdidas.html
│
├── css/
│   ├── styles.css
│   └── match.css
│
├── js/
│   ├── auth.js
│   ├── login.js
│   ├── otp.js
│   ├── redireccion.js
│   ├── storage.js
│   ├── supabaseClient.js
│   ├── ui.js
│   ├── theme.js
│   ├── validaciones.js
│   ├── admin/        (dashboard, mascotas, productos, solicitudes, compras, reportes y formularios)
│   └── cliente/      (index, match, mis-solicitudes, boleta, ficha-adopcion, ficha-publica, perdidas)
│
├── supabase/
│   ├── config.toml
│   └── functions/
│       ├── izipay-crear-pago/
│       └── izipay-resultado-pago/
│
└── img/
    ├── logo.png
    ├── mascotas/
    └── productos/

## Pendiente

- Recomendación de productos según la mascota adoptada.
- Selector de aplicación de mapas (Google Maps, Waze o Apple Maps); hoy se abre OpenStreetMap.