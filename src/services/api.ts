/**
 * Capa de servicios de Cobrix.
 * Si hay backend configurado (VITE_AGENTS_API_URL + Supabase) usa la API real;
 * si no, funciona con datos mock en memoria. Los componentes no cambian.
 */
import { usaDatosMock } from '../utils/env';
import * as http from './httpApi';
import * as mock from './mockApi';
import { conDefaults, type Politicas } from '../types/politicas';

export type { OpcionesCobranza } from './mockApi';
export type { Perfil } from './httpApi';

const impl = usaDatosMock ? mock : http;

export const getDashboard = impl.getDashboard;
export const getClientes = impl.getClientes;
export const getCliente = impl.getCliente;
export const getPromesas = impl.getPromesas;
export const getEventosAgente = impl.getEventosAgente;
export const iniciarCobranza = impl.iniciarCobranza;
export const responderComoCliente = impl.responderComoCliente;
export const chatDirector = impl.chatDirector;
export const suscribirEventos = impl.suscribirEventos;
export const marcarPagada = impl.marcarPagada;
export const cumplirPromesa = impl.cumplirPromesa;
export const getAjustes = impl.getAjustes;
export const actualizarCanal = impl.actualizarCanal;
export const probarConexionWhatsApp = impl.probarConexionWhatsApp;
export const getPlantillas = impl.getPlantillas;
export const cargarDatosEjemplo = impl.cargarDatosEjemplo;
export const vaciarDatos = impl.vaciarDatos;

/* Solo existen con backend real; en modo mock son no-ops. */
export const getPerfil = usaDatosMock ?
async (): Promise<http.Perfil> => ({ nombre: 'Andrea', empresa: 'Distribuidora del Valle', esAnonimo: true, iaActiva: false, modelo: null }) :
http.getPerfil;
export const suscribirMensajes = usaDatosMock ? (() => () => {}) as typeof http.suscribirMensajes : http.suscribirMensajes;
export const actualizarTelefonoPrueba = usaDatosMock ? async (_: string | null) => {} : http.actualizarTelefonoPrueba;
export { usaDatosMock };

/* Políticas de negociación: en modo mock viven en memoria. */
let politicasMock: Politicas = conDefaults({});
export const getPoliticas = usaDatosMock ? async () => structuredClone(politicasMock) : http.getPoliticas;
export const guardarPoliticas = usaDatosMock ?
async (p: Politicas) => {
  politicasMock = structuredClone(p);
  return p;
} :
http.guardarPoliticas;
