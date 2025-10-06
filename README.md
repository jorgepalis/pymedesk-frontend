Pymedesk Frontend es una aplicación Next.js (App Router) que consume el backend de Django para gestionar autenticación, catálogo de productos, carrito de compras y panel de administración. Este documento describe cómo levantar el entorno local, configurar variables y entender la arquitectura general.

## Requisitos previos

- Node.js 20 o superior.
- npm (viene con Node.js).
- Backend en ejecución en `http://localhost:8000/api/` o la URL que definas.

## Configuración inicial

1. Instala dependencias:

	```bash
	npm install
	```

2. Crea un archivo `.env` en la raíz del proyecto con la variable necesaria:

	```properties
	NEXT_PUBLIC_API_URL=http://localhost:8000/api/
	```

	Ajusta el valor para apuntar al backend que corresponda. El valor debe terminar con `/`.

3. Levanta el servidor de desarrollo:

	```bash
	npm run dev
	```

4. Abre `http://localhost:3000` en el navegador. El servidor recargará automáticamente ante cambios de código.

## Resumen funcional

- **Autenticación**: formularios de registro e inicio de sesión (`/register`, `/login`) con manejo de tokens JWT almacenados en `localStorage`. Tras autenticarse, se consulta `/me` para obtener el perfil con rol.
- **Página principal (`/`)**: lista productos disponibles, permite agregar al carrito persistente en `localStorage`. Un botón flotante abre el drawer del carrito.
- **Órdenes (`/orders`)**: muestra el historial de pedidos del usuario autenticado. Desde el carrito se pueden crear nuevas órdenes con los productos seleccionados.
- **Panel de administración (`/admin`)**: acceso restringido a usuarios con rol `admin`. Incluye listado y mantenimiento básico de productos (crear y editar) y visualización de órdenes registradas.
- **Carrito**: implementado con un provider React que expone acciones para añadir, incrementar, decrementar, eliminar y limpiar productos. El drawer permite crear pedidos mediante un POST a `/orders`.
- **Manejo de notificaciones**: componente `NotificationsProvider` para mostrar mensajes de éxito o error en toda la aplicación.

## Estructura principal

- `src/app/` contiene las rutas de la App Router: páginas públicas, protegidas y el layout global.
- `src/api/` centraliza el cliente HTTP (`apiFetch`), manejo de errores y endpoints organizados por dominio (`auth`, `users`, `products`, `orders`).
- `src/hooks/` incluye hooks personalizados como `useAuth` y `useCart`.
- `src/components/` alberga componentes reutilizables (auth, carrito, productos, órdenes, feedback).
- `src/utils/` guarda utilidades auxiliares como formatters (`currency`).


## Notas adicionales

- Los tokens (`access`, `refresh`) se persisten con claves `pymedesk.accessToken` y `pymedesk.refreshToken`.
- El perfil de usuario y el carrito utilizan `localStorage` (`pymedesk.me`, `pymedesk.cart`).
- Asegúrate de que el backend exponga las rutas necesarias (`/auth/login/`, `/auth/register/`, `/users/me/`, `/products/`, `/orders/`).

## Usuarios de prueba
-- Ususarios de prueba en la bd
	puedes usar el usuario con rol admin, usuario: admin@admin.com contraseña: Admin21. (el punto incluido)
	puedes usar el usuario con client, usuario: palis963@hotmail.com contraseña: Client21. (el punto incluido)
