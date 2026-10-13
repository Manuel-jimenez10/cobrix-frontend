/**
 * Respuestas por reglas de la Guía para el modo demo sin backend.
 */
import type { AccionGuia } from '../types/guia';
import { formatMXN, normalizar } from '../utils/format';
import { type Db, resumir } from './mockDb';

/* ───────────── Guía (preguntas frecuentes) ───────────── */

interface Faq {
  patron: RegExp;
  texto: (db: Db) => string;
  acciones: AccionGuia[];
}

const FAQS: Faq[] = [
{
  patron: /(respond|contest|atencion|me escribio|escribieron|negoci)/,
  texto: (db) => {
    const n = db.clientes.map((c) => resumir(db, c)).filter((r) => r.requiereAtencion).length;
    return 'Cuando un cliente contesta, su conversación queda marcada como "Requiere atención" y se pausan sus recordatorios. Abre al cliente: con "Tú respondes" la IA te sugiere respuestas; elige una, revísala y presiona el botón verde para enviarla desde tu WhatsApp. Si acuerdan una fecha, usa "Registrar promesa". Cuando el cliente te conteste en WhatsApp, pega su mensaje con "Respuesta del cliente".' + (
    n ? ` Ahora mismo tienes ${n} cliente${n === 1 ? '' : 's'} esperando tu respuesta.` : '');
  },
  acciones: [{ destino: 'atencion', etiqueta: 'Ver quién espera respuesta' }]
},
{
  patron: /(promesa|compromet|acuerdo|fecha de pago)/,
  texto: () => 'Las promesas las registras tú: abre al cliente → "Registrar promesa", pon monto y fecha. Aparecen en Promesas y, cuando pague, toca "Marcar cumplida". Mientras la promesa esté vigente no se le envían recordatorios.',
  acciones: [{ destino: 'registrar_promesa', etiqueta: 'Registrar promesa de Ferretería López', clienteId: 'c01' }]
},
{
  patron: /(recordatorio|enviar|mandar|cobrar|cobranza|plantilla)/,
  texto: () => 'Toca "Iniciar cobranza": Cobrix ordena a los clientes por prioridad y prepara el mensaje de cada uno con el tono que le toca (amable, firme o final). Luego los revisas uno a uno y presionas "Enviar por WhatsApp": se abre tu WhatsApp con el chat y el texto listos. Se omite a quien espera tu respuesta o ya prometió pagar.',
  acciones: [{ destino: 'iniciar_cobranza', etiqueta: 'Iniciar cobranza' }]
},
{
  patron: /(\bia\b|inteligencia|sugerencia|redact|resumen del dia|asistente)/,
  texto: () => 'La IA te ayuda en cuatro cosas: 1) redacta cada recordatorio según el tono, el atraso y el historial del cliente; 2) cuando un cliente responde, te sugiere 3 respuestas; 3) detecta si prometió pagar y te deja la promesa lista; 4) en Inicio te da el resumen del día. Tú siempre revisas y envías: nada sale solo.',
  acciones: [{ destino: 'atencion', etiqueta: 'Ver sugerencias en un cliente' }]
},
{
  patron: /(prioridad|score|primero|orden|analista)/,
  texto: () => 'Cobrix calcula un score de 0 a 100 con reglas: días de atraso, monto, mensajes sin respuesta y promesas incumplidas (una promesa vigente lo baja). La razón de cada cliente está en su pestaña "Facturas y análisis".',
  acciones: [{ destino: 'cartera', etiqueta: 'Ver cartera' }]
},
{
  patron: /(whatsapp|meta|numero|telefono|24 ?h|ventana)/,
  texto: () => 'Los mensajes salen desde tu propio WhatsApp: Cobrix lo abre con el chat del cliente y el texto listo, tú solo presionas enviar. No hay nada que configurar. Para probar con los clientes de ejemplo (sus números son ficticios), pon tu número en Ajustes → "Tu WhatsApp para pruebas". El envío automático con la API oficial de Meta llega pronto: la app está en revisión desde el 12 de octubre de 2026.',
  acciones: [{ destino: 'whatsapp', etiqueta: 'Abrir ajustes de WhatsApp' }]
},
{
  patron: /(horario|tono|regla|politica|ajuste|configur)/,
  texto: () => 'En Ajustes → "Reglas de cobranza" defines en qué días y horas se pueden enviar recordatorios y el tono más fuerte permitido.',
  acciones: [{ destino: 'reglas', etiqueta: 'Abrir reglas de cobranza' }]
},
{
  patron: /(cuanto|debe|vencid|cartera|resumen|reporte)/,
  texto: (db) => {
    const rs = db.clientes.map((c) => resumir(db, c));
    const porCobrar = rs.reduce((s, r) => s + r.deuda, 0);
    const vencido = rs.filter((r) => r.estado === 'vencido').reduce((s, r) => s + r.deuda, 0);
    const top = rs.filter((r) => r.deuda > 0).sort((a, b) => b.prioridad.score - a.prioridad.score)[0];
    return `Tienes ${formatMXN(porCobrar)} por cobrar en ${rs.filter((r) => r.deuda > 0).length} clientes; ${formatMXN(vencido)} ya está vencido.${top ? ` Lo más urgente es ${top.empresa} (${formatMXN(top.deuda)}).` : ''}`;
  },
  acciones: [{ destino: 'cartera', etiqueta: 'Ver cartera' }]
},
{
  patron: /(pag|liquid)/,
  texto: () => 'Si el cliente liquidó todo, abre su ficha y toca "Marcar pagada". Si pagó una promesa, ve a Promesas y toca "Marcar cumplida".',
  acciones: [{ destino: 'promesas', etiqueta: 'Ir a Promesas' }]
}];


export function responderGuia(db: Db, pregunta: string): {texto: string;acciones: AccionGuia[];} {
  const q = normalizar(pregunta);
  const faq = FAQS.find((f) => f.patron.test(q));
  if (faq) return { texto: faq.texto(db), acciones: faq.acciones };
  return {
    texto: 'El flujo es: 1) contesta a quien te escribió, 2) registra la promesa de pago, 3) envía recordatorios a los vencidos y 4) marca como cumplida la promesa cuando te paguen. El recorrido guiado te ilumina cada botón paso a paso.',
    acciones: [{ destino: 'recorrido', etiqueta: 'Iniciar recorrido guiado' }]
  };
}
