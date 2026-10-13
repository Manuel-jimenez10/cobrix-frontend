import type { ConversacionDirector } from '../types/director';

const hace = (horas: number) => new Date(Date.now() - horas * 3_600_000).toISOString();

export const conversacionesEjemplo: ConversacionDirector[] = [
{
  id: 'conv-01',
  titulo: '¿Cuánto falta por cobrar?',
  fecha: hace(2),
  mensajes: [
  { id: 'd01', rol: 'usuario', fecha: hace(2), bloques: [{ tipo: 'texto', texto: '¿Cuánto falta por cobrar?' }] },
  {
    id: 'd02',
    rol: 'director',
    fecha: hace(2),
    delegaciones: ['analista'],
    bloques: [
    { tipo: 'texto', texto: 'Tienes $436,810.00 MXN por cobrar en 15 clientes. De eso, $354,400.00 MXN ya está vencido.' },
    { tipo: 'kpi', etiqueta: 'Por cobrar', valor: 436810, variacion: -6.2, detalle: 'vs. semana pasada', mejorSi: 'baja' },
    { tipo: 'texto', texto: 'Taller Mecánico Hernández y Construcciones Ramírez concentran $157,400.00 MXN con más de 90 días. Son la prioridad del Analista.' }]

  }]

},
{
  id: 'conv-02',
  titulo: '¿Quién no ha respondido?',
  fecha: hace(22),
  mensajes: [
  { id: 'd03', rol: 'usuario', fecha: hace(22), bloques: [{ tipo: 'texto', texto: '¿Quién no ha respondido?' }] },
  {
    id: 'd04',
    rol: 'director',
    fecha: hace(22),
    delegaciones: ['negociador'],
    bloques: [
    { tipo: 'texto', texto: 'Cuatro clientes no han contestado su último mensaje:' },
    {
      tipo: 'clientes',
      titulo: 'Sin respuesta',
      clientes: [
      { id: 'c02', empresa: 'Taller Mecánico Hernández', monto: 85000, detalle: 'Aviso final hace 5 días' },
      { id: 'c07', empresa: 'Construcciones Ramírez', monto: 72400, detalle: 'Seguimiento firme hace 9 días' },
      { id: 'c09', empresa: 'Transportes Gómez', monto: 54300, detalle: 'Recordatorio hace 8 días' },
      { id: 'c13', empresa: 'Imprenta Morales', monto: 15600, detalle: 'Recordatorio ayer' }]

    },
    { tipo: 'texto', texto: 'Si quieres, el Redactor les escribe con un tono más firme.' }]

  }]

},
{
  id: 'conv-03',
  titulo: 'Reintentar prioridad alta',
  fecha: hace(50),
  mensajes: [
  { id: 'd05', rol: 'usuario', fecha: hace(50), bloques: [{ tipo: 'texto', texto: 'Reintentar prioridad alta' }] },
  {
    id: 'd06',
    rol: 'director',
    fecha: hace(50),
    delegaciones: ['analista', 'redactor'],
    bloques: [
    { tipo: 'texto', texto: 'El Analista confirma 3 clientes de prioridad alta sin acuerdo de pago.' },
    {
      tipo: 'confirmacion',
      id: 'conf-ej-01',
      mensaje: 'Voy a reenviar mensajes con tono firme a 3 clientes. ¿Confirmas?',
      clienteIds: ['c02', 'c07', 'c09'],
      tono: 'firme',
      estado: 'confirmada'
    }]

  },
  {
    id: 'd07',
    rol: 'director',
    fecha: hace(50),
    bloques: [{ tipo: 'texto', texto: 'Listo. El Redactor envió 3 mensajes con tono firme. Te aviso en cuanto alguien responda.' }]
  }]

},
{
  id: 'conv-04',
  titulo: 'Resumen de la semana',
  fecha: hace(120),
  mensajes: [
  { id: 'd08', rol: 'usuario', fecha: hace(120), bloques: [{ tipo: 'texto', texto: 'Resumen de la semana' }] },
  {
    id: 'd09',
    rol: 'director',
    fecha: hace(120),
    delegaciones: ['analista', 'negociador'],
    bloques: [
    { tipo: 'texto', texto: 'Buena semana: recuperaste más que la anterior.' },
    { tipo: 'kpi', etiqueta: 'Recuperado en la semana', valor: 29450, variacion: 12.4, detalle: 'vs. semana anterior', mejorSi: 'sube' },
    {
      tipo: 'grafica',
      titulo: 'Recuperado por semana',
      total: 169600,
      puntos: [
      { etiqueta: '18 ago', valor: 18400 },
      { etiqueta: '25 ago', valor: 22150 },
      { etiqueta: '1 sep', valor: 15900 },
      { etiqueta: '8 sep', valor: 27300 },
      { etiqueta: '15 sep', valor: 24800 },
      { etiqueta: '22 sep', valor: 31600 },
      { etiqueta: '29 sep', valor: 29450 }]

    },
    { tipo: 'texto', texto: 'El Negociador cerró 3 promesas de pago y solo un caso necesitó intervención humana.' }]

  }]

}];