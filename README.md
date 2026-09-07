# Agente Conversacional para Condominios — Chatbot 24/7

Chatbot inteligente que automatiza la atención a residentes de un condominio, respondiendo consultas sobre el reglamento interno, el estado de cuenta y gestionando el registro de reportes de fallas en áreas comunes, disponible las 24 horas del día.

## Problema que resuelve

La administración de condominios enfrenta comunicación caótica, morosidad sin seguimiento oportuno y controles ineficientes para reportar y priorizar fallas en las áreas comunes. Este proyecto busca automatizar esas interacciones mediante un agente conversacional conectado a la base de datos y al reglamento del condominio.

## Funcionalidades

- **Consulta del Reglamento Interno** mediante búsqueda semántica (RAG), citando el artículo correspondiente.
- **Consulta de Estado de Cuenta** por número de apartamento, en tiempo real desde la base de datos.
- **Reporte de Fallas en Áreas Comunes**, con posibilidad de adjuntar una foto del daño.
- **Análisis de Imagen con IA** para sugerir automáticamente el tipo de daño reportado.
- **Clasificación Automática de Urgencia** (baja / media / crítica) con notificación diferenciada a la administración.
- **Clasificación de Intenciones**, para enrutar cada mensaje al flujo correcto de forma automática.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Base de Datos | Supabase (PostgreSQL + pgvector) |
| Almacenamiento de imágenes | Supabase Storage |
| Automatización / Orquestación | n8n |
| Inteligencia Artificial | Gemini API (texto, visión y embeddings) |
| Despliegue | Vercel |

## Arquitectura

El sistema sigue una arquitectura desacoplada: el frontend envía cada mensaje a un webhook de n8n, que clasifica la intención mediante IA y ejecuta el flujo correspondiente (consulta al reglamento vía RAG, consulta financiera o registro de un reporte de falla con análisis de imagen y urgencia).

Ver diagrama completo en [`/docs/arquitectura.png`](./docs/arquitectura.png)

Ver diagrama de base de datos en [`/docs/er_diagram.png`](./docs/er_diagram.png)

## Estructura del Proyecto

```text
├── frontend/         # Aplicación Next.js (interfaz de chat)
├── n8n-flows/        # Flujos exportados de n8n (.json)
├── database/         # Scripts SQL (tablas, extensión pgvector)
├── docs/             # Diagramas UML, ER, capturas e informe del proyecto
└── README.md
```

## Variables de Entorno

Crea un archivo `.env.local` en `/frontend` con:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
N8N_WEBHOOK_URL=
GEMINI_API_KEY=
```

> Nunca subas este archivo al repositorio. Ya está incluido en `.gitignore`.

## Cómo ejecutar el proyecto localmente

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Metodología

Proyecto desarrollado bajo metodología ágil (Scrum), en 2 Sprints de 7 días. El detalle del cronograma, requerimientos e historias de usuario se encuentra en el informe del proyecto (`/docs/informe.docx`).

## Autora

Lisbelis Yemes

Proyecto desarrollado de forma individual como parte de la asignatura Ingeniería de Software I.

## Licencia

Proyecto académico sin fines comerciales.