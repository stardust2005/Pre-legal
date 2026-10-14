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
| `/plantillas/<slug>` | Detalle de una plantilla; `<slug>` es el nombre del fichero sin `.md` y en minúsculas. |

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
