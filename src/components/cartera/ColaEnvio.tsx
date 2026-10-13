import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleIcon, RefreshCwIcon, SkipForwardIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCobranza } from '../../contexts/CobranzaContext';
import * as api from '../../services/api';
import type { Borrador } from '../../types/cobranza';
import { abrirWhatsApp } from '../../utils/cobranza';
import { primerNombre } from '../../utils/format';
import { EASE_OUT } from '../../utils/motion';
import { Button } from '../ui/Button';
import { Money } from '../ui/Money';
import { OrigenBadge } from '../ui/OrigenBadge';
import { ToneBadge } from '../ui/ToneBadge';

interface ColaEnvioProps {
  borradores: Borrador[];
  onTerminar: (resultado: {enviados: number;saltados: number;}) => void;
}

/**
 * Cola de envío: un cliente a la vez. La persona revisa (y si quiere edita) el mensaje,
 * presiona "Enviar por WhatsApp" y se abre su WhatsApp con el chat y el texto listos.
 * Cobrix lo registra en la conversación y pasa al siguiente.
 */
export function ColaEnvio({ borradores, onTerminar }: ColaEnvioProps) {
  const { registrarEnvio, canal, cambiarCanal, iaActiva } = useCobranza();
  const [cola, setCola] = useState(borradores);
  const [i, setI] = useState(0);
  const [texto, setTexto] = useState(borradores[0]?.texto ?? '');
  const [enviados, setEnviados] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [reescribiendo, setReescribiendo] = useState(false);
  const actual = cola[i];
  const simulador = canal === 'simulador';

  const avanzar = (fueEnviado: boolean) => {
    const nuevosEnviados = enviados + (fueEnviado ? 1 : 0);
    setEnviados(nuevosEnviados);
    if (i + 1 >= cola.length) {
      onTerminar({ enviados: nuevosEnviados, saltados: cola.length - nuevosEnviados });
      return;
    }
    setI(i + 1);
    setTexto(cola[i + 1].texto);
  };

  const enviar = async () => {
    if (!actual || !texto.trim() || ocupado) return;
    // Se abre WhatsApp en el mismo clic (antes de cualquier await) para que el navegador no lo bloquee.
    if (!simulador) abrirWhatsApp(actual.telefono, texto.trim());
    setOcupado(true);
    try {
      await registrarEnvio(actual.clienteId, { texto: texto.trim(), tono: actual.tono, origen: texto.trim() === actual.texto ? actual.origen : 'manual' });
      avanzar(true);
    } catch (e) {
      toast.error('No se pudo registrar el envío', { description: e instanceof Error ? e.message : 'Intenta de nuevo.' });
    } finally {
      setOcupado(false);
    }
  };

  const reescribir = async () => {
    if (!actual || reescribiendo) return;
    setReescribiendo(true);
    try {
      const r = await api.redactarRecordatorio(actual.clienteId, actual.tono);
      setCola((c) => c.map((b, j) => j === i ? { ...b, texto: r.texto, origen: r.origen } : b));
      setTexto(r.texto);
      if (r.origen !== 'ia') toast('La IA no está disponible ahora', { description: 'Te dejamos el texto de la plantilla.' });
    } catch {
      toast.error('No se pudo reescribir el mensaje');
    } finally {
      setReescribiendo(false);
    }
  };

  if (!actual) return null;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>
            Mensaje <span className="tabular-nums text-fg">{i + 1}</span> de <span className="tabular-nums">{cola.length}</span>
          </span>
          <span className="tabular-nums">{enviados} enviados</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full rounded-full bg-brand" initial={false} animate={{ width: `${i / cola.length * 100}%` }} transition={{ duration: 0.25, ease: EASE_OUT }} />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={actual.clienteId}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
          className="space-y-3">

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{actual.empresa}</p>
              <p className="truncate text-xs text-muted">
                {primerNombre(actual.nombre)} · <span className="tabular-nums">{actual.telefono}</span>
              </p>
            </div>
            <Money valor={actual.deuda} className="shrink-0 text-sm font-semibold" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <ToneBadge tono={actual.tono} />
            {texto.trim() === actual.texto ?
            <OrigenBadge origen={actual.origen} /> :
            <span className="inline-flex h-5 items-center rounded bg-surface-2 px-1.5 text-[11px] font-medium text-muted">Editado por ti</span>
            }
          </div>
          <label htmlFor="mensaje-cola" className="sr-only">
            Mensaje para {actual.empresa}
          </label>
          <textarea
            id="mensaje-cola"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-xl border border-line bg-bg px-3.5 py-3 text-[15px] leading-relaxed focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25" />

          <p className="text-xs text-muted">
            {simulador ?
            <>
                Modo simulador: el mensaje solo se registra en Cobrix, no se abre WhatsApp.{' '}
                <button type="button" onClick={() => void cambiarCanal('whatsapp')} className="font-medium text-brand underline underline-offset-2">
                  Enviar por WhatsApp
                </button>
              </> :
            'Se abre tu WhatsApp con este chat y el mensaje escrito; solo presiona enviar ahí y regresa a Cobrix.'}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button variante="fantasma" icono={SkipForwardIcon} onClick={() => avanzar(false)} disabled={ocupado} className="flex-1 sm:flex-none">
            Saltar
          </Button>
          {iaActiva &&
          <Button variante="fantasma" icono={RefreshCwIcon} onClick={() => void reescribir()} disabled={reescribiendo || ocupado} className="flex-1 sm:flex-none">
              {reescribiendo ? 'Reescribiendo…' : 'Reescribir con IA'}
            </Button>
          }
        </div>
        <Button variante="primario" icono={MessageCircleIcon} onClick={() => void enviar()} disabled={ocupado || !texto.trim()} data-tour="enviar-whatsapp">
          {simulador ? 'Registrar envío' : 'Enviar por WhatsApp'}
        </Button>
      </div>
    </div>);

}
