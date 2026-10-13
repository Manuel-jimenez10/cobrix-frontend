import React from 'react';
import { ClockIcon, FileTextIcon } from 'lucide-react';
import type { Mensaje } from '../../types/cobranza';
import { estadoVentana } from '../../utils/cobranza';
import { cn } from '../../utils/cn';

/** Ventana de 24 h de WhatsApp: fuera de ella solo se permiten plantillas aprobadas. */
export function VentanaIndicator({ mensajes }: {mensajes: Mensaje[];}) {
  const v = estadoVentana(mensajes);
  return (
    <span
      className={cn('inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium', v.abierta ? 'bg-ok/10 text-ok' : 'bg-warn/10 text-warn')}
      title={v.abierta ? 'El cliente escribió en las últimas 24 h: se pueden enviar mensajes libres.' : 'Pasaron más de 24 h desde el último mensaje del cliente: WhatsApp solo permite plantillas aprobadas.'}>
      
      {v.abierta ? <ClockIcon size={13} aria-hidden="true" /> : <FileTextIcon size={13} aria-hidden="true" />}
      {v.abierta ?
      <>
          Ventana abierta · <span className="tabular-nums">{v.horasRestantes} h</span> restantes
        </> :

      'Requiere plantilla'
      }
    </span>);

}