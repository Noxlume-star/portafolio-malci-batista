# Instrucciones para subir el portafolio

## Archivos y dónde van

Estructura de la carpeta `batman-portfolio/`:

- `index.html` — la página principal. No la cambies a mano.
- `css/styles.css` — colores, animaciones y diseño.
- `js/datos.js` — textos de ejemplo del sitio.
- `js/main.js` — comportamiento del sitio.
- `admin/panel.html` — el panel privado (se abre con el botón "Acceso" al pie de la página) (contraseña de prueba: batman-demo).
- `netlify.toml` — configuración de Netlify. No la borres.
- `assets/img/` — imágenes del sitio (opcional; las fotos principales se suben desde el panel).
- `assets/sounds/` — sonidos (opcional; el audio se sube desde el panel).

Las fotos y el audio que subas desde el panel se guardan en el navegador, no hace falta colocarlos en la carpeta.

## Pasos para publicar en Netlify

1. Entra a netlify.com y crea una cuenta gratis.
2. Descomprime `batman-portfolio.zip`. Queda la carpeta `batman-portfolio`.
3. En Netlify, ve a Sites → Add new site → Deploy manually.
4. Arrastra la carpeta `batman-portfolio` completa a la zona de carga.
5. Espera a que termine. Netlify te dará un enlace.
6. Para cambiarlo, ve a Site configuration → Change site name.

## Antes de publicar

- El panel guarda los cambios en el navegador. Para que tus clientes vean tus datos, hace falta conectar Supabase.
- El panel es solo una demostración y no es seguro todavía.
- Cambia las imágenes de ejemplo por tus fotos reales.
