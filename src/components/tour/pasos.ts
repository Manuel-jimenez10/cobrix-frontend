import type { EventoTutorial } from '../../utils/tutorial';

export interface ContextoPaso {
  /** Cliente con el que se practica el flujo. */
  clienteId: string | null;
  empresa: string;
  escritorio: boolean;
}

export type Avance =
{tipo: 'siguiente';} |
{tipo: 'clic';} |
{tipo: 'ruta';prueba: (ruta: string, ctx: ContextoPaso) => boolean;} |
{tipo: 'evento';evento: EventoTutorial;};

export interface PasoRecorrido {
  id: string;
  /** Valores de data-tour a iluminar, en orden de preferencia. */
  objetivo: (ctx: ContextoPaso) => string[];
  titulo: (ctx: ContextoPaso) => string;
  texto: (ctx: ContextoPaso) => string;
  avance: Avance;
  /** Pantalla donde vive el paso (o, si avanza por ruta, a dónde lleva): si el elemento no está visible, se ofrece ir. */
  ruta: (ctx: ContextoPaso) => string;
}

const rutaCliente = (ctx: ContextoPaso) => ctx.clienteId ? `/cartera/${ctx.clienteId}` : '/cartera';

export const PASOS_RECORRIDO: PasoRecorrido[] = [
{
  id: 'resumen',
  objetivo: () => ['resumen-diario', 'kpis'],
  titulo: () => 'Tu resumen del día',
  texto: () => 'Cada mañana el asistente te dice qué hacer primero y por qué: a quién contestar, qué promesas vencen y a quién cobrar.',
  avance: { tipo: 'siguiente' },
  ruta: () => '/'
},
{
  id: 'kpis',
  objetivo: () => ['kpis'],
  titulo: () => 'Esto es lo que te deben',
  texto: () => '“Por cobrar” es todo lo pendiente; “Vencido”, lo que ya pasó su fecha; y “Recuperado”, lo que te pagaron este mes.',
  avance: { tipo: 'siguiente' },
  ruta: () => '/'
},
{
  id: 'atencion',
  objetivo: () => ['por-atender', 'prioridad-hoy'],
  titulo: () => 'Empieza el día aquí',
  texto: () => 'Estos clientes te escribieron y esperan tu respuesta. Mientras no les contestes, Cobrix no les manda recordatorios.',
  avance: { tipo: 'siguiente' },
  ruta: () => '/'
},
{
  id: 'cartera',
  objetivo: () => ['nav-cartera'],
  titulo: () => 'Abre tu cartera',
  texto: () => 'Presiona “Cartera” para ver a todos tus clientes ordenados por prioridad.',
  avance: { tipo: 'ruta', prueba: (r) => r.startsWith('/cartera') },
  ruta: () => '/cartera'
},
{
  id: 'cliente',
  objetivo: (c) => [`cliente-${c.clienteId}`],
  titulo: (c) => `Abre a ${c.empresa}`,
  texto: () => 'Presiona su tarjeta para ver la conversación, sus facturas y por qué es prioridad.',
  avance: { tipo: 'ruta', prueba: (r, c) => r === `/cartera/${c.clienteId}` },
  ruta: rutaCliente
},
{
  id: 'responder',
  objetivo: () => ['responder'],
  titulo: () => 'Contéstale',
  texto: () => 'Con “Tú respondes” seleccionado, toca una sugerencia de la IA, revísala y presiona el botón verde: se abre tu WhatsApp con el mensaje listo para enviar.',
  avance: { tipo: 'evento', evento: 'atender' },
  ruta: rutaCliente
},
{
  id: 'pegar-respuesta',
  objetivo: () => ['pegar-respuesta'],
  titulo: () => 'Cuando te conteste',
  texto: () => 'Copia lo que te escribió en WhatsApp y pégalo con “Respuesta del cliente”. La IA te sugiere qué contestar y detecta si prometió pagar.',
  avance: { tipo: 'siguiente' },
  ruta: rutaCliente
},
{
  id: 'promesa',
  objetivo: () => ['registrar-promesa'],
  titulo: () => 'Registra lo que acordaron',
  texto: () => 'Si te dio una fecha de pago, presiona “Registrar promesa”. Cuando la IA la detecta en su mensaje, te la deja lista con monto y fecha.',
  avance: { tipo: 'clic' },
  ruta: rutaCliente
},
{
  id: 'confirmar-promesa',
  objetivo: () => ['form-promesa'],
  titulo: () => 'Elige monto y fecha',
  texto: () => 'Usa los atajos (Hoy, Viernes, +7 días…) o elige un día, y presiona “Registrar promesa”. Sus recordatorios se pausan hasta esa fecha.',
  avance: { tipo: 'evento', evento: 'promesa' },
  ruta: rutaCliente
},
{
  id: 'promesas',
  objetivo: () => ['nav-promesas'],
  titulo: () => 'Revisa tus promesas',
  texto: (c) => c.escritorio ? 'Presiona “Promesas” para ver los pagos comprometidos.' : 'Vuelve atrás y presiona “Promesas” abajo para ver los pagos comprometidos.',
  avance: { tipo: 'ruta', prueba: (r) => r.startsWith('/promesas') },
  ruta: () => '/promesas'
},
{
  id: 'cumplir',
  objetivo: () => ['cumplir-promesa'],
  titulo: () => 'Cuando te paguen',
  texto: () => 'Presiona “Cumplida” en una promesa cuando recibas el dinero. Se suma a lo recuperado del mes.',
  avance: { tipo: 'clic' },
  ruta: () => '/promesas'
},
{
  id: 'inicio',
  objetivo: () => ['nav-inicio'],
  titulo: () => 'Vuelve a Inicio',
  texto: () => 'Ahora vamos a mandar recordatorios a los clientes vencidos.',
  avance: { tipo: 'ruta', prueba: (r) => r === '/' },
  ruta: () => '/'
},
{
  id: 'iniciar',
  objetivo: () => ['iniciar-cobranza'],
  titulo: () => 'Envía recordatorios',
  texto: () => 'Presiona “Iniciar cobranza”: Cobrix ordena a los clientes vencidos y la IA redacta el mensaje de cada uno con el tono que le toca.',
  avance: { tipo: 'clic' },
  ruta: () => '/'
},
{
  id: 'confirmar-envio',
  objetivo: () => ['confirmar-envio'],
  titulo: () => 'Revisa a quién le escribes',
  texto: () => 'Aquí ves a quién se le escribirá y a quién se omite (por ejemplo, si espera tu respuesta o ya prometió pagar). Presiona “Preparar mensajes”.',
  avance: { tipo: 'clic' },
  ruta: () => '/'
},
{
  id: 'enviar-whatsapp',
  objetivo: () => ['enviar-whatsapp'],
  titulo: () => 'Revisa y envía desde tu WhatsApp',
  texto: () => 'Lee el mensaje, edítalo si quieres y presiona “Enviar por WhatsApp”. Se abre tu WhatsApp con el chat listo: envíalo y regresa. Con “Saltar” pasas al siguiente.',
  avance: { tipo: 'evento', evento: 'cobranza' },
  ruta: () => '/'
},
{
  id: 'listo-envio',
  objetivo: () => ['cobranza-listo', 'enviar-whatsapp'],
  titulo: () => '¡Así de rápido!',
  texto: () => 'Sigue con los demás o presiona “Listo”. Cuando alguien te conteste, pega su respuesta en su conversación y aparecerá en “Requieren tu atención”.',
  avance: { tipo: 'clic' },
  ruta: () => '/'
},
{
  id: 'guia',
  objetivo: () => ['abrir-guia'],
  titulo: () => '¿Dudas? Pregúntale a la Guía',
  texto: () => 'La Guía responde cualquier pregunta sobre Cobrix y te ilumina dónde presionar, igual que ahora. Presiónala para conocerla.',
  avance: { tipo: 'clic' },
  ruta: () => '/'
},
{
  id: 'fin',
  objetivo: () => [],
  titulo: () => '¡Listo, ya conoces todo el flujo!',
  texto: () => 'Contestar → registrar la promesa → marcarla cumplida → enviar recordatorios. En Ajustes puedes poner tu WhatsApp para pruebas y cambiar horarios.',
  avance: { tipo: 'siguiente' },
  ruta: () => '/'
}];
