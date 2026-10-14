# Pre-Legal · Frontend

Web de Pre-Legal: presentación de la empresa y catálogo de plantillas legales.

Lee en tiempo de build el dataset de la raíz del repositorio:

- `../catalog.json`: nombre, descripción y fichero de cada plantilla.
- `../Templates/*.md`: contenido de cada plantilla (Common Paper, CC BY 4.0).

Todas las páginas se generan de forma estática:

| Ruta | Página |
|---|---|
| `/` | Presentación de Pre-Legal. |
| `/plantillas` | Catálogo de plantillas. |
| `/plantillas/<slug>` | Detalle de una plantilla en español; `<slug>` es el nombre del fichero sin `.md` y en minúsculas. |
| `/plantillas/<slug>/original` | La misma plantilla en el original en inglés. |
| `/plantillas/<slug>/rellenar` | Formulario para rellenar la plantilla y descargarla en PDF. De momento, solo `mutual-nda`. |

## Rellenar plantillas (PL-4)

Sigue el modelo de Common Paper: el usuario rellena la **Portada**, la vista previa muestra sus valores dentro de los Términos Estándar y el PDF incluye la Portada rellenada seguida de los **Términos Estándar sin modificar**.

- `src/lib/forms/`: definición de cada formulario (campos, valores por defecto y sustitución en la vista previa).
- `src/lib/pdf/`: generación del PDF con `@react-pdf/renderer`, que se carga solo al pulsar «Descargar PDF».
- Los datos no se guardan: solo existen en el navegador mientras se usa la página.

## Desarrollo

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```

## Comprobaciones

```bash
npm run lint
npm run build
```
