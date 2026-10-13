# Cobrix · Frontend

Cobrix es una app de cobranza por **WhatsApp** para PyMEs mexicanas. Automatiza lo repetitivo, que es decidir a quién cobrar primero y mandar los recordatorios con plantillas aprobadas por Meta, y deja la conversación con el cliente en manos de una persona del equipo, porque en este negocio la relación es personal. Dos asistentes de IA acompañan al usuario: el **Director** responde sobre la cartera y la **Guía** le enseña a usar la app.

| Pieza | Qué hace | Cómo está construida |
|---|---|---|
| **Analista** (automático) | Decide a quién cobrar primero y explica por qué | Score 0-100 por reglas: atraso, monto, mensajes sin respuesta y promesas. Instantáneo y explicable |
| **Redactor** (automático) | Envía el recordatorio que toca: amable → firme → final | Siempre plantilla aprobada por Meta, así que vale dentro y fuera de la ventana de 24 h |
| **Tu equipo** (personas) | Contesta a los clientes y registra promesas de pago | Cuando un cliente responde queda en **"Requiere atención"** y sus recordatorios se pausan |
| **Director** (IA) | Responde sobre la cartera con datos reales y prepara envíos que tú confirmas | `streamText` + 9 herramientas. Responde con KPIs, gráficas, listas y confirmaciones dentro del chat |
| **Guía** (IA) | Enseña a usar Cobrix y lleva al usuario a la pantalla correcta | `streamText` con un manual de la app, el estado real de la cuenta (`estado_de_mi_cuenta`) y botones de navegación (`mostrar_boton`) |

> Este repo es la **interfaz** (React + Vite + Tailwind + Framer Motion). Los agentes, la base de datos y WhatsApp viven en el repo **cobrix-backend** de la misma organización.

## Cómo se conecta

- **Supabase Auth**: login con correo o **demo de invitado** (anónima). Cada visitante tiene su propia cartera aislada con RLS.
- **API de agentes (Render)**: lecturas, acciones y respuestas de IA en streaming NDJSON (`src/services/httpApi.ts`).
- **Supabase Realtime**: el panel "Agentes en vivo" y las conversaciones se actualizan solos.
- **Sin variables de entorno** la app funciona en **modo demo local** con datos mock (`src/services/mockApi.ts`).

## Lo que puede probar un visitante

- `/demo` entra directo como invitado, sin login.
- Un **recorrido guiado** de 5 pasos: revisar la cartera, enviar recordatorios, simular la respuesta de un cliente y contestarle, preguntarle al Director y conocer a la Guía.
- La **Guía**: en escritorio, el botón "¿Necesitas ayuda?"; en el teléfono, la pestaña Guía.
- El **simulador**: en cada conversación, "Simular cliente" permite escribir como si fueras el cliente, sin WhatsApp.

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
