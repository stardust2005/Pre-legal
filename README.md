# Pre-legal
Repositorio para proyecto de documentos legales comunes

## Estado del proyecto

🚧 **En progreso.** El proyecto está en desarrollo activo y se completará en una semana (fecha prevista: 18 de octubre de 2026).

## Estructura del repositorio

| Ruta | Contenido |
|---|---|
| `Templates/` | Plantillas de acuerdos legales en markdown, de [Common Paper](https://github.com/CommonPaper), bajo licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (ver `Templates/LICENSE.txt`). |
| `catalog.json` | Catálogo de las plantillas: nombre, descripción y fichero de cada una. |
| `frontend/` | Aplicación Next.js para consultar el catálogo y cada plantilla. Ver [`frontend/README.md`](frontend/README.md). |

## Puesta en marcha

Requisitos: Node.js 20 o superior.

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```
