import {
  clientes,
  escalamientos,
  eventosAgente,
  facturas,
  mensajes,
  prioridades,
  promesas } from
'../data/mockData';
import type {
  AgenteId,
  Canal,
  Cliente,
  ClienteResumen,
  Escalamiento,
  EstadoCliente,
  EventoAgente,
  Factura,
  Mensaje,
  Prioridad,
  PromesaPago } from
'../types/cobranza';
import { diasHasta } from '../utils/format';
import { crearId } from '../utils/stream';

export interface Db {
  clientes: Cliente[];
  facturas: Factura[];
  prioridades: Prioridad[];
  mensajes: Mensaje[];
  eventos: EventoAgente[];
  promesas: PromesaPago[];
  escalamientos: Escalamiento[];
  canal: Canal;
  recuperadoSesion: number;
  tareasSesion: Record<AgenteId, number>;
}

export function clonar<T>(valor: T): T {
  return structuredClone(valor);
}

const tareasVacias = (): Record<AgenteId, number> => ({ director: 0, analista: 0, redactor: 0, negociador: 0 });

export function crearDb(conDatos: boolean, canal: Canal = 'whatsapp'): Db {
  const base = { canal, recuperadoSesion: 0, tareasSesion: tareasVacias() };
  if (!conDatos) {
    return { ...base, clientes: [], facturas: [], prioridades: [], mensajes: [], eventos: [], promesas: [], escalamientos: [] };
  }
  return {
    ...base,
    ...clonar({ clientes, facturas, prioridades, mensajes, eventos: eventosAgente, promesas, escalamientos })
  };
}

/** Estado en memoria que simula la base de datos. */
export const store: {db: Db;} = { db: crearDb(true) };

export const porFecha = (a: {fecha: string;}, b: {fecha: string;}) => a.fecha.localeCompare(b.fecha);

export function facturasAbiertas(db: Db, clienteId: string): Factura[] {
  return db.facturas.filter((f) => f.clienteId === clienteId && f.estado !== 'pagada');
}

export function estadoDeFacturas(abiertas: Factura[]): EstadoCliente {
  if (!abiertas.length) return 'al_dia';
  if (abiertas.some((f) => f.estado === 'vencida')) return 'vencido';
  if (abiertas.some((f) => f.estado === 'promesa')) return 'promesa';
  if (abiertas.some((f) => f.estado === 'pendiente' && diasHasta(f.fechaVencimiento) <= 7)) return 'por_vencer';
  return 'al_dia';
}

export function resumir(db: Db, c: Cliente): ClienteResumen {
  const abiertas = facturasAbiertas(db, c.id);
  const msgs = db.mensajes.filter((m) => m.clienteId === c.id).sort(porFecha);
  const prioridad = db.prioridades.find((p) => p.clienteId === c.id) ?? {
    clienteId: c.id,
    score: 0,
    nivel: 'baja' as const,
    razon: 'El Analista aún no evalúa a este cliente.'
  };
  return {
    ...c,
    deuda: abiertas.reduce((s, f) => s + f.monto, 0),
    diasAtraso: abiertas.reduce((m, f) => Math.max(m, f.diasAtraso), 0),
    estado: estadoDeFacturas(abiertas),
    prioridad: abiertas.length ? prioridad : { ...prioridad, score: 0, nivel: 'baja', razon: 'Sin saldo pendiente.' },
    facturasAbiertas: abiertas.length,
    ultimoMensaje: msgs[msgs.length - 1] ?? null,
    escalado: db.escalamientos.some((e) => e.clienteId === c.id && !e.resuelto)
  };
}

type Suscriptor = (evento: EventoAgente) => void;
export const suscriptores = new Set<Suscriptor>();

function notificar(evento: EventoAgente) {
  suscriptores.forEach((s) => s(clonar(evento)));
}

export function emitir(db: Db, parcial: Omit<EventoAgente, 'id' | 'fecha'>): EventoAgente {
  const evento: EventoAgente = { ...parcial, id: crearId('ev'), fecha: new Date().toISOString() };
  db.eventos.unshift(evento);
  db.eventos.splice(80);
  if (evento.estado !== 'en_progreso') db.tareasSesion[evento.agente] += 1;
  notificar(evento);
  return evento;
}

export function actualizarEvento(db: Db, id: string, cambios: Partial<Omit<EventoAgente, 'id'>>) {
  const evento = db.eventos.find((e) => e.id === id);
  if (!evento) return;
  const estabaEnCurso = evento.estado === 'en_progreso';
  Object.assign(evento, cambios, { fecha: new Date().toISOString() });
  if (estabaEnCurso && evento.estado !== 'en_progreso') db.tareasSesion[evento.agente] += 1;
  notificar(evento);
}