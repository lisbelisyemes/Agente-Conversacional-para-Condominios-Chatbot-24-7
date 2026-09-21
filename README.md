# Agente Conversacional para Condominios - Chatbot 24/7

**Connie** es un agente conversacional que atiende a los residentes de un condominio por **WhatsApp**, las 24 horas del día. Responde dudas sobre el reglamento interno, consulta el saldo de cada apartamento y registra reportes de fallas en las áreas comunes. La administración gestiona todo desde un portal web.

## Deploy público

Portal web: **https://agente-conversacional-para-condominios-chatbot-24-7-aowd3sjs1.vercel.app/**

Para probar a Connie, usa el botón de WhatsApp de la página principal del portal.

## Documentación

| Documento | Contenido |
|---|---|
| [Arquitectura](./docs/ARQUITECTURA.md) | Componentes, diagramas y flujo de un mensaje. |
| [Setup](./docs/SETUP.md) | Instalación paso a paso: base de datos, portal, n8n, túnel y WhatsApp. |
| [Base de datos](./database/README.md) | Tablas, columnas principales, modelo ER y búsqueda semántica. |
| [Automatización](./n8n-flows/) | Workflow de n8n exportado, sin credenciales. |

## Problema que resuelve

La administración de condominios enfrenta comunicación caótica, morosidad sin seguimiento oportuno y controles ineficientes para reportar y priorizar fallas en las áreas comunes. Este proyecto automatiza esas interacciones con un agente conectado a la base de datos y al reglamento del condominio.

## Funcionalidades

### Connie (WhatsApp)

- **Reglamento:** búsqueda semántica (RAG) sobre los fragmentos del reglamento almacenados en pgvector.
- **Saldo:** consulta por número de apartamento, en tiempo real desde la base de datos.
- **Reporte de fallas:** registro de la incidencia con clasificación urgente / no urgente. Ante un riesgo, indica contactar de inmediato a seguridad o administración.
- **Clasificación de intenciones:** cada mensaje se enruta al flujo correcto (reglamento, saldo, falla u otro).
- **Contexto de conversación:** usa los últimos intercambios del residente.
- **Respuestas controladas:** no inventa datos del condominio, rechaza temas ajenos y pide aclaración ante mensajes ambiguos.

### Portal administrativo

- Login con Supabase Auth y dashboard protegido.
- Consulta y creación de apartamentos y cargos, y consulta de movimientos financieros.
- Actualización de pagos y saldos.
- Gestión del estado de las incidencias.
- Consulta del reglamento y estado del asistente.
- Diseño responsive con navegación móvil.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Base de datos | Supabase (PostgreSQL + pgvector) |
| Autenticación del portal | Supabase Auth |
| Automatización | n8n (Docker) |
| Inteligencia artificial | Gemini API (clasificación, respuesta y embeddings) |
| Mensajería | WhatsApp Cloud API (Meta for Developers) |
| Webhook en desarrollo | Cloudflare Tunnel |
| Despliegue del portal | Vercel |

## Inicio rápido (portal)

```bash
cd frontend
npm install
npm run dev
```

Disponible en `http://localhost:3000`. Antes, crea `frontend/.env.local` con:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

> Nunca subas este archivo al repositorio: está incluido en `.gitignore`.

La instalación completa, incluida la automatización con n8n y WhatsApp, está en [docs/SETUP.md](./docs/SETUP.md).

## Seguridad

- Cada mensaje entrante se valida con la **firma HMAC** de Meta; los que no coinciden se descartan.
- Las **credenciales** viven en el almacén cifrado de n8n, no en el código ni en el workflow exportado.
- Las consultas SQL del workflow son **parametrizadas**.
- El portal exige **autenticación** con Supabase Auth.
- El prompt de Connie restringe su alcance, ignora instrucciones que intenten cambiar sus reglas y le prohíbe afirmar datos que no estén en el reglamento.

## Calidad del software

El proyecto toma como marco la norma **ISO/IEC 25010:2023**, con un enfoque de aseguramiento de calidad preventivo desde la fase de requerimientos. El detalle de las nueve características y sus métricas está en el informe del proyecto.

## Limitaciones conocidas y mejoras futuras

- Notificación automática a la administración cuando se registra una falla urgente.
- Urgencia en tres niveles (baja / media / crítica).
- Reporte de fallas con foto y análisis de imagen con IA.
- Verificar que el teléfono que consulta un saldo pertenezca al apartamento consultado.
- Manejo de errores cuando la base de datos no responde y descarte de mensajes duplicados reenviados por Meta.
- Centralizar la configuración (modelo, versión de la API, identificadores) para cambiar de proveedor de IA con menos cambios.
- Sustituir el túnel rápido por una URL fija (túnel con nombre o servidor) para uso continuo.

## Metodología

Proyecto desarrollado bajo metodología ágil (Scrum), en 2 sprints de 7 días. El cronograma, los requerimientos y las historias de usuario están en el informe del proyecto.

## Autora

Lisbelis Yemes

Proyecto desarrollado de forma individual como parte de la asignatura Ingeniería de Software I.

## Licencia

Proyecto académico sin fines comerciales.
