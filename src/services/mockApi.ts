/**
 * Implementación MOCK de la capa de servicios (datos en memoria).
 * Se usa cuando no hay VITE_AGENTS_API_URL / Supabase configurados:
 * así la app sigue funcionando como demo sin backend.
 */
import { empresaUsuario, recuperacionSemanal } from '../data/mockData';
import { plantillas } from '../data/plantillas';
import type {
  AgenteId,
  Ajustes,
  Canal,
  Cliente,
  ClienteDetalle,
  ClienteResumen,
  Dashboard,
  EventoAgente,
  FiltrosClientes,
  Mensaje,
  Plantilla,
  ProgresoCobranza,
  PromesaConCliente,
  OrigenTexto,
  PromesaPago,
  ResultadoPreparacion,
  ResultadoSugerencias,
  ResumenDia,
  Borrador,
  Tono } from
'../types/cobranza';
import type { EventoGuia, MensajeGuia } from '../types/guia';
import type { EstadoWhatsApp, MetodoCodigo } from '../types/whatsapp';
import { llenarPlantilla, siguienteTono } from '../utils/cobranza';
import { formatFecha, formatMXN, normalizar, primerNombre } from '../utils/format';
import { crearId, escribir, espera } from '../utils/stream';
import {
  actualizarEvento,
  clonar,
  crearDb,
  emitir,
  facturasAbiertas,
  porFecha,
  resumir,
  store,
  suscriptores } from
'./mockDb';
import { responderGuia } from './simuladores';
import { aISO, resumenPorReglas, sugerirPorReglas, type DatosResumen } from '../utils/asistente';

const BASE_RECUPERADO = 126_400;
const BASE_TAREAS: Record<AgenteId, number> = { director: 6, analista: 18, redactor: 23, negociador: 11 };
const suma = (xs: {monto: number;}[]) => xs.reduce((s, x) => s + x.monto, 0);

// GET /dashboard
export async function getDashboard(): Promise<Dashboard> {
  await espera(450, 750);
  const db = store.db;
  const abiertas = db.facturas.filter((f) => f.estado !== 'pagada');
  const resumenes = db.clientes.map((c) => resumir(db, c));
  const conDatos = db.clientes.length > 0;
  const tramos = [
  { rango: '0–30', min: 0, max: 30 },
  { rango: '31–60', min: 31, max: 60 },
  { rango: '61–90', min: 61, max: 90 },
  { rango: '+90', min: 91, max: Infinity }];

  const pendientes = db.promesas.filter((p) => p.estado === 'pendiente');
  const tareasHoy = {} as Record<AgenteId, number>;
  (Object.keys(BASE_TAREAS) as AgenteId[]).forEach((a) => {
    tareasHoy[a] = (conDatos ? BASE_TAREAS[a] : 0) + db.tareasSesion[a];
  });

  return {
    porCobrar: suma(abiertas),
    facturasAbiertas: abiertas.length,
    vencido: suma(abiertas.filter((f) => f.estado === 'vencida')),
    clientesVencidos: resumenes.filter((r) => r.estado === 'vencido').length,
    recuperadoMes: (conDatos ? BASE_RECUPERADO : 0) + db.recuperadoSesion,
    recuperadoVariacion: conDatos ? 18.2 : 0,
    promesasActivas: pendientes.length,
    montoPromesas: suma(pendientes),
    antiguedad: tramos.map((t) => {
      const fs = abiertas.filter((f) => f.diasAtraso >= t.min && f.diasAtraso <= t.max);
      return { rango: t.rango, monto: suma(fs), clientes: new Set(fs.map((f) => f.clienteId)).size };
    }),
    tareasHoy,
    recuperacionSemanal: conDatos ?
    recuperacionSemanal.map((p, i, arr) => i === arr.length - 1 ? { ...p, valor: p.valor + db.recuperadoSesion } : p) :
    []
  };
}

// GET /clientes?busqueda&estado&prioridad&orden
export async function getClientes(filtros: FiltrosClientes = {}): Promise<ClienteResumen[]> {
  await espera(220, 420);
  const db = store.db;
  const q = normalizar(filtros.busqueda ?? '').trim();
  let lista = db.clientes.map((c) => resumir(db, c));
  if (q) {
    lista = lista.filter((c) => {
      const folios = db.facturas.filter((f) => f.clienteId === c.id).map((f) => f.folio).join(' ');
      return normalizar(`${c.empresa} ${c.nombre} ${c.telefono} ${folios}`).includes(q);
    });
  }
  if (filtros.estado && filtros.estado !== 'todos') lista = lista.filter((c) => c.estado === filtros.estado);
  if (filtros.prioridad && filtros.prioridad !== 'todas') lista = lista.filter((c) => c.prioridad.nivel === filtros.prioridad);
  if (filtros.atencion) lista = lista.filter((c) => c.requiereAtencion);
  const orden = filtros.orden ?? 'prioridad';
  lista.sort((a, b) => {
    if (orden === 'monto') return b.deuda - a.deuda;
    if (orden === 'atraso') return b.diasAtraso - a.diasAtraso;
    if (orden === 'nombre') return a.empresa.localeCompare(b.empresa, 'es');
    return b.prioridad.score - a.prioridad.score;
  });
  return clonar(lista);
}

// GET /clientes/:id
export async function getCliente(id: string): Promise<ClienteDetalle | null> {
  await espera(280, 480);
  const db = store.db;
  const cliente = db.clientes.find((c) => c.id === id);
  if (!cliente) return null;
  return clonar({
    cliente: resumir(db, cliente),
    facturas: db.facturas.filter((f) => f.clienteId === id).sort((a, b) => b.diasAtraso - a.diasAtraso),
    mensajes: db.mensajes.filter((m) => m.clienteId === id).sort(porFecha),
    promesas: db.promesas.filter((p) => p.clienteId === id).sort((a, b) => b.fechaCompromiso.localeCompare(a.fechaCompromiso)),
    escalamientos: db.escalamientos.filter((e) => e.clienteId === id)
  });
}

// GET /promesas
export async function getPromesas(): Promise<PromesaConCliente[]> {
  await espera(250, 450);
  const db = store.db;
  const lista: PromesaConCliente[] = [];
  db.promesas.forEach((p) => {
    const cliente = db.clientes.find((c) => c.id === p.clienteId);
    if (!cliente) return;
    lista.push({ ...p, cliente, folio: db.facturas.find((f) => f.id === p.facturaId)?.folio ?? '—' });
  });
  return clonar(lista.sort((a, b) => a.fechaCompromiso.localeCompare(b.fechaCompromiso)));
}

// GET /eventos-agente
export async function getEventosAgente(): Promise<EventoAgente[]> {
  await espera(200, 400);
  return clonar(store.db.eventos);
}

export interface OpcionesCobranza {
  tono?: Tono;
  /** Redactar con IA (en la demo sin servidor siempre se usa la plantilla). */
  conIA?: boolean;
  onProgreso?: (progreso: ProgresoCobranza) => void;
}

/* Teléfono de pruebas: en la demo sin servidor vive en este navegador. */
const CLAVE_TEL = 'cobrix:telefono-prueba';
let telefonoPruebaMock: string | null = (() => {
  try {
    return localStorage.getItem(CLAVE_TEL);
  } catch {
    return null;
  }
})();

export async function actualizarTelefonoPrueba(telefono: string | null): Promise<void> {
  await espera(200, 350);
  telefonoPruebaMock = telefono?.trim() || null;
  try {
    if (telefonoPruebaMock) localStorage.setItem(CLAVE_TEL, telefonoPruebaMock);else
    localStorage.removeItem(CLAVE_TEL);
  } catch {

    /* sin almacenamiento: queda en memoria */}
}

const destino = (c: Cliente) => telefonoPruebaMock || c.telefono;

function textoPlantilla(c: ClienteResumen, tono: Tono): string {
  const plantilla = plantillas.find((p) => p.tono === tono) ?? plantillas[0];
  return llenarPlantilla(plantilla.contenido, {
    nombre: primerNombre(c.nombre),
    empresa: empresaUsuario.nombre,
    folio: facturasAbiertas(store.db, c.id).map((f) => f.folio).join(' y '),
    monto: formatMXN(c.deuda),
    dias: String(c.diasAtraso)
  });
}

// POST /cobranza/preparar (prioriza y redacta; no envía nada)
export async function prepararCobranza(clienteIds: string[], opciones: OpcionesCobranza = {}): Promise<ResultadoPreparacion> {
  const db = store.db;
  const { onProgreso, tono: tonoForzado } = opciones;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const omitidos: ResultadoPreparacion['omitidos'] = [];
  const candidatos = clienteIds.
  map((id) => db.clientes.find((c) => c.id === id)).
  filter((c): c is Cliente => Boolean(c)).
  map((c) => resumir(db, c)).
  filter((c) => {
    const motivo =
    c.deuda <= 0 ? 'Sin saldo pendiente' :
    c.requiereAtencion ? 'Te escribió y espera tu respuesta' :
    c.escalado ? 'Caso en revisión del equipo' :
    db.promesas.some((p) => p.clienteId === c.id && p.estado === 'pendiente' && new Date(p.fechaCompromiso) >= hoy) ? 'Tiene una promesa de pago vigente' :
    null;
    if (motivo) omitidos.push({ clienteId: c.id, empresa: c.empresa, motivo });
    return !motivo;
  }).
  sort((a, b) => b.prioridad.score - a.prioridad.score);

  const orden = candidatos.map((c) => ({
    clienteId: c.id,
    empresa: c.empresa,
    score: c.prioridad.score,
    nivel: c.prioridad.nivel,
    tono: tonoForzado ?? siguienteTono(db.mensajes.filter((m) => m.clienteId === c.id))
  }));
  const listos: string[] = [];
  const reportar = (fase: ProgresoCobranza['fase'], actualId: string | null) => onProgreso?.({ fase, orden, actualId, listos: [...listos] });

  reportar('analizando', null);
  const evA = emitir(db, { agente: 'analista', clienteId: null, accion: 'Ordenando clientes por prioridad', detalle: `${candidatos.length} clientes en evaluación`, estado: 'en_progreso' });
  await espera(450, 650);
  actualizarEvento(db, evA.id, {
    estado: 'completado',
    accion: 'Clientes ordenados por prioridad',
    detalle: candidatos[0] ? `${candidatos[0].empresa} va primero · score ${candidatos[0].prioridad.score}` : 'Nadie necesita recordatorio ahora'
  });

  const borradores: Borrador[] = [];
  for (const item of orden) {
    const c = candidatos.find((x) => x.id === item.clienteId);
    if (!c) continue;
    reportar('redactando', c.id);
    await espera(160, 260);
    borradores.push({ clienteId: c.id, empresa: c.empresa, nombre: c.nombre, telefono: destino(c), deuda: c.deuda, tono: item.tono, texto: textoPlantilla(c, item.tono), origen: 'plantilla' });
    listos.push(c.id);
  }
  if (borradores.length) {
    emitir(db, {
      agente: 'redactor',
      clienteId: null,
      accion: `${borradores.length} ${borradores.length === 1 ? 'recordatorio listo' : 'recordatorios listos'} para enviar`,
      detalle: 'Con plantilla · se envían desde tu WhatsApp',
      estado: 'completado'
    });
  }
  reportar('listo', null);
  return { borradores: clonar(borradores), omitidos };
}

// POST /clientes/:id/envio (la persona lo envió desde su WhatsApp)
export async function registrarEnvio(clienteId: string, datos: {texto: string;tono: Tono | null;origen: OrigenTexto | 'manual';}): Promise<Mensaje> {
  const db = store.db;
  const cliente = db.clientes.find((c) => c.id === clienteId);
  if (!cliente) throw new Error('Cliente no encontrado');
  await espera(120, 220);
  const recordatorio = Boolean(datos.tono);
  const msg: Mensaje = {
    id: crearId('msg'),
    clienteId,
    rol: 'agente',
    agente: recordatorio ? 'redactor' : null,
    contenido: datos.texto,
    tono: datos.tono,
    esPlantilla: datos.origen === 'plantilla',
    fecha: new Date().toISOString()
  };
  db.mensajes.push(msg);
  emitir(
    db,
    recordatorio ?
    { agente: 'redactor', clienteId, accion: `Recordatorio enviado a ${cliente.empresa}`, detalle: `Tono ${datos.tono}${datos.origen === 'ia' ? ' · redactado con IA' : ''} · desde tu WhatsApp`, estado: 'completado' } :
    { agente: 'negociador', clienteId, accion: `Respondiste a ${cliente.empresa}`, detalle: datos.texto.slice(0, 60), estado: 'completado' }
  );
  return clonar(msg);
}

// POST /clientes/:id/respuesta (lo que el cliente contestó por WhatsApp)
export async function registrarRespuesta(clienteId: string, texto: string): Promise<Mensaje> {
  const db = store.db;
  const cliente = db.clientes.find((c) => c.id === clienteId);
  if (!cliente) throw new Error('Cliente no encontrado');
  await espera(150, 250);
  const msg: Mensaje = { id: crearId('msg'), clienteId, rol: 'cliente', agente: null, contenido: texto, tono: null, esPlantilla: false, fecha: new Date().toISOString() };
  db.mensajes.push(msg);
  emitir(db, { agente: 'analista', clienteId, accion: `${cliente.empresa} te escribió`, detalle: `“${texto.slice(0, 57)}” · espera tu respuesta`, estado: 'completado' });
  return clonar(msg);
}

// POST /clientes/:id/redactar
export async function redactarRecordatorio(clienteId: string, tono?: Tono): Promise<{texto: string;tono: Tono;origen: OrigenTexto;}> {
  const db = store.db;
  const cliente = db.clientes.find((c) => c.id === clienteId);
  if (!cliente) throw new Error('Cliente no encontrado');
  await espera(350, 600);
  const t = tono ?? siguienteTono(db.mensajes.filter((m) => m.clienteId === clienteId));
  return { texto: textoPlantilla(resumir(db, cliente), t), tono: t, origen: 'plantilla' };
}

// POST /clientes/:id/sugerencias
export async function sugerirRespuestas(clienteId: string): Promise<ResultadoSugerencias> {
  const db = store.db;
  const cliente = db.clientes.find((c) => c.id === clienteId);
  if (!cliente) throw new Error('Cliente no encontrado');
  await espera(400, 700);
  const r = resumir(db, cliente);
  const ultimo = [...db.mensajes].filter((m) => m.clienteId === clienteId).sort(porFecha).reverse().find((m) => m.rol === 'cliente');
  const folios = facturasAbiertas(db, clienteId).map((f) => f.folio).join(' y ');
  const res = sugerirPorReglas(ultimo?.contenido ?? '', { nombre: primerNombre(cliente.nombre), deuda: r.deuda, folios });
  return clonar({ ...res, promesa: ultimo ? res.promesa : null, origen: 'plantilla' as const });
}

// GET /resumen-diario
export async function getResumenDiario(): Promise<ResumenDia> {
  await espera(300, 500);
  const db = store.db;
  const rs = db.clientes.map((c) => resumir(db, c));
  const hoy = aISO(new Date());
  const pendientes = db.promesas.filter((p) => p.estado === 'pendiente' || p.estado === 'incumplida');
  const deHoy = pendientes.filter((p) => aISO(new Date(p.fechaCompromiso)) === hoy);
  const vencidas = pendientes.filter((p) => aISO(new Date(p.fechaCompromiso)) < hoy);
  const datos: DatosResumen = {
    esperan: rs.filter((r) => r.requiereAtencion).map((r) => ({ id: r.id, empresa: r.empresa })),
    top: rs.
    filter((r) => r.deuda > 0 && !r.requiereAtencion && r.estado !== 'promesa').
    sort((a, b) => b.prioridad.score - a.prioridad.score).
    slice(0, 3).
    map((r) => ({ id: r.id, empresa: r.empresa, deuda: r.deuda, diasAtraso: r.diasAtraso, razon: r.prioridad.razon })),
    promesasHoy: { n: deHoy.length, monto: suma(deHoy) },
    promesasVencidas: { n: vencidas.length, monto: suma(vencidas) },
    listosParaRecordatorio: rs.filter((r) => r.deuda > 0 && !r.requiereAtencion && !r.escalado && r.estado === 'vencido').length,
    vencido: rs.filter((r) => r.estado === 'vencido').reduce((s, r) => s + r.deuda, 0)
  };
  const clientes = [...datos.esperan.slice(0, 2), ...datos.top.slice(0, 2)].filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i).slice(0, 3);
  return { texto: resumenPorReglas(datos), clientes, origen: 'plantilla' };
}

// POST /clientes/:id/promesa
export async function registrarPromesa(clienteId: string, datos: {monto: number;fecha: string;}): Promise<PromesaPago> {
  const db = store.db;
  const cliente = db.clientes.find((c) => c.id === clienteId);
  if (!cliente) throw new Error('Cliente no encontrado');
  await espera(250, 400);
  const abiertas = facturasAbiertas(db, clienteId).sort((a, b) => b.diasAtraso - a.diasAtraso);
  if (datos.monto > suma(abiertas) + 0.01) throw new Error(`El monto supera el saldo pendiente (${formatMXN(suma(abiertas))}).`);
  const promesa: PromesaPago = {
    id: crearId('prom'),
    clienteId,
    facturaId: abiertas[0]?.id ?? '',
    monto: Math.round(datos.monto * 100) / 100,
    fechaCompromiso: new Date(`${datos.fecha}T12:00:00`).toISOString(),
    estado: 'pendiente'
  };
  db.promesas.push(promesa);
  abiertas.forEach((f) => {
    f.estado = 'promesa';
  });
  emitir(db, { agente: 'negociador', clienteId, accion: `Promesa de pago de ${cliente.empresa}`, detalle: `${formatMXN(promesa.monto)} para el ${formatFecha(promesa.fechaCompromiso)}`, estado: 'completado' });
  return clonar(promesa);
}

// POST /guia/chat (sin backend: preguntas frecuentes)
export async function* chatGuia(mensajes: MensajeGuia[], _pantalla: string): AsyncGenerator<EventoGuia> {
  const pregunta = [...mensajes].reverse().find((m) => m.rol === 'usuario')?.texto ?? '';
  await espera(300, 500);
  const r = responderGuia(store.db, pregunta);
  for await (const delta of escribir(r.texto)) yield { tipo: 'delta', texto: delta };
  for (const accion of r.acciones) yield { tipo: 'accion', accion };
  yield { tipo: 'fin' };
}

// Supabase Realtime (simulado): las acciones de la sesión notifican a los suscriptores.
export function suscribirEventos(callback: (evento: EventoAgente) => void): () => void {
  suscriptores.add(callback);
  return () => {
    suscriptores.delete(callback);
  };
}

// POST /facturas/pagar
export async function marcarPagada(clienteId: string): Promise<number> {
  await espera(350, 550);
  const db = store.db;
  const cliente = db.clientes.find((c) => c.id === clienteId);
  const abiertas = facturasAbiertas(db, clienteId);
  const monto = suma(abiertas);
  abiertas.forEach((f) => {
    f.estado = 'pagada';
    f.diasAtraso = 0;
  });
  db.promesas.filter((p) => p.clienteId === clienteId && p.estado === 'pendiente').forEach((p) => {
    p.estado = 'cumplida';
  });
  db.recuperadoSesion += monto;
  emitir(db, { agente: 'director', clienteId, accion: `Pago registrado de ${cliente?.empresa ?? 'cliente'}`, detalle: `${formatMXN(monto)} · facturas liquidadas`, estado: 'completado' });
  return monto;
}

// POST /promesas/:id/cumplir
export async function cumplirPromesa(promesaId: string): Promise<void> {
  await espera(300, 500);
  const db = store.db;
  const promesa = db.promesas.find((p) => p.id === promesaId);
  if (!promesa) throw new Error('Promesa no encontrada');
  promesa.estado = 'cumplida';
  const factura = db.facturas.find((f) => f.id === promesa.facturaId);
  if (factura && factura.estado !== 'pagada') {
    if (promesa.monto >= factura.monto - 0.01) {
      factura.estado = 'pagada';
      factura.diasAtraso = 0;
    } else {
      factura.monto = Math.round((factura.monto - promesa.monto) * 100) / 100;
      factura.estado = factura.diasAtraso > 0 ? 'vencida' : 'pendiente';
    }
  }
  db.recuperadoSesion += promesa.monto;
  const cliente = db.clientes.find((c) => c.id === promesa.clienteId);
  emitir(db, { agente: 'negociador', clienteId: promesa.clienteId, accion: `Promesa cumplida de ${cliente?.empresa ?? 'cliente'}`, detalle: `${formatMXN(promesa.monto)} recibidos`, estado: 'completado' });
}

// GET /ajustes
export async function getAjustes(): Promise<Ajustes> {
  await espera(150, 300);
  return {
    canal: store.db.canal,
    telefonoPrueba: telefonoPruebaMock,
    iaActiva: false,
    whatsapp: {
      conectado: true,
      numero: '+52 55 4120 8890',
      proveedor: 'WhatsApp Business Platform · Cloud API',
      plantillasAprobadas: 3,
      ultimaSincronizacion: new Date(Date.now() - 2 * 60_000).toISOString()
    }
  };
}

// PATCH /ajustes
export async function actualizarCanal(canal: Canal): Promise<void> {
  await espera(200, 350);
  store.db.canal = canal;
}

export async function probarConexionWhatsApp(): Promise<boolean> {
  await espera(900, 1300);
  return true;
}

export async function getPlantillas(): Promise<Plantilla[]> {
  await espera(150, 250);
  return clonar(plantillas);
}

export async function cargarDatosEjemplo(): Promise<void> {
  await espera(600, 900);
  store.db = crearDb(true, store.db.canal);
}

export async function vaciarDatos(): Promise<void> {
  await espera(150, 250);
  store.db = crearDb(false, store.db.canal);
}
/* ───────────── WhatsApp propio (simulado: el código de prueba es 123456) ───────────── */

let waMock: EstadoWhatsApp = {
  disponible: true,
  estado: 'desconectado',
  numero: null,
  nombre: null,
  calidad: null,
  estadoNombre: null,
  plantillas: (['amable', 'firme', 'final'] as const).map((tono) => ({ tono, nombre: `cobrix_${tono}`, estado: 'NO_CREADA' })),
  webhookUrl: 'https://cobrix-backend.onrender.com/webhooks/whatsapp'
};

export async function getWhatsApp(): Promise<EstadoWhatsApp> {
  await espera(250, 400);
  return clonar(waMock);
}

export async function conectarWhatsApp(datos: {cc: string;numero: string;nombre: string;metodo: MetodoCodigo;}): Promise<EstadoWhatsApp> {
  await espera(900, 1300);
  waMock = { ...waMock, estado: 'verificando', numero: `+${datos.cc.replace('+', '')} ${datos.numero}`, nombre: datos.nombre };
  return clonar(waMock);
}

export async function reenviarCodigoWhatsApp(_: MetodoCodigo): Promise<void> {
  await espera(600, 900);
}

export async function verificarCodigoWhatsApp(codigo: string): Promise<EstadoWhatsApp> {
  await espera(1200, 1600);
  if (codigo !== '123456') throw new Error('El código no es correcto. En la demo sin servidor usa 123456.');
  waMock = {
    ...waMock,
    estado: 'conectado',
    calidad: 'GREEN',
    estadoNombre: 'APPROVED',
    plantillas: waMock.plantillas.map((p, i) => ({ ...p, estado: i === 0 ? 'APPROVED' : 'PENDING' }))
  };
  store.db.canal = 'whatsapp';
  return clonar(waMock);
}

export async function desconectarWhatsApp(): Promise<void> {
  await espera(400, 600);
  waMock = { ...waMock, estado: 'desconectado', numero: null, nombre: null, calidad: null, estadoNombre: null };
  store.db.canal = 'simulador';
}

export async function sincronizarPlantillas(): Promise<EstadoWhatsApp> {
  await espera(500, 800);
  waMock = { ...waMock, plantillas: waMock.plantillas.map((p) => ({ ...p, estado: p.estado === 'NO_CREADA' ? 'PENDING' : p.estado === 'PENDING' ? 'APPROVED' : p.estado })) };
  return clonar(waMock);
}

export async function enviarPruebaWhatsApp(_: string): Promise<void> {
  await espera(700, 1000);
}
