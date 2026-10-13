/**
 * Respuestas por reglas para el modo demo sin backend (Director y Guía).
 */
import { recuperacionSemanal } from '../data/mockData';
import type { AgenteId } from '../types/cobranza';
import type { BloqueDirector } from '../types/director';
import type { AccionGuia } from '../types/guia';
import { formatFecha, formatMXN, normalizar, tiempoRelativo } from '../utils/format';
import { crearId } from '../utils/stream';
import { type Db, porFecha, resumir } from './mockDb';

export type PasoDirector =
{tipo: 'delegando';agente: AgenteId;texto: string;} |
{tipo: 'texto';texto: string;} |
{tipo: 'bloque';bloque: BloqueDirector;};

export function planDirector(db: Db, pregunta: string): PasoDirector[] {
  const q = normalizar(pregunta);
  const rs = db.clientes.map((c) => resumir(db, c));
  if (!rs.length) {
    return [{ tipo: 'texto', texto: 'Todavía no hay clientes en la cartera. Carga los datos de ejemplo desde Cartera o Ajustes y te doy el panorama completo.' }];
  }

  const conSaldo = rs.filter((r) => r.deuda > 0);
  const porCobrar = conSaldo.reduce((s, r) => s + r.deuda, 0);
  const vencido = db.facturas.filter((f) => f.estado === 'vencida').reduce((s, f) => s + f.monto, 0);
  const vencidos = rs.filter((r) => r.estado === 'vencido');
  const serie = recuperacionSemanal.map((p, i, arr) => i === arr.length - 1 ? { ...p, valor: p.valor + db.recuperadoSesion } : p);
  const grafica: BloqueDirector = { tipo: 'grafica', titulo: 'Recuperado por semana', total: serie.reduce((s, p) => s + p.valor, 0), puntos: serie };
  const promesasPend = db.promesas.filter((p) => p.estado === 'pendiente');

  if (/(reintent|reenvi|prioridad alta|vuelve a escribir|insist)/.test(q)) {
    const objetivo = rs.
    filter((r) => r.prioridad.nivel === 'alta' && r.deuda > 0 && !r.escalado && !r.requiereAtencion && r.estado !== 'promesa').
    sort((a, b) => b.prioridad.score - a.prioridad.score);
    const omitidos = rs.filter((r) => r.prioridad.nivel === 'alta' && r.escalado).length;
    if (!objetivo.length) {
      return [{ tipo: 'delegando', agente: 'analista', texto: 'Consultando al Analista…' }, { tipo: 'texto', texto: 'No hay clientes de prioridad alta pendientes de contactar. Todos tienen promesa de pago o están en revisión humana.' }];
    }
    return [
    { tipo: 'delegando', agente: 'analista', texto: 'Consultando al Analista…' },
    { tipo: 'delegando', agente: 'redactor', texto: 'Preparando recordatorios con el Redactor…' },
    { tipo: 'texto', texto: `El Analista confirma ${objetivo.length} clientes de prioridad alta sin acuerdo de pago${omitidos ? ` (omití ${omitidos} en revisión)` : ''}:` },
    { tipo: 'bloque', bloque: { tipo: 'clientes', titulo: 'Prioridad alta', clientes: objetivo.map((r) => ({ id: r.id, empresa: r.empresa, monto: r.deuda, detalle: `${r.diasAtraso} días de atraso · score ${r.prioridad.score}` })) } },
    { tipo: 'bloque', bloque: { tipo: 'confirmacion', id: crearId('conf'), mensaje: `Voy a reenviar el recordatorio firme a ${objetivo.length} clientes. ¿Confirmas?`, clienteIds: objetivo.map((r) => r.id), tono: 'firme', estado: 'pendiente' } }];

  }

  if (/(atender|atencion|esperan|me escribi|respondieron|pendientes de contestar|que hago hoy|contestar)/.test(q)) {
    const lista = rs.filter((r) => r.requiereAtencion).sort((a, b) => b.deuda - a.deuda);
    if (!lista.length) {
      return [{ tipo: 'delegando', agente: 'analista', texto: 'Buscando quién espera tu respuesta…' }, { tipo: 'texto', texto: 'Nadie está esperando tu respuesta ahora mismo. Buen momento para enviar recordatorios.' }];
    }
    return [
    { tipo: 'delegando', agente: 'analista', texto: 'Buscando quién espera tu respuesta…' },
    { tipo: 'texto', texto: `${lista.length} cliente${lista.length === 1 ? ' te escribió' : 's te escribieron'} y espera${lista.length === 1 ? '' : 'n'} tu respuesta. Sus recordatorios están en pausa:` },
    { tipo: 'bloque', bloque: { tipo: 'clientes', titulo: 'Esperan tu respuesta', clientes: lista.map((r) => ({ id: r.id, empresa: r.empresa, monto: r.deuda, detalle: `“${(r.ultimoMensaje?.contenido ?? '').slice(0, 48)}”` })) } }];

  }

  if (/(respond|contest|silencio|ignor)/.test(q)) {
    const sinRespuesta = conSaldo.
    map((r) => ({ r, ms: db.mensajes.filter((m) => m.clienteId === r.id).sort(porFecha) })).
    filter(({ ms }) => ms.length > 0 && ms[ms.length - 1].rol === 'agente' && ms[ms.length - 1].agente === 'redactor').
    sort((a, b) => b.r.deuda - a.r.deuda);
    if (!sinRespuesta.length) {
      return [{ tipo: 'delegando', agente: 'analista', texto: 'Revisando conversaciones…' }, { tipo: 'texto', texto: 'Buenas noticias: todos los clientes contactados han respondido.' }];
    }
    return [
    { tipo: 'delegando', agente: 'analista', texto: 'Revisando conversaciones…' },
    { tipo: 'texto', texto: `${sinRespuesta.length} clientes no han contestado su último mensaje:` },
    { tipo: 'bloque', bloque: { tipo: 'clientes', titulo: 'Sin respuesta', clientes: sinRespuesta.map(({ r, ms }) => ({ id: r.id, empresa: r.empresa, monto: r.deuda, detalle: `Último mensaje ${tiempoRelativo(ms[ms.length - 1].fecha)}` })) } },
    { tipo: 'texto', texto: 'Si quieres, les reenvío el recordatorio con la plantilla firme. Solo dime "reintentar prioridad alta".' }];

  }

  if (/(resumen|semana|como vamos|como va)/.test(q)) {
    const escalados = rs.filter((r) => r.escalado).length;
    const montoPromesas = promesasPend.reduce((s, p) => s + p.monto, 0);
    return [
    { tipo: 'delegando', agente: 'analista', texto: 'Consultando al Analista…' },
    { tipo: 'delegando', agente: 'analista', texto: 'Revisando promesas de pago…' },
    { tipo: 'texto', texto: 'Así va la semana:' },
    { tipo: 'bloque', bloque: { tipo: 'kpi', etiqueta: 'Recuperado esta semana', valor: serie[serie.length - 1].valor, variacion: 29.7, detalle: 'vs. semana anterior', mejorSi: 'sube' } },
    { tipo: 'bloque', bloque: grafica },
    { tipo: 'texto', texto: `Tienes ${promesasPend.length} promesas de pago activas por ${formatMXN(montoPromesas)}.${escalados ? ` Hay ${escalados} caso escalado que necesita tu revisión.` : ''}` }];

  }

  if (/(promesa|compromiso)/.test(q)) {
    const lista = promesasPend.
    map((p) => ({ p, c: db.clientes.find((c) => c.id === p.clienteId) })).
    filter((x) => x.c).
    sort((a, b) => a.p.fechaCompromiso.localeCompare(b.p.fechaCompromiso));
    return [
    { tipo: 'delegando', agente: 'analista', texto: 'Revisando promesas de pago…' },
    { tipo: 'texto', texto: `Hay ${lista.length} promesas de pago activas:` },
    { tipo: 'bloque', bloque: { tipo: 'clientes', titulo: 'Promesas activas', clientes: lista.map(({ p, c }) => ({ id: c!.id, empresa: c!.empresa, monto: p.monto, detalle: `Compromiso ${formatFecha(p.fechaCompromiso)}` })) } }];

  }

  if (/(falta|cobrar|cuanto|debe|adeudo|cartera|vencid)/.test(q)) {
    const top = [...vencidos].sort((a, b) => b.prioridad.score - a.prioridad.score).slice(0, 2);
    return [
    { tipo: 'delegando', agente: 'analista', texto: 'Consultando al Analista…' },
    { tipo: 'texto', texto: `Tienes ${formatMXN(porCobrar)} por cobrar en ${conSaldo.length} clientes. De eso, ${formatMXN(vencido)} ya está vencido.` },
    { tipo: 'bloque', bloque: { tipo: 'kpi', etiqueta: 'Por cobrar', valor: porCobrar, variacion: -6.2, detalle: 'vs. semana pasada', mejorSi: 'baja' } },
    { tipo: 'bloque', bloque: grafica },
    ...(top.length ?
    [{ tipo: 'texto' as const, texto: `Lo más urgente: ${top.map((t) => t.empresa).join(' y ')} suman ${formatMXN(top.reduce((s, t) => s + t.deuda, 0))}. ¿Quieres que les envíe el recordatorio firme?` }] :
    [])];

  }

  return [
  { tipo: 'texto', texto: `Puedo darte el estado de la cartera, decirte quién no ha respondido quién espera tu respuesta o preparar un reenvío de recordatorios. Ahora mismo hay ${formatMXN(vencido)} vencido en ${vencidos.length} clientes.` },
  { tipo: 'bloque', bloque: { tipo: 'kpi', etiqueta: 'Vencido', valor: vencido, variacion: -4.1, detalle: 'vs. semana pasada', mejorSi: 'baja' } }];

}


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
    return 'Cuando un cliente contesta, su conversación queda marcada como "Requiere atención" y se pausan sus recordatorios. Abre al cliente, escríbele desde el cuadro de abajo (modo "Tú (equipo)") y, si acuerdan una fecha, usa "Registrar promesa".' + (
    n ? ` Ahora mismo tienes ${n} cliente${n === 1 ? '' : 's'} esperando tu respuesta.` : '');
  },
  acciones: [{ destino: 'atencion', etiqueta: 'Ver quién espera respuesta' }]
},
{
  patron: /(promesa|compromet|acuerdo|fecha de pago)/,
  texto: () => 'Las promesas las registras tú: abre al cliente → "Registrar promesa", pon monto y fecha. Aparecen en Promesas y, cuando pague, toca "Marcar cumplida". Mientras la promesa esté vigente no se le envían recordatorios.',
  acciones: [{ destino: 'promesas', etiqueta: 'Ir a Promesas' }]
},
{
  patron: /(recordatorio|enviar|mandar|cobrar|cobranza|plantilla)/,
  texto: () => 'Toca "Iniciar cobranza": el Analista ordena a los clientes y el Redactor les manda la plantilla que toca (amable, firme o final). Se omite a quien espera tu respuesta o ya prometió pagar. También puedes enviar a un solo cliente desde su ficha con "Enviar recordatorio".',
  acciones: [{ destino: 'iniciar_cobranza', etiqueta: 'Iniciar cobranza' }]
},
{
  patron: /(prioridad|score|primero|orden|analista)/,
  texto: () => 'El Analista calcula un score de 0 a 100 con reglas: días de atraso, monto, mensajes sin respuesta y promesas incumplidas (una promesa vigente lo baja). La razón de cada cliente está en su pestaña "Facturas y análisis".',
  acciones: [{ destino: 'cartera', etiqueta: 'Ver cartera' }]
},
{
  patron: /(whatsapp|meta|numero|telefono|24 ?h|ventana)/,
  texto: () => 'Meta solo permite texto libre durante 24 h después del último mensaje del cliente; fuera de esa ventana solo plantillas aprobadas. Por eso los recordatorios son plantillas. En Ajustes eliges el canal y tu número de pruebas.',
  acciones: [{ destino: 'whatsapp', etiqueta: 'Configurar WhatsApp' }]
},
{
  patron: /(horario|tono|regla|politica|ajuste|configur)/,
  texto: () => 'En Ajustes → "Reglas de cobranza" defines en qué días y horas se pueden enviar recordatorios y el tono más fuerte permitido.',
  acciones: [{ destino: 'reglas', etiqueta: 'Abrir reglas de cobranza' }]
},
{
  patron: /(director|pregunt|reporte|cuanto)/,
  texto: () => 'El Director es el asistente de IA para tu cartera: pregúntale "¿cuánto falta por cobrar?" o "¿a quién debo contestar?" y te responde con datos reales. Si sugiere un envío, tú lo confirmas.',
  acciones: [{ destino: 'director', etiqueta: 'Hablar con el Director' }]
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
    texto: 'Te sugiero este orden: 1) revisa la cartera y quién va primero, 2) inicia una cobranza, 3) en un cliente, simula su respuesta y contéstale como equipo, 4) registra la promesa. El recorrido guiado te lleva paso a paso.',
    acciones: [{ destino: 'recorrido', etiqueta: 'Iniciar recorrido guiado' }, { destino: 'cartera', etiqueta: 'Ver cartera' }]
  };
}
