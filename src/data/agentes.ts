import type { AgenteId, AgenteMeta } from '../types/cobranza';

export const AGENTES: Record<AgenteId, AgenteMeta> = {
  director: {
    id: 'director',
    nombre: 'Director',
    rol: 'IA · responde sobre tu cartera',
    texto: 'text-director',
    fondo: 'bg-brand',
    suave: 'bg-surface-2',
    anillo: 'ring-brand/70',
    delegacion: 'Coordinando al equipo…'
  },
  analista: {
    id: 'analista',
    nombre: 'Analista',
    rol: 'Automático · prioriza a quién cobrar',
    texto: 'text-analista',
    fondo: 'bg-analista',
    suave: 'bg-analista/15',
    anillo: 'ring-analista/40',
    delegacion: 'Consultando al Analista…'
  },
  redactor: {
    id: 'redactor',
    nombre: 'Redactor',
    rol: 'Automático · envía recordatorios',
    texto: 'text-redactor',
    fondo: 'bg-redactor',
    suave: 'bg-redactor/15',
    anillo: 'ring-redactor/40',
    delegacion: 'Pidiendo borradores al Redactor…'
  },
  negociador: {
    id: 'negociador',
    nombre: 'Tu equipo',
    rol: 'Atiende respuestas y acuerda pagos',
    texto: 'text-negociador',
    fondo: 'bg-negociador',
    suave: 'bg-negociador/15',
    anillo: 'ring-negociador/40',
    delegacion: 'Revisando conversaciones…'
  }
};

export const ORDEN_AGENTES: AgenteId[] = ['director', 'analista', 'redactor', 'negociador'];

export const sugerenciasDirector = [
'¿Cuánto falta por cobrar?',
'¿Quién no ha respondido?',
'¿A quién debo contestar?',
'Reintentar prioridad alta'];


/** Respuestas rápidas del simulador (el administrador escribe como si fuera el cliente). */
export const sugerenciasCliente = [
'Les pago el viernes',
'¿Puedo pagar en dos partes?',
'Ahorita no tengo dinero',
'No reconozco ese cargo'];

/** Respuestas rápidas para el equipo. */
export const sugerenciasEquipo = [
'Claro, ¿qué fecha te funciona?',
'Podemos dividirlo en dos pagos',
'Te reenvío la factura',
'Gracias, quedo atento al pago'];