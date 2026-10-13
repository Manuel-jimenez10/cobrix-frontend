/** Contenido de la documentación: API, variables, modelo de datos. Mantener al día con cobrix-backend/src/routes. */

export type Metodo = 'GET' | 'POST' | 'PATCH' | 'PUT';

export interface Endpoint {
  metodo: Metodo;
  ruta: string;
  resumen: string;
  detalle?: string;
  /** publica = sin JWT; ia = además pasa por el límite de uso de IA. */
  acceso: 'publica' | 'sesion' | 'ia';
  stream?: boolean;
  parametros?: {nombre: string;tipo: string;descripcion: string;}[];
  cuerpo?: string;
  respuesta?: string;
  errores?: {codigo: number;cuando: string;}[];
}

export interface GrupoApi {
  id: string;
  titulo: string;
  descripcion: string;
  endpoints: Endpoint[];
}

export const API: GrupoApi[] = [
{
  id: 'api-publica',
  titulo: 'Públicos',
  descripcion: 'No requieren sesión. El webhook valida la firma HMAC que envía Meta.',
  endpoints: [
  {
    metodo: 'GET',
    ruta: '/health',
    resumen: 'Estado del servicio',
    detalle: 'Lo usa el workflow de GitHub Actions para que Render no se duerma.',
    acceso: 'publica',
    respuesta: `{ "ok": true, "ia": "gemini-3.8-flash", "whatsapp": false }`
  },
  {
    metodo: 'GET',
    ruta: '/webhooks/whatsapp',
    resumen: 'Verificación del webhook de Meta (próximamente)',
    acceso: 'publica',
    parametros: [
    { nombre: 'hub.mode', tipo: 'query', descripcion: 'Siempre "subscribe".' },
    { nombre: 'hub.verify_token', tipo: 'query', descripcion: 'Debe coincidir con WHATSAPP_VERIFY_TOKEN.' },
    { nombre: 'hub.challenge', tipo: 'query', descripcion: 'Se devuelve tal cual si el token es válido.' }],

    respuesta: `1158201444  // el hub.challenge, en texto plano`,
    errores: [{ codigo: 403, cuando: 'El verify token no coincide.' }]
  },
  {
    metodo: 'POST',
    ruta: '/webhooks/whatsapp',
    resumen: 'Mensajes entrantes de WhatsApp (próximamente)',
    detalle:
    'Valida X-Hub-Signature-256 con WHATSAPP_APP_SECRET, ignora duplicados y ubica al cliente por su teléfono (o por el teléfono de pruebas del perfil). El mensaje se guarda y el cliente queda en "requiere atención".',
    acceso: 'publica',
    cuerpo: `{
  "entry": [{ "changes": [{ "value": { "messages": [
    { "id": "wamid.HBgM…", "from": "5215512345678", "type": "text",
      "text": { "body": "Les pago el viernes" } }
  ]}}]}]
}`,
    respuesta: `OK`,
    errores: [
    { codigo: 401, cuando: 'Firma inválida.' },
    { codigo: 400, cuando: 'El cuerpo no es JSON.' }]

  }]

},
{
  id: 'api-cuenta',
  titulo: 'Cuenta y ajustes',
  descripcion: 'Perfil del usuario, canal de envío, teléfono de pruebas y reglas de cobranza.',
  endpoints: [
  {
    metodo: 'GET',
    ruta: '/perfil',
    resumen: 'Perfil de la sesión',
    detalle: 'En el primer acceso crea el perfil y siembra una cartera de ejemplo propia.',
    acceso: 'sesion',
    respuesta: `{
  "nombre": "Manuel",
  "empresa": "Distribuidora del Valle",
  "esAnonimo": false,
  "iaActiva": true,
  "modelo": "gemini-3.8-flash"
}`
  },
  {
    metodo: 'GET',
    ruta: '/ajustes',
    resumen: 'Canal y estado de WhatsApp',
    acceso: 'sesion',
    respuesta: `{
  "canal": "simulador",
  "telefonoPrueba": "+52 55 1234 5678",
  "iaActiva": true,
  "whatsapp": {
    "conectado": true,
    "numero": "+1 555 010 0123",
    "proveedor": "WhatsApp Business Platform · Cloud API",
    "plantillasAprobadas": 3,
    "ultimaSincronizacion": "2026-10-13T15:02:11.000Z"
  }
}`
  },
  {
    metodo: 'PATCH',
    ruta: '/ajustes',
    resumen: 'Cambiar canal o teléfono de pruebas',
    acceso: 'sesion',
    cuerpo: `{ "canal": "whatsapp", "telefonoPrueba": "+52 55 1234 5678" }`,
    respuesta: `{ "ok": true }`,
    errores: [{ codigo: 400, cuando: 'Teléfono inválido.' }]
  },
  {
    metodo: 'POST',
    ruta: '/whatsapp/probar',
    resumen: 'Probar la conexión con la Cloud API',
    acceso: 'sesion',
    respuesta: `{ "ok": true, "numero": "+1 555 010 0123" }`,
    errores: [{ codigo: 502, cuando: 'Meta rechazó el token o el número.' }]
  },
  {
    metodo: 'GET',
    ruta: '/politicas',
    resumen: 'Reglas de cobranza vigentes',
    acceso: 'sesion',
    respuesta: `{
  "tonoMaximo": "final",
  "horario": { "activo": true, "dias": [1,2,3,4,5,6], "desde": "09:00", "hasta": "19:00" },
  "maxPagos": 2, "plazoMaxDias": 30, "pagoInicialMinPct": 30, "descuentoMaxPct": 0,
  "escalar": { "disputa": true, "productoDefectuoso": true, "legal": true, "pideHumano": true, "montoMayorA": null }
}`
  },
  {
    metodo: 'PUT',
    ruta: '/politicas',
    resumen: 'Guardar reglas de cobranza',
    detalle: 'Se valida con Zod. Fuera del horario, /cobranza/preparar responde 409.',
    acceso: 'sesion',
    cuerpo: `{ …mismo objeto que GET /politicas… }`,
    respuesta: `{ …reglas guardadas… }`,
    errores: [{ codigo: 400, cuando: 'Formato de hora inválido o "desde" ≥ "hasta".' }]
  }]

},
{
  id: 'api-cartera',
  titulo: 'Cartera',
  descripcion: 'Lecturas del panel y acciones de pago. Todo se filtra por el user_id del JWT.',
  endpoints: [
  {
    metodo: 'GET',
    ruta: '/dashboard',
    resumen: 'Totales del panel de Inicio',
    acceso: 'sesion',
    respuesta: `{
  "porCobrar": 436810, "facturasAbiertas": 17,
  "vencido": 354400, "clientesVencidos": 9,
  "recuperadoMes": 126400, "recuperadoVariacion": 18.2,
  "promesasActivas": 4, "montoPromesas": 75040,
  "antiguedad": [{ "rango": "0–30", "monto": 50510, "clientes": 6 }, …],
  "recuperacionSemanal": [{ "etiqueta": "18 ago", "valor": 21400 }, …]
}`
  },
  {
    metodo: 'GET',
    ruta: '/clientes',
    resumen: 'Lista de clientes con su resumen',
    acceso: 'sesion',
    parametros: [
    { nombre: 'busqueda', tipo: 'string', descripcion: 'Empresa, contacto, teléfono o folio.' },
    { nombre: 'estado', tipo: 'todos | vencido | por_vencer | promesa | al_dia', descripcion: 'Estado de sus facturas.' },
    { nombre: 'prioridad', tipo: 'todas | alta | media | baja', descripcion: 'Nivel de prioridad.' },
    { nombre: 'orden', tipo: 'prioridad | monto | atraso | nombre', descripcion: 'Por defecto, prioridad.' },
    { nombre: 'atencion', tipo: 'true', descripcion: 'Solo quienes esperan respuesta del equipo.' }],

    respuesta: `[{
  "id": "c01", "empresa": "Ferretería López", "nombre": "Jorge López Medina",
  "telefono": "+52 33 1847 2210", "canal": "whatsapp",
  "deuda": 48750, "diasAtraso": 67, "estado": "vencido", "facturasAbiertas": 2,
  "prioridad": { "score": 81, "nivel": "alta", "razon": "Dos facturas acumuladas…" },
  "requiereAtencion": true, "escalado": false,
  "ultimoMensaje": { "rol": "cliente", "contenido": "¿Podemos ver una opción en pagos?", … }
}]`
  },
  {
    metodo: 'GET',
    ruta: '/clientes/:id',
    resumen: 'Ficha completa del cliente',
    acceso: 'sesion',
    respuesta: `{
  "cliente":  { …resumen… },
  "facturas": [{ "folio": "F-1042", "monto": 28500, "estado": "vencida", "diasAtraso": 67, … }],
  "mensajes": [{ "rol": "agente", "agente": "redactor", "esPlantilla": true, "tono": "amable", … }],
  "promesas": [ … ],
  "escalamientos": [ … ]
}`
  },
  {
    metodo: 'GET',
    ruta: '/promesas',
    resumen: 'Promesas de pago con su cliente',
    acceso: 'sesion',
    respuesta: `[{ "id": "p01", "monto": 6480, "fechaCompromiso": "2026-10-13T…", "estado": "pendiente", "folio": "F-1120", "cliente": { … } }]`
  },
  {
    metodo: 'GET',
    ruta: '/eventos-agente',
    resumen: 'Actividad reciente',
    detalle: 'También llega en vivo por Supabase Realtime (tabla eventos_agente).',
    acceso: 'sesion',
    respuesta: `[{ "accion": "Recordatorio enviado a Imprenta Morales", "detalle": "Plantilla amable · WhatsApp", "estado": "completado", "fecha": "…" }]`
  },
  {
    metodo: 'POST',
    ruta: '/facturas/pagar',
    resumen: 'Marcar al cliente como pagado',
    detalle: 'Liquida sus facturas abiertas, cumple sus promesas pendientes y registra el pago.',
    acceso: 'sesion',
    cuerpo: `{ "clienteId": "c01" }`,
    respuesta: `{ "monto": 48750 }`,
    errores: [{ codigo: 404, cuando: 'Cliente no encontrado.' }]
  },
  {
    metodo: 'POST',
    ruta: '/promesas/:id/cumplir',
    resumen: 'Marcar una promesa como cumplida',
    detalle: 'Si el monto es menor que la factura, se descuenta como pago parcial.',
    acceso: 'sesion',
    respuesta: `{ "ok": true }`
  },
  {
    metodo: 'POST',
    ruta: '/demo/cargar',
    resumen: 'Cargar la cartera de ejemplo',
    acceso: 'sesion',
    respuesta: `{ "ok": true }`
  },
  {
    metodo: 'POST',
    ruta: '/demo/vaciar',
    resumen: 'Vaciar la cartera',
    acceso: 'sesion',
    respuesta: `{ "ok": true }`
  }]

},
{
  id: 'api-cobranza',
  titulo: 'Cobranza y conversaciones',
  descripcion: 'Cobrix prepara cada mensaje y una persona lo envía desde su WhatsApp (wa.me); la app registra el envío y las respuestas del cliente.',
  endpoints: [
  {
    metodo: 'POST',
    ruta: '/cobranza/preparar',
    resumen: 'Preparar recordatorios (no envía nada)',
    detalle:
    'Recalcula la prioridad, ordena la cola y la IA redacta el mensaje de cada cliente con el tono que toca (amable → firme → final, limitado por el tono máximo). Omite a quien espera respuesta, tiene promesa vigente, está en revisión o no tiene saldo. Devuelve borradores con el teléfono al que se abre WhatsApp.',
    acceso: 'ia',
    stream: true,
    cuerpo: `{ "clienteIds": ["c02", "c07", "c09"], "tono": "firme", "conIA": true }   // tono y conIA opcionales`,
    respuesta: `{"tipo":"progreso","progreso":{"fase":"analizando","orden":[],"actualId":null,"listos":[]}}
{"tipo":"progreso","progreso":{"fase":"redactando","orden":[…],"actualId":"c02","listos":[]}}
{"tipo":"progreso","progreso":{"fase":"listo","orden":[…],"actualId":null,"listos":["c02","c07"]}}
{"tipo":"resultado","resultado":{
  "borradores":[{"clienteId":"c02","empresa":"Taller Hernández","telefono":"+52 55 …","tono":"firme",
                 "texto":"Hola Ricardo, seguimos sin registrar…","origen":"ia"}],
  "omitidos":[{"clienteId":"c09","empresa":"Transportes Gómez","motivo":"Tiene una promesa de pago vigente"}]}}`,
    errores: [
    { codigo: 409, cuando: 'Fuera del horario de cobranza configurado.' }]

  },
  {
    metodo: 'POST',
    ruta: '/clientes/:id/envio',
    resumen: 'Registrar un mensaje enviado desde WhatsApp',
    detalle: 'El frontend abre https://wa.me/<teléfono>?text=<mensaje> y registra el envío. Con tono es un recordatorio (cuenta para el siguiente tono); sin tono, una respuesta del equipo.',
    acceso: 'sesion',
    cuerpo: `{ "texto": "Hola Ricardo…", "tono": "firme", "origen": "ia" }   // origen: ia | plantilla | manual`,
    respuesta: `{ "mensaje": { "rol": "agente", "agente": "redactor", "tono": "firme", "contenido": "Hola Ricardo…", … } }`
  },
  {
    metodo: 'POST',
    ruta: '/clientes/:id/respuesta',
    resumen: 'Registrar lo que respondió el cliente',
    detalle: 'La persona pega el mensaje que recibió por WhatsApp. Queda como "requiere atención" y se pausan sus recordatorios. Ninguna IA le contesta.',
    acceso: 'sesion',
    cuerpo: `{ "texto": "Te deposito 5 mil el viernes" }`,
    respuesta: `{ "mensaje": { "id": "…", "rol": "cliente", "contenido": "Te deposito 5 mil el viernes", "fecha": "…" } }`
  },
  {
    metodo: 'POST',
    ruta: '/clientes/:id/promesa',
    resumen: 'Registrar promesa de pago',
    detalle: 'Pausa los recordatorios del cliente hasta la fecha acordada.',
    acceso: 'sesion',
    cuerpo: `{ "monto": 24375, "fecha": "2026-10-16" }`,
    respuesta: `{ "promesa": { "id": "…", "monto": 24375, "fechaCompromiso": "2026-10-16T18:00:00.000Z", "estado": "pendiente" } }`,
    errores: [{ codigo: 409, cuando: 'Monto mayor al saldo, sin saldo o fecha en el pasado.' }]
  }]

},
{
  id: 'api-asistente',
  titulo: 'Asistente con IA',
  descripcion: 'Ayuda a la persona que cobra; nunca envía nada. Si la IA no está disponible o se agotó la cuota, cada ruta responde con reglas ("origen": "plantilla").',
  endpoints: [
  {
    metodo: 'POST',
    ruta: '/clientes/:id/redactar',
    resumen: 'Redactar o reescribir un recordatorio',
    detalle: 'Usa el tono pedido o el que toca por intentos. El texto debe incluir el saldo exacto; si no, se devuelve la plantilla.',
    acceso: 'ia',
    cuerpo: `{ "tono": "amable" }   // opcional`,
    respuesta: `{ "texto": "Hola Jorge, buen día…", "tono": "amable", "origen": "ia" }`
  },
  {
    metodo: 'POST',
    ruta: '/clientes/:id/sugerencias',
    resumen: '3 respuestas sugeridas + promesa detectada',
    detalle: 'Lee el último mensaje del cliente y el historial. La promesa solo se devuelve con fecha de hoy en adelante y monto ≤ saldo.',
    acceso: 'ia',
    respuesta: `{
  "sugerencias": [
    { "etiqueta": "Confirmar la promesa", "texto": "Perfecto, Jorge. Quedamos en que el viernes…" },
    { "etiqueta": "Pedir comprobante",    "texto": "Gracias, Jorge. Cuando hagas el pago…" },
    { "etiqueta": "Recordar el total",    "texto": "Te recuerdo que el saldo total es…" }
  ],
  "promesa": { "monto": 5000, "fecha": "2026-10-16", "cita": "Te deposito 5 mil el viernes" },
  "origen": "ia"
}`
  },
  {
    metodo: 'GET',
    ruta: '/resumen-diario',
    resumen: 'Resumen del día',
    detalle: 'Qué hacer primero y por qué, en 2–3 frases. Se guarda en caché mientras la cartera no cambie (no consume cuota).',
    acceso: 'ia',
    respuesta: `{
  "texto": "Primero contesta a Ferretería López: te escribió y espera tu respuesta. Después, el cobro más urgente es Taller Hernández…",
  "clientes": [{ "id": "c01", "empresa": "Ferretería López" }, { "id": "c02", "empresa": "Taller Hernández" }],
  "origen": "ia"
}`
  }]

},
{
  id: 'api-whatsapp',
  titulo: 'WhatsApp oficial · próximamente',
  descripcion: 'Ya programado; se activa cuando Meta apruebe la app (enviada a revisión el 12 de octubre de 2026). Cada cuenta registrará su número en la cuenta de WhatsApp Business de Cobrix, sin entrar a Meta. Requiere WHATSAPP_TOKEN y WHATSAPP_WABA_ID.',
  endpoints: [
  {
    metodo: 'GET',
    ruta: '/whatsapp/estado',
    resumen: 'Estado del número y de las plantillas',
    acceso: 'sesion',
    respuesta: `{
  "disponible": true,
  "estado": "conectado",              // desconectado | verificando | conectado
  "numero": "+52 55 4120 8890",
  "nombre": "Distribuidora del Valle",
  "calidad": "GREEN",
  "plantillas": [
    { "tono": "amable", "nombre": "cobrix_recordatorio_amable", "estado": "APPROVED" },
    { "tono": "firme",  "nombre": "cobrix_seguimiento_firme",   "estado": "PENDING" }
  ],
  "webhookUrl": "https://cobrix-backend-a53u.onrender.com/webhooks/whatsapp"
}`
  },
  {
    metodo: 'POST',
    ruta: '/whatsapp/conectar',
    resumen: 'Paso 1 · registrar el número y pedir el código',
    detalle: 'POST /{WABA}/phone_numbers y POST /{número}/request_code. El número no debe estar activo en la app de WhatsApp.',
    acceso: 'sesion',
    cuerpo: `{ "cc": "52", "numero": "55 4120 8890", "nombre": "Distribuidora del Valle", "metodo": "SMS" }`,
    respuesta: `{ "estado": "verificando", "numero": "+52 5541208890", … }`,
    errores: [{ codigo: 409, cuando: 'Número en uso en WhatsApp, límite de números, nombre rechazado o demasiados intentos.' }]
  },
  {
    metodo: 'POST',
    ruta: '/whatsapp/verificar',
    resumen: 'Paso 2 · validar el código y activar',
    detalle: 'verify_code → register (PIN de dos pasos) → subscribed_apps → crea las plantillas que falten. El canal de la cuenta pasa a WhatsApp.',
    acceso: 'sesion',
    cuerpo: `{ "codigo": "123456" }`,
    respuesta: `{ "estado": "conectado", … }`,
    errores: [{ codigo: 409, cuando: 'Código incorrecto o vencido.' }]
  },
  {
    metodo: 'POST',
    ruta: '/whatsapp/reenviar',
    resumen: 'Pedir otro código',
    acceso: 'sesion',
    cuerpo: `{ "metodo": "VOICE" }   // SMS | VOICE`,
    respuesta: `{ "ok": true }`
  },
  {
    metodo: 'POST',
    ruta: '/whatsapp/plantillas',
    resumen: 'Crear las plantillas que falten y actualizar su estado',
    detalle: 'POST /{WABA}/message_templates (categoría UTILITY, es_MX). Es idempotente.',
    acceso: 'sesion',
    respuesta: `{ …mismo objeto que GET /whatsapp/estado… }`
  },
  {
    metodo: 'POST',
    ruta: '/whatsapp/prueba',
    resumen: 'Enviar el recordatorio amable de ejemplo',
    acceso: 'sesion',
    cuerpo: `{ "telefono": "+52 55 1234 5678" }`,
    respuesta: `{ "ok": true }`
  },
  {
    metodo: 'POST',
    ruta: '/whatsapp/desconectar',
    resumen: 'Desconectar el número',
    detalle: 'La cuenta vuelve al simulador.',
    acceso: 'sesion',
    respuesta: `{ "ok": true }`
  }]

},
{
  id: 'api-guia',
  titulo: 'Guía (IA)',
  descripcion: 'Asistente que enseña a usar Cobrix. Lee el estado real de la cuenta y propone botones que iluminan dónde presionar.',
  endpoints: [
  {
    metodo: 'POST',
    ruta: '/guia/chat',
    resumen: 'Conversar con la Guía',
    detalle:
    'Vercel AI SDK · streamText con dos herramientas: estado_de_mi_cuenta (cifras reales) y mostrar_boton (acción en la UI). Sin API key de Gemini responde con preguntas frecuentes.',
    acceso: 'ia',
    stream: true,
    cuerpo: `{
  "pantalla": "/",
  "mensajes": [{ "rol": "usuario", "texto": "Un cliente me respondió, ¿qué hago?" }]
}`,
    respuesta: `{"tipo":"delta","texto":"Abre a Ferretería López y "}
{"tipo":"delta","texto":"contéstale desde el cuadro de abajo…"}
{"tipo":"accion","accion":{"destino":"atencion","etiqueta":"Ver quién espera respuesta"}}
{"tipo":"fin"}`,
    errores: [{ codigo: 429, cuando: 'Límite de uso por usuario alcanzado.' }]
  }]

}];


export const ENV_BACKEND: {nombre: string;requerida?: boolean;ejemplo: string;descripcion: string;}[] = [
{ nombre: 'SUPABASE_URL', requerida: true, ejemplo: 'https://xxxx.supabase.co', descripcion: 'URL del proyecto de Supabase.' },
{ nombre: 'SUPABASE_SERVICE_ROLE_KEY', requerida: true, ejemplo: 'sb_secret_…', descripcion: 'Clave secreta: solo en el servidor.' },
{ nombre: 'CORS_ORIGINS', ejemplo: 'https://cobrix-frontend.vercel.app', descripcion: 'Orígenes permitidos, separados por coma.' },
{ nombre: 'GOOGLE_GENERATIVE_AI_API_KEY', ejemplo: 'AIza…', descripcion: 'Gemini para la Guía. Sin ella, responde por reglas.' },
{ nombre: 'GEMINI_MODEL', ejemplo: 'gemini-3.8-flash', descripcion: 'Modelo de Google AI Studio.' },
{ nombre: 'GEMINI_THINKING', ejemplo: 'low', descripcion: 'minimal | low | medium | high. Menos = más rápido.' },
{ nombre: 'AI_RATE_LIMIT_PER_10MIN', ejemplo: '30', descripcion: 'Llamadas de IA por usuario cada 10 minutos.' },
{ nombre: 'WHATSAPP_TOKEN', ejemplo: 'EAAG…', descripcion: 'Token permanente de un usuario de sistema (whatsapp_business_management y _messaging).' },
{ nombre: 'WHATSAPP_WABA_ID', ejemplo: '1029384756', descripcion: 'Cuenta de WhatsApp Business de Cobrix: ahí se registran los números de las empresas.' },
{ nombre: 'WHATSAPP_PHONE_NUMBER_ID', ejemplo: '1234567890', descripcion: 'Opcional: número compartido de demo para cuentas sin número propio.' },
{ nombre: 'WHATSAPP_VERIFY_TOKEN', ejemplo: 'una-frase-secreta', descripcion: 'Lo inventas tú; el mismo va en Meta.' },
{ nombre: 'WHATSAPP_APP_SECRET', ejemplo: 'a1b2…', descripcion: 'Valida la firma de cada webhook.' },
{ nombre: 'WHATSAPP_TEMPLATE_*', ejemplo: 'cobrix_recordatorio_amable', descripcion: 'Nombres de las 3 plantillas (AMABLE, FIRME, FINAL).' },
{ nombre: 'PORT', ejemplo: '8787', descripcion: 'Render lo asigna solo.' }];


export const ENV_FRONTEND: {nombre: string;ejemplo: string;descripcion: string;}[] = [
{ nombre: 'VITE_AGENTS_API_URL', ejemplo: 'https://cobrix-backend-a53u.onrender.com', descripcion: 'URL del backend, sin / al final.' },
{ nombre: 'VITE_SUPABASE_URL', ejemplo: 'https://xxxx.supabase.co', descripcion: 'URL del proyecto de Supabase.' },
{ nombre: 'VITE_SUPABASE_ANON_KEY', ejemplo: 'sb_publishable_…', descripcion: 'Clave pública: el acceso lo limita RLS.' }];


export const TABLAS: {nombre: string;descripcion: string;columnas: string;}[] = [
{ nombre: 'perfiles', descripcion: 'Una fila por usuario: empresa, canal, reglas (jsonb) y su número de WhatsApp conectado.', columnas: 'user_id · nombre · empresa · canal · telefono_prueba · politicas · wa_phone_number_id · wa_numero · wa_estado' },
{ nombre: 'clientes', descripcion: 'Deudores de la empresa. telefono_digitos se genera para ubicar al cliente desde el webhook.', columnas: 'id · nombre · empresa · telefono · email · canal' },
{ nombre: 'facturas', descripcion: 'El atraso y "vencida" se calculan en el backend a partir de la fecha de vencimiento.', columnas: 'id · cliente_id · folio · monto · fecha_emision · fecha_vencimiento · estado' },
{ nombre: 'prioridades', descripcion: 'Último score calculado por cliente.', columnas: 'cliente_id · score · nivel · razon' },
{ nombre: 'mensajes', descripcion: 'Conversación. agente = redactor (plantilla automática) o null (persona del equipo).', columnas: 'id · cliente_id · rol · agente · contenido · tono · es_plantilla · canal · wa_message_id · fecha' },
{ nombre: 'promesas', descripcion: 'Compromisos de pago registrados por el equipo.', columnas: 'id · cliente_id · factura_id · monto · fecha_compromiso · estado' },
{ nombre: 'eventos_agente', descripcion: 'Actividad reciente. Se publica por Realtime.', columnas: 'id · cliente_id · accion · detalle · estado · fecha' },
{ nombre: 'escalamientos', descripcion: 'Casos en revisión: pausan los recordatorios.', columnas: 'id · cliente_id · motivo · resuelto' },
{ nombre: 'pagos', descripcion: 'Alimenta "Recuperado este mes" y la serie semanal.', columnas: 'id · cliente_id · monto · fecha' }];
