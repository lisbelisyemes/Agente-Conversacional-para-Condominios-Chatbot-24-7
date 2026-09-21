# Workflows de n8n

Esta carpeta contiene los workflows de la automatización, exportados de n8n sin credenciales.

| Archivo | Qué hace |
|---|---|
| `connie-workflow.json` | Workflow principal de Connie: recibe los mensajes de WhatsApp, valida la firma de Meta, clasifica la intención y responde según sea reglamento, saldo o reporte de falla. |
| `carga-reglamento.json` | Carga el reglamento: divide el texto en fragmentos, genera los embeddings y los guarda en `reglamento_embeddings`. |

## Cómo usarlos

1. En n8n, ve a **Workflows → Import from file** y selecciona el archivo.
2. Crea las credenciales que usa cada workflow: Gemini, PostgreSQL (Supabase), WhatsApp API y Crypto (firma HMAC de Meta). Los archivos solo traen referencias a ellas, no las claves.
3. Publica el workflow.

La instalación completa está en [docs/SETUP.md](../docs/SETUP.md).