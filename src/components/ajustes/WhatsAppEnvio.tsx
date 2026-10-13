import { CheckIcon, Clock3Icon, MessageCircleIcon, SparklesIcon, UserCheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { WhatsAppConexion } from './WhatsAppConexion';

/**
 * La conexión oficial (WhatsApp Cloud API) ya está programada, pero Meta tiene que aprobar la app.
 * Cuando la aprueben, cambia esto a true y Ajustes mostrará "Conectar mi WhatsApp".
 */
export const CONEXION_META_DISPONIBLE = false;
export const FECHA_REVISION_META = '12 de octubre de 2026';

const PASOS_HOY = [
{ icono: SparklesIcon, texto: 'Cobrix ordena a quién cobrar y la IA redacta cada mensaje.' },
{ icono: UserCheckIcon, texto: 'Tú lo revisas y, si quieres, lo editas.' },
{ icono: MessageCircleIcon, texto: 'Presionas "Enviar por WhatsApp": se abre tu WhatsApp con el chat y el texto listos.' }];


const LINEA = [
{ titulo: 'App creada en Meta for Developers', estado: 'hecho' },
{ titulo: 'Integración lista: registro del número por SMS, plantillas y webhook', estado: 'hecho' },
{ titulo: `Revisión de Meta · enviada el ${FECHA_REVISION_META}`, estado: 'actual' },
{ titulo: 'Conectar el número de tu empresa desde Ajustes', estado: 'pendiente' }] as
const;

/** Cómo salen los mensajes hoy (desde el WhatsApp de la persona) y la conexión oficial que viene. */
export function WhatsAppEnvio() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand/30 bg-brand/[0.05] p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/15 text-brand" aria-hidden="true">
            <MessageCircleIcon size={14} />
          </span>
          <p className="text-sm font-medium">Hoy: envías desde tu propio WhatsApp</p>
          <span className="ml-auto rounded-md bg-ok/10 px-1.5 py-0.5 text-[11px] font-medium text-ok">Activo</span>
        </div>
        <ol className="mt-3 space-y-2">
          {PASOS_HOY.map((p, i) =>
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
              <p.icono size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <span>{p.texto}</span>
            </li>
          )}
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Sin configuración ni costo: funciona en el teléfono (app de WhatsApp o WhatsApp Business) y en la computadora (WhatsApp Web o de escritorio). Tus clientes reciben el mensaje del número que ya conocen.
        </p>
      </div>

      {CONEXION_META_DISPONIBLE ?
      <WhatsAppConexion /> :

      <div className="rounded-xl border border-line p-4" data-tour="meta-proximamente">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">Envío automático con la API oficial de WhatsApp</p>
            <span className="rounded-md bg-promise/10 px-1.5 py-0.5 text-[11px] font-medium text-promise">Próximamente</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Cuando Meta apruebe la app, conectarás el número de tu empresa con un código por SMS y Cobrix enviará los recordatorios solo, con plantillas aprobadas, y recibirá las respuestas en tiempo real.
          </p>
          <ol className="mt-4 space-y-3" aria-label="Avance de la conexión con Meta">
            {LINEA.map((l, i) =>
          <li key={i} className="flex items-center gap-3 text-sm">
                <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full ring-1',
                l.estado === 'hecho' ? 'bg-ok/10 text-ok ring-ok/30' : l.estado === 'actual' ? 'bg-promise/10 text-promise ring-promise/40' : 'bg-surface-2 text-muted ring-line'
              )}
              aria-hidden="true">

                  {l.estado === 'hecho' ? <CheckIcon size={13} /> : l.estado === 'actual' ? <Clock3Icon size={13} className="motion-safe:animate-pulse" /> : <span className="text-[11px] tabular-nums">{i + 1}</span>}
                </span>
                <span className={cn(l.estado === 'pendiente' ? 'text-muted' : 'text-fg', l.estado === 'actual' && 'font-medium')}>{l.titulo}</span>
              </li>
          )}
          </ol>
        </div>
      }
    </div>);

}
