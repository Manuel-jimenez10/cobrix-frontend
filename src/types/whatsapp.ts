import type { Tono } from './cobranza';

export type EstadoPlantilla = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | 'DISABLED' | 'NO_CREADA';

/** Estado del WhatsApp propio de la empresa (GET /whatsapp/estado). */
export interface EstadoWhatsApp {
  /** El servidor tiene configurada la cuenta de WhatsApp Business de Cobrix. */
  disponible: boolean;
  estado: 'desconectado' | 'verificando' | 'conectado';
  numero: string | null;
  nombre: string | null;
  calidad: string | null;
  estadoNombre: string | null;
  plantillas: {tono: Tono;nombre: string;estado: EstadoPlantilla;motivo?: string;}[];
  webhookUrl: string;
}

export type MetodoCodigo = 'SMS' | 'VOICE';
