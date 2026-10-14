# Pre-Legal · Frontend

Web de Pre-Legal: presentación de la empresa y catálogo de plantillas legales.

Lee en tiempo de build el dataset de la raíz del repositorio:

- `../catalog.json`: nombre, descripción y fichero de cada plantilla.
- `../Templates/*.md`: contenido de cada plantilla (Common Paper, CC BY 4.0).

## Idioma de los documentos

La interfaz está en español, pero las plantillas, las portadas, los formularios y los PDF usan el idioma fijado en `src/lib/document-language.ts` (`DOCUMENT_LANGUAGE`). Por ahora es `"en"`: se trabaja con los originales en inglés hasta que se revisen las traducciones de `../Templates/es/`. Para volver al español basta con cambiarlo a `"es"`; el formulario genérico y el del Mutual NDA ya tienen los textos de ambos idiomas.

Todas las páginas se generan de forma estática:

| Ruta | Página |
|---|---|
| `/` | Presentación de Pre-Legal. |
| `/plantillas` | Catálogo de plantillas. |
| `/plantillas/<slug>` | Detalle de una plantilla en el idioma de los documentos; `<slug>` es el nombre del fichero sin `.md` y en minúsculas. |
| `/plantillas/<slug>/original` | El original en inglés de una plantilla traducida. Solo existe con los documentos en español. |
| `/plantillas/<slug>/rellenar` | Formulario para rellenar la plantilla y descargarla en PDF (todas las plantillas con Portada). |

## Rellenar plantillas (PL-4)

Sigue el modelo de Common Paper: el usuario rellena la **Portada**, la vista previa muestra sus valores dentro de los Términos Estándar y el PDF incluye la Portada rellenada seguida de los **Términos Estándar sin modificar**.

- `src/lib/forms/mutual-nda.ts`: formulario específico del Mutual NDA.
- `src/lib/forms/cover.ts`: formulario genérico para el resto de plantillas, generado a partir de su Portada (`Templates/*-coverpage.md`, o `Templates/es/` en español): cada `[ … ]` es un campo (desplegable si tiene opciones `a | b`), cada `- [ ]` una casilla, las notas de redacción son ayuda y la tabla de firmas recoge los datos de las partes. Las marcas que dependen del idioma de la portada están en `COVER_LOCALES`. Los campos de los Términos Estándar toman el valor de la sección de la Portada con el mismo nombre.
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
