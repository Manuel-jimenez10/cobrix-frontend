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
  texto: () => 'Con “Tú (equipo)” seleccionado, toca una sugerencia o escribe tu respuesta y presiona enviar. Le llega por WhatsApp.',
  avance: { tipo: 'evento', evento: 'atender' },
  ruta: rutaCliente
},
{
  id: 'promesa',
  objetivo: () => ['registrar-promesa'],
  titulo: () => 'Registra lo que acordaron',
  texto: () => 'Si te dio una fecha de pago, presiona “Registrar promesa”.',
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
  texto: () => 'Presiona “Iniciar cobranza”: a cada cliente vencido le llega por WhatsApp la plantilla que le toca (amable, firme o aviso final).',
  avance: { tipo: 'clic' },
  ruta: () => '/'
},
{
  id: 'confirmar-envio',
  objetivo: () => ['confirmar-envio'],
  titulo: () => 'Revisa y confirma',
  texto: () => 'Aquí ves a quién se le enviará y a quién se omite (por ejemplo, si espera tu respuesta o ya prometió pagar). Presiona “Enviar”.',
  avance: { tipo: 'evento', evento: 'cobranza' },
  ruta: () => '/'
},
{
  id: 'listo-envio',
  objetivo: () => ['cobranza-listo'],
  titulo: () => '¡Recordatorios enviados!',
  texto: () => 'Cuando alguien conteste, aparecerá en “Requieren tu atención” y en la Cartera como “Espera respuesta”. Presiona “Listo”.',
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
  texto: () => 'Contestar → registrar la promesa → marcarla cumplida → enviar recordatorios. Para conectar tu WhatsApp o cambiar horarios, entra a Ajustes.',
  avance: { tipo: 'siguiente' },
  ruta: () => '/'
}];
