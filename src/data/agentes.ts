import type { AgenteId, AgenteMeta } from '../types/cobranza';

export const AGENTES: Record<AgenteId, AgenteMeta> = {
  director: {
    id: 'director',
    nombre: 'Director',
    rol: 'Coordina al equipo',
    texto: 'text-director',
    fondo: 'bg-brand',
    suave: 'bg-surface-2',
    anillo: 'ring-brand/70',
    delegacion: 'Coordinando al equipo…'
  },
  analista: {
    id: 'analista',
    nombre: 'Analista',
    rol: 'Prioriza a quién cobrar',
    texto: 'text-analista',
    fondo: 'bg-analista',
    suave: 'bg-analista/15',
    anillo: 'ring-analista/40',
    delegacion: 'Consultando al Analista…'
  },
  redactor: {
    id: 'redactor',
    nombre: 'Redactor',
    rol: 'Escribe los mensajes',
    texto: 'text-redactor',
    fondo: 'bg-redactor',
    suave: 'bg-redactor/15',
    anillo: 'ring-redactor/40',
    delegacion: 'Pidiendo borradores al Redactor…'
  },
  negociador: {
    id: 'negociador',
    nombre: 'Negociador',
    rol: 'Negocia con deudores',
    texto: 'text-negociador',
    fondo: 'bg-negociador',
    suave: 'bg-negociador/15',
    anillo: 'ring-negociador/40',
    delegacion: 'Revisando conversaciones con el Negociador…'
  }
};

export const ORDEN_AGENTES: AgenteId[] = ['director', 'analista', 'redactor', 'negociador'];

export const sugerenciasDirector = [
'¿Cuánto falta por cobrar?',
'¿Quién no ha respondido?',
'Resumen de la semana',
'Reintentar prioridad alta'];


export const sugerenciasCliente = [
'Les pago el viernes',
'¿Puedo pagar en dos partes?',
'Ahorita no tengo dinero',
'No reconozco ese cargo'];