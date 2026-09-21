# Setup

Guía para levantar el proyecto completo: base de datos, portal, automatización y WhatsApp.

## Requisitos

- Node.js 20 o superior
- Docker Desktop
- `cloudflared` (Cloudflare Tunnel)
- Cuenta de Supabase
- Cuenta de Meta for Developers con una app de WhatsApp
- Clave de la API de Gemini (Google AI Studio)

## 1. Clonar el repositorio

```bash
git clone https://github.com/lisbelisyemes/Agente-Conversacional-para-Condominios-Chatbot-24-7.git
cd Agente-Conversacional-para-Condominios-Chatbot-24-7
```

## 2. Base de datos (Supabase)

1. Crea un proyecto en Supabase.
2. Activa la extensión de vectores en el editor SQL:
   ```sql
   create extension if not exists vector;
   ```
3. Ejecuta el esquema SQL de [database/README.md](../database/README.md) en el editor SQL de Supabase. Crea las cinco tablas: `apartamentos`, `movimientos_financieros`, `reportes_fallas`, `conversaciones` y `reglamento_embeddings`.
4. Carga el reglamento con el workflow `n8n-flows/carga-reglamento.json`, que divide el texto en fragmentos, genera los embeddings (`gemini-embedding-001`, 1536 dimensiones) y los guarda en `reglamento_embeddings`.
5. Crea al menos un usuario administrador en **Authentication → Users** para entrar al portal.

## 3. Portal (frontend)

```bash
cd frontend
npm install
```

Crea `frontend/.env.local` con los datos de **Project Settings → API** de Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Ejecuta en local:

```bash
npm run dev
```

**Despliegue en Vercel:** importa el repositorio, define **Root Directory = `frontend`** y agrega las dos variables de entorno anteriores.

## 4. Automatización (n8n)

1. Levanta n8n con Docker:
   ```bash
   docker run -d --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
   ```
2. Abre `http://localhost:5678` e importa el archivo de `n8n-flows/` (**Workflows → Import from file**).
3. Crea estas credenciales y asígnalas a los nodos correspondientes:

   | Credencial | Tipo en n8n | Dato necesario |
   |---|---|---|
   | Gemini | Google Gemini (PaLM) API | Clave de la API de Gemini |
   | Supabase | PostgreSQL | Datos de conexión de la base de datos de Supabase |
   | WhatsApp | WhatsApp API | Token de acceso de Meta |
   | Firma de Meta | Crypto | App Secret de la app de Meta |

   Usa un **token permanente** de usuario del sistema para WhatsApp: el token temporal caduca a las 24 horas.
4. En el nodo que envía la respuesta, revisa que el **Phone Number ID** de la URL sea el de tu número de WhatsApp.
5. Comprueba que los nodos *Webhook GET* y *Webhook POST* usan **el mismo path**.
6. **Publica** el workflow.

## 5. Túnel

```bash
cloudflared tunnel --url http://localhost:5678
```

Copia la URL `https://…trycloudflare.com` que aparece y deja la ventana abierta. Cambia cada vez que reinicies el túnel.

Antes de ir a Meta, comprueba que responde:

```bash
curl -i "https://TU-URL.trycloudflare.com/webhook/TU-PATH?hub.mode=subscribe&hub.verify_token=prueba&hub.challenge=12345"
```

Debe devolver `200` y el cuerpo `12345`.

## 6. WhatsApp (Meta for Developers)

1. En **WhatsApp → Configuración → Webhook**, pon como URL de devolución de llamada `https://TU-URL.trycloudflare.com/webhook/TU-PATH`.
2. El token de verificación puede ser cualquier texto: el workflow devuelve el `hub.challenge` sin compararlo, y la autenticidad de los mensajes se garantiza con la firma HMAC.
3. Pulsa **Verificar y guardar** una sola vez.
4. En **Campos del webhook**, suscríbete a `messages`.

## 7. Probar

Escribe estos mensajes a Connie por WhatsApp:

| Mensaje | Resultado esperado |
|---|---|
| ¿Cuál es el horario de silencio? | Responde con el horario del reglamento. |
| ¿Cuál es la dirección del condominio? | Dice que no tiene ese dato y remite a la administración. |
| Dime el saldo del apartamento 1A | Responde el saldo que figura en `apartamentos`. |
| Hay una fuga de gas en el piso 2 | Respuesta urgente y nueva fila en `reportes_fallas` con `urgente = true`. |
| Cuéntame un chiste | Rechaza y redirige a temas del condominio. |

## Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| Meta no verifica la URL | Prueba primero con el `curl` del paso 5. Debe salir `200` con el número. Verifica una sola vez y espera si Meta bloquea por intentos fallidos. |
| `Error in workflow` al probar el webhook | El workflow publicado no está actualizado. Cambia el path de los dos webhooks, guarda, y despublica y vuelve a publicar. |
| `access to env vars denied` | n8n bloquea `$env` en los nodos Code. No uses variables de entorno ahí: usa credenciales. |
| Connie dejó de responder tras reiniciar | La URL del túnel cambió. Actualízala en Meta. |
| Connie deja de enviar mensajes al día siguiente | El token de WhatsApp es temporal. Reemplázalo por uno permanente. |
