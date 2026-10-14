# Pre-legal
Repositorio para proyecto de documentos legales comunes

## Estado del proyecto

🚧 **En progreso.** El proyecto está en desarrollo activo y se completará en una semana (fecha prevista: 18 de octubre de 2026).

## Estructura del repositorio

| Ruta | Contenido |
|---|---|
| `Templates/` | Plantillas de acuerdos legales en markdown, de [Common Paper](https://github.com/CommonPaper), bajo licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (ver `Templates/LICENSE.txt`). |
| `Templates/es/` | Traducciones no oficiales al español de las plantillas y glosario de términos (`GLOSARIO.md`). Pendientes de revisión: la web usa por ahora los originales en inglés. |
| `catalog.json` | Catálogo de las plantillas: nombre, descripción y fichero de cada una, con su traducción al español. |
| `frontend/` | Web de Pre-Legal en Next.js: presentación de la empresa y catálogo de plantillas. Ver [`frontend/README.md`](frontend/README.md). |

## Puesta en marcha

Requisitos: Node.js 20.9 o superior (lo exige Next.js 16).

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```
