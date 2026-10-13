export type Canal = 'whatsapp' | 'simulador';
/** 'negociador' se conserva por compatibilidad: hoy representa las acciones de una persona del equipo. */
export type AgenteId = 'director' | 'analista' | 'redactor' | 'negociador';
export type Tono = 'amable' | 'firme' | 'final';
export type EstadoFactura = 'pendiente' | 'vencida' | 'pagada' | 'promesa';
export type NivelPrioridad = 'alta' | 'media' | 'baja';
export type EstadoCliente = 'al_dia' | 'por_vencer' | 'vencido' | 'promesa';
export type EstadoEvento = 'en_progreso' | 'completado' | 'error';
export type EstadoPromesa = 'pendiente' | 'cumplida' | 'incumplida';
export type OrdenClientes = 'prioridad' | 'monto' | 'atraso' | 'nombre';

export interface Cliente {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  canal: Canal;
}

export interface Factura {
  id: string;
  clienteId: string;
  folio: string;
  monto: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoFactura;
  diasAtraso: number;
}

export interface Prioridad {
  clienteId: string;
  score: number;
  nivel: NivelPrioridad;
  razon: string;
}

export interface Mensaje {
  id: string;
  clienteId: string;
  rol: 'agente' | 'cliente';
  agente: AgenteId | null;
  contenido: string;
  tono: Tono | null;
  esPlantilla: boolean;
  fecha: string;
}

export interface EventoAgente {
  id: string;
  clienteId: string | null;
  agente: AgenteId;
  accion: string;
  detalle: string;
  estado: EstadoEvento;
  fecha: string;
}

export interface PromesaPago {
  id: string;
  clienteId: string;
  facturaId: string;
  monto: number;
  fechaCompromiso: string;
  estado: EstadoPromesa;
}

export interface Escalamiento {
  id: string;
  clienteId: string;
  motivo: string;
  fecha: string;
  resuelto: boolean;
}

export interface ClienteResumen extends Cliente {
  deuda: number;
  diasAtraso: number;
  estado: EstadoCliente;
  prioridad: Prioridad;
  facturasAbiertas: number;
  ultimoMensaje: Mensaje | null;
  escalado: boolean;
  /** El cliente escribió y nadie del equipo le ha contestado. */
  requiereAtencion: boolean;
}

export interface ClienteDetalle {
  cliente: ClienteResumen;
  facturas: Factura[];
  mensajes: Mensaje[];
  promesas: PromesaPago[];
  escalamientos: Escalamiento[];
}

export interface FiltrosClientes {
  busqueda?: string;
  estado?: EstadoCliente | 'todos';
  prioridad?: NivelPrioridad | 'todas';
  orden?: OrdenClientes;
  /** Solo clientes que esperan respuesta del equipo. */
  atencion?: boolean;
}

export interface TramoAntiguedad {
  rango: string;
  monto: number;
  clientes: number;
}

export interface PuntoSerie {
  etiqueta: string;
  valor: number;
}

export interface Dashboard {
  porCobrar: number;
  facturasAbiertas: number;
  vencido: number;
  clientesVencidos: number;
  recuperadoMes: number;
  recuperadoVariacion: number;
  promesasActivas: number;
  montoPromesas: number;
  antiguedad: TramoAntiguedad[];
  tareasHoy: Record<AgenteId, number>;
  recuperacionSemanal: PuntoSerie[];
}

export interface PromesaConCliente extends PromesaPago {
  cliente: Cliente;
  folio: string;
}

export interface Plantilla {
  tono: Tono;
  nombre: string;
  descripcion: string;
  contenido: string;
}

export interface ItemColaCobranza {
  clienteId: string;
  empresa: string;
  score: number;
  nivel: NivelPrioridad;
  tono: Tono;
}

export interface ProgresoCobranza {
  fase: 'analizando' | 'redactando' | 'listo';
  orden: ItemColaCobranza[];
  actualId: string | null;
  /** Clientes cuyo mensaje ya está redactado. */
  listos: string[];
}

/** Recordatorio listo para que una persona lo revise y lo envíe desde su WhatsApp. */
export interface Borrador {
  clienteId: string;
  empresa: string;
  nombre: string;
  /** Teléfono al que se abre WhatsApp (en modo demo, el de pruebas). */
  telefono: string;
  deuda: number;
  tono: Tono;
  texto: string;
  /** 'ia' = lo redactó el asistente; 'plantilla' = texto base. */
  origen: OrigenTexto;
}

export type OrigenTexto = 'ia' | 'plantilla';

export interface ResultadoPreparacion {
  borradores: Borrador[];
  /** Clientes que no recibirán recordatorio y por qué. */
  omitidos: {clienteId: string;empresa: string;motivo: string;}[];
}

export interface Sugerencia {
  etiqueta: string;
  texto: string;
}

export interface PromesaDetectada {
  monto: number;
  /** AAAA-MM-DD */
  fecha: string;
  cita: string;
}

export interface ResultadoSugerencias {
  sugerencias: Sugerencia[];
  promesa: PromesaDetectada | null;
  origen: OrigenTexto;
}

export interface ResumenDia {
  texto: string;
  clientes: {id: string;empresa: string;}[];
  origen: OrigenTexto;
}

export interface Ajustes {
  canal: Canal;
  /** Número real al que se redirigen los WhatsApp en modo demo (backend real). */
  telefonoPrueba?: string | null;
  /** El backend tiene un modelo de IA configurado. */
  iaActiva?: boolean;
  whatsapp: {
    conectado: boolean;
    numero: string;
    proveedor: string;
    plantillasAprobadas: number;
    ultimaSincronizacion: string;
  };
}

export interface AgenteMeta {
  id: AgenteId;
  nombre: string;
  rol: string;
  texto: string;
  fondo: string;
  suave: string;
  anillo: string;
  delegacion: string;
}