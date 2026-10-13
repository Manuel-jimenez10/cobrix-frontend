/**
 * Implementación REAL de la capa de servicios.
 *  · Lecturas y acciones → backend de agentes (Hono, en Render) con el JWT de Supabase.
 *  · Respuestas de IA → streaming NDJSON (una línea JSON por evento).
 *  · Eventos en vivo → Supabase Realtime (RLS: cada usuario solo recibe lo suyo).
 * Las firmas son idénticas a mockApi.ts: los componentes no saben cuál se usa.
 */
import { supabase } from '../lib/supabase';
import type {
  Ajustes,
  Canal,
  ClienteDetalle,
  ClienteResumen,
  Dashboard,
  EventoAgente,
  EventoNegociacion,
  FiltrosClientes,
  Mensaje,
  Plantilla,
  ProgresoCobranza,
  PromesaConCliente,
  ResultadoCobranza } from
'../types/cobranza';
import type { EventoDirector, MensajeDirector } from '../types/director';
import type { Politicas } from '../types/politicas';
import { plantillas } from '../data/plantillas';
import { env } from '../utils/env';
import type { OpcionesCobranza } from './mockApi';

export interface Perfil {
  nombre: string;
  empresa: string;
  esAnonimo: boolean;
  iaActiva: boolean;
  modelo: string | null;
}

async function token(): Promise<string> {
  const { data } = await supabase!.auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new Error('Sesión expirada');
  return t;
}

async function pedir(ruta: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${env.agentsApiUrl}${ruta}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}`, ...(init.headers ?? {}) }
  });
  if (!res.ok) {
    const cuerpo = (await res.json().catch(() => ({}))) as {error?: string;};
    throw new Error(cuerpo.error ?? `Error ${res.status}`);
  }
  return res;
}

const get = async <T,>(ruta: string) => (await pedir(ruta)).json() as Promise<T>;
const post = async <T,>(ruta: string, cuerpo?: unknown, metodo = 'POST') =>
(await pedir(ruta, { method: metodo, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) })).json() as Promise<T>;

/** Lee un cuerpo NDJSON y entrega cada línea como objeto en cuanto llega. */
async function* ndjson<T>(ruta: string, cuerpo: unknown): AsyncGenerator<T> {
  const res = await pedir(ruta, { method: 'POST', body: JSON.stringify(cuerpo) });
  const lector = res.body!.getReader();
  const decoder = new TextDecoder();
  let resto = '';
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    resto += decoder.decode(value, { stream: true });
    const lineas = resto.split('\n');
    resto = lineas.pop() ?? '';
    for (const linea of lineas) {
      if (!linea.trim()) continue;
      const ev = JSON.parse(linea) as T & {tipo?: string;mensaje?: string;};
      if (ev.tipo === 'error') throw new Error(ev.mensaje ?? 'Error del agente');
      yield ev as T;
    }
  }
  if (resto.trim()) yield JSON.parse(resto) as T;
}

/* ───────────── Lecturas ───────────── */

export const getPerfil = () => get<Perfil>('/perfil');
export const getDashboard = () => get<Dashboard>('/dashboard');

export function getClientes(filtros: FiltrosClientes = {}): Promise<ClienteResumen[]> {
  const q = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v) q.set(k, String(v));
  });
  return get<ClienteResumen[]>(`/clientes${q.size ? `?${q}` : ''}`);
}

export const getCliente = (id: string) => get<ClienteDetalle | null>(`/clientes/${encodeURIComponent(id)}`);
export const getPromesas = () => get<PromesaConCliente[]>('/promesas');
export const getEventosAgente = () => get<EventoAgente[]>('/eventos-agente');

/* ───────────── Agentes (streaming) ───────────── */

export async function iniciarCobranza(clienteIds: string[], opciones: OpcionesCobranza = {}): Promise<ResultadoCobranza> {
  let resultado: ResultadoCobranza = { enviados: 0, mensajes: [] };
  for await (const ev of ndjson<{tipo: 'progreso';progreso: ProgresoCobranza;} | {tipo: 'resultado';resultado: ResultadoCobranza;}>(
    '/cobranza/iniciar',
    { clienteIds, tono: opciones.tono }
  )) {
    if (ev.tipo === 'progreso') opciones.onProgreso?.(ev.progreso);else
    resultado = ev.resultado;
  }
  return resultado;
}

export function responderComoCliente(clienteId: string, mensaje: string): AsyncGenerator<EventoNegociacion> {
  return ndjson<EventoNegociacion>('/cobranza/responder', { clienteId, mensaje });
}

export function chatDirector(mensajes: MensajeDirector[]): AsyncGenerator<EventoDirector> {
  return ndjson<EventoDirector>('/director/chat', { mensajes });
}

/* ───────────── Realtime ───────────── */

type Fila = Record<string, any>;

const aEvento = (r: Fila): EventoAgente => ({
  id: r.id,
  clienteId: r.cliente_id ?? null,
  agente: r.agente,
  accion: r.accion,
  detalle: r.detalle ?? '',
  estado: r.estado,
  fecha: r.fecha
});

const aMensaje = (r: Fila): Mensaje => ({
  id: r.id,
  clienteId: r.cliente_id,
  rol: r.rol,
  agente: r.agente ?? null,
  contenido: r.contenido,
  tono: r.tono ?? null,
  esPlantilla: Boolean(r.es_plantilla),
  fecha: r.fecha
});

let contadorCanales = 0;

function escuchar(tabla: string, filtro: (userId: string) => string, alRecibir: (fila: Fila) => void): () => void {
  let cancelado = false;
  let quitar = () => {};
  void supabase!.auth.getSession().then(({ data }) => {
    const userId = data.session?.user.id;
    if (cancelado || !userId) return;
    const canal = supabase!.
    channel(`${tabla}-${++contadorCanales}`).
    on('postgres_changes', { event: '*', schema: 'public', table: tabla, filter: filtro(userId) }, (payload) => {
      if (payload.new && Object.keys(payload.new).length) alRecibir(payload.new as Fila);
    }).
    subscribe();
    quitar = () => void supabase!.removeChannel(canal);
  });
  return () => {
    cancelado = true;
    quitar();
  };
}

export function suscribirEventos(callback: (evento: EventoAgente) => void): () => void {
  return escuchar('eventos_agente', (u) => `user_id=eq.${u}`, (f) => callback(aEvento(f)));
}

/** Mensajes nuevos de un cliente (por ejemplo, respuestas que llegan por WhatsApp). */
export function suscribirMensajes(clienteId: string, callback: (mensaje: Mensaje) => void): () => void {
  return escuchar('mensajes', (u) => `user_id=eq.${u}`, (f) => {
    if (f.cliente_id === clienteId) callback(aMensaje(f));
  });
}

/* ───────────── Mutaciones ───────────── */

export const marcarPagada = async (clienteId: string) => (await post<{monto: number;}>('/facturas/pagar', { clienteId })).monto;
export const cumplirPromesa = async (promesaId: string) => {
  await post(`/promesas/${encodeURIComponent(promesaId)}/cumplir`);
};
export const getAjustes = () => get<Ajustes>('/ajustes');
export const actualizarCanal = async (canal: Canal) => {
  await post('/ajustes', { canal }, 'PATCH');
};
export const actualizarTelefonoPrueba = async (telefonoPrueba: string | null) => {
  await post('/ajustes', { telefonoPrueba }, 'PATCH');
};
export const probarConexionWhatsApp = async () => {
  await post('/whatsapp/probar');
  return true;
};
export const getPlantillas = async (): Promise<Plantilla[]> => plantillas;
export const cargarDatosEjemplo = async () => {
  await post('/demo/cargar');
};
export const vaciarDatos = async () => {
  await post('/demo/vaciar');
};

/* ───────────── Políticas de negociación ───────────── */

export const getPoliticas = () => get<Politicas>('/politicas');
export const guardarPoliticas = (politicas: Politicas) => post<Politicas>('/politicas', politicas, 'PUT');
