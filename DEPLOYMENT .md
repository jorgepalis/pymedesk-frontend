Despliegue en Vercel
====================

Sigue esta guía para publicar el frontend de Pymedesk en Vercel usando el flujo integrado con Git.

1. **Preparar el repositorio**
	- Asegúrate de que el proyecto vive en un repositorio Git accesible (GitHub).
	- Confirma que el build pasa de manera local:

	  ```bash
	  npm install
	  npm run build
	  ```

	- Verifica que el archivo `.env` contiene `NEXT_PUBLIC_API_URL` apuntando a tu backend productivo; este valor se replicará en Vercel como variable de entorno.

2. **Crear la cuenta en Vercel**
	- Regístrate con tu proveedor de Git preferido en [https://vercel.com/signup](https://vercel.com/signup).
	- Opcional: crea un equipo si vas a colaborar con otras personas.

3. **Importar el proyecto**
	- En el panel de Vercel, haz clic en **Add New > Project**.
	- Autoriza a Vercel a acceder al repositorio donde vive el frontend.
	- Selecciona el repositorio `pymedesk-frontend` y continúa con la configuración.

4. **Configurar variables de entorno**
	- En la sección **Environment Variables**, añade:

	  | Nombre                 | Valor sugerido                                     | Entorno |
	  |------------------------|----------------------------------------------------|---------|
	  | `NEXT_PUBLIC_API_URL`  | `https://tu-backend-produccion/api/` (termina en `/`) | Preview y Production |

	- Repite la variable para los entornos **Preview** y **Production**. Usa URLs distintas si tienes múltiples ambientes del backend.

5. **Ajustar la configuración de build**
	- Vercel detectará automáticamente Next.js y sugerirá `npm install`, `npm run build` y `Next.js` como output.
	- Verifica que el **Root Directory** esté vacío (usa la raíz del repo) y que **Framework Preset** sea `Next.js`.
	- Si usas un gestor distinto (pnpm, yarn), cámbialo desde **Build & Development Settings**.

6. **Lanzar la primera implementación**
	- Presiona **Deploy**. Vercel instalará dependencias, ejecutará `npm run build` y publicará un dominio único (`https://<proyecto>.vercel.app`).
	- Revisa los logs para confirmar que el build terminó sin errores.

7. **Configurar dominio personalizado (opcional)**
	- Desde la pestaña **Domains**, añade tu dominio y sigue las instrucciones de DNS (registros CNAME o A).
	- Espera a que la propagación de DNS finalice (puede tardar hasta 24 horas).

8. **Flujo continuo de despliegue**
	- Cada push a la rama principal disparará un despliegue de producción.
	- Los Pull Requests generan despliegues preview con su propia URL, útiles para QA.

9. **Gestión de variables y secretos adicionales**
	- Si necesitas más variables (p. ej., claves de analítica), añádelas en **Settings > Environment Variables** y vuelve a desplegar.
	- Mantén sincronizados los valores entre Preview y Production para evitar discrepancias.

10. **Supervisión y logs**
	 - Utiliza la pestaña **Analytics** y los registros de ejecución para monitorear performance y errores.
	 - Habilita notificaciones para mantenerte al tanto de builds fallidos.

Con estos pasos tendrás el frontend funcionando en Vercel, integrado con tu repositorio y listo para consumirse desde el backend desplegado en AWS.
