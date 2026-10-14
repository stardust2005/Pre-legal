# Pre-Legal · Frontend

Aplicación Next.js para consultar el catálogo de plantillas legales de Pre-Legal.

Lee en tiempo de build el dataset de la raíz del repositorio:

- `../catalog.json`: nombre, descripción y fichero de cada plantilla.
- `../Templates/*.md`: contenido de cada plantilla (Common Paper, CC BY 4.0).

Todas las páginas se generan de forma estática: `/` muestra el catálogo y `/plantillas/<slug>` el detalle de cada plantilla, donde `<slug>` es el nombre del fichero sin `.md` y en minúsculas.

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
