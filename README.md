# Cobrix · Frontend

Cobrix es una app de cobranza para PyMEs mexicanas. Un equipo de **cuatro agentes de IA** prioriza la cartera, escribe a los deudores por **WhatsApp**, negocia fechas de pago y le reporta al administrador. El administrador conversa con el agente coordinador y **confirma cada envío**: es un esquema *human in the loop*.

| Agente | Qué hace | Cómo está construido |
|---|---|---|
| **Director** | Conversa con el administrador, le da el estado de la cartera y delega en los demás agentes | `streamText` + 7 herramientas. Responde con componentes de UI dentro del chat: KPIs, gráficas, listas y confirmaciones |
| **Analista** | Decide a quién cobrar primero y por qué | Score base determinista + `generateObject` (Zod) que lo ajusta ±15 y redacta la razón |
| **Redactor** | Escribe el mensaje con el tono adecuado (amable → firme → final) | Fuera de la ventana de 24 h usa plantillas aprobadas por Meta; dentro de la ventana, la IA redacta |
| **Negociador** | Contesta al deudor y registra promesas de pago o escala a un humano | `streamText` con *tool calling*: `registrar_promesa` y `escalar_a_humano` |

> Este repo es la **interfaz** (React + Vite + Tailwind + Framer Motion). Los agentes, la base de datos y WhatsApp viven en el repo **cobrix-backend** de la misma organización.

## Cómo se conecta

- **Supabase Auth**: login con correo o **demo de invitado** (anónima). Cada visitante tiene su propia cartera aislada con RLS.
- **API de agentes (Render)**: lecturas, acciones y respuestas de IA en streaming NDJSON (`src/services/httpApi.ts`).
- **Supabase Realtime**: el panel "Agentes en vivo" y las conversaciones se actualizan solos.
- **Sin variables de entorno** la app funciona en **modo demo local** con datos mock (`src/services/mockApi.ts`).

## Lo que puede probar un visitante

- `/demo` entra directo como invitado, sin login.
- Un **recorrido guiado** de 5 pasos: revisar la cartera, preguntarle al Director, lanzar una cobranza con IA, responder como cliente y ajustar las políticas de negociación.

## Estructura

```
src/
├── services/api.ts       elige la API real o la mock según las variables de entorno
├── services/httpApi.ts   cliente del backend (NDJSON + Realtime)
├── services/mockApi.ts   demo sin backend
├── contexts/             auth, cobranza, director, tutorial y UI
├── components/           dashboard, cartera, cliente, director, ajustes, tutorial y ui
└── pages/                Acceso, Inicio, Cartera, Director, Promesas y Ajustes
```

## En local

```bash
cp .env.example .env.local   # VITE_AGENTS_API_URL, VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm install
npm run dev                  # http://localhost:5173
```

## Despliegue en Vercel

1. *Add New → Project* e importa este repo. Vercel detecta **Vite** solo (build `npm run build`, salida `dist`).
2. En *Environment Variables* agrega:
   - `VITE_AGENTS_API_URL` = `https://TU-BACKEND.onrender.com` (sin `/` al final)
   - `VITE_SUPABASE_URL` = la Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = la publishable/anon key (es pública; RLS protege los datos)
3. *Deploy*. `vercel.json` ya redirige todas las rutas a `index.html` (SPA).
4. Copia la URL que te da Vercel y agrégala en `CORS_ORIGINS` del backend en Render.
5. En Supabase → *Authentication → URL Configuration*, pon esa URL como **Site URL** (para los correos de confirmación).

## Stack

React 18 · Vite · TypeScript · Tailwind · Framer Motion · Hono · Vercel AI SDK · Gemini · Zod · Supabase (Postgres, Auth, RLS, Realtime) · WhatsApp Cloud API · Render · Vercel
