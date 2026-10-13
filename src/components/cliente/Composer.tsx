import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardPasteIcon, MessageCircleIcon, SparklesIcon } from 'lucide-react';
import { sugerenciasCliente, sugerenciasEquipo } from '../../data/sugerencias';
import type { Autor } from '../../hooks/useConversacion';
import type { Canal, OrigenTexto, Sugerencia } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { Skeleton } from '../ui/Skeleton';

type Origen = OrigenTexto | 'manual';

interface ComposerProps {
  autor: Autor;
  onCambiarAutor: (a: Autor) => void;
  onEnviar: (texto: string, origen: Origen) => Promise<boolean>;
  ocupado: boolean;
  canal: Canal;
  nombreCliente: string;
  /** Respuestas sugeridas por el asistente al último mensaje del cliente. */
  sugerencias: {lista: Sugerencia[];origen: OrigenTexto;} | null;
  cargandoSugerencias: boolean;
}

/**
 * Caja de la conversación:
 *  · "Tú respondes": escribes (o eliges una sugerencia de la IA), se abre tu WhatsApp con el texto y se registra.
 *  · "Respuesta del cliente": pegas lo que el cliente te contestó por WhatsApp.
 */
export function Composer({ autor, onCambiarAutor, onEnviar, ocupado, canal, nombreCliente, sugerencias, cargandoSugerencias }: ComposerProps) {
  const [texto, setTexto] = useState('');
  const [origen, setOrigen] = useState<Origen>('manual');
  const id = useId();
  const equipo = autor === 'equipo';

  useEffect(() => {
    setTexto('');
    setOrigen('manual');
  }, [autor]);

  const enviar = async (valor: string, o: Origen = origen) => {
    if (!valor.trim() || ocupado) return;
    if (await onEnviar(valor, o)) {
      setTexto('');
      setOrigen('manual');
    }
  };

  /** Las sugerencias del equipo llenan la caja para revisarlas; las del cliente se guardan directo (prueba rápida). */
  const usar = (s: Sugerencia | string) => {
    if (equipo) {
      setTexto(typeof s === 'string' ? s : s.texto);
      setOrigen(typeof s === 'string' ? 'plantilla' : sugerencias?.origen ?? 'plantilla');
    } else {
      void enviar(typeof s === 'string' ? s : s.texto, 'manual');
    }
  };

  const chips: (Sugerencia | string)[] = equipo ? sugerencias?.lista.length ? sugerencias.lista : sugerenciasEquipo : sugerenciasCliente;
  const conIA = equipo && sugerencias?.origen === 'ia';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void enviar(texto);
      }}
      data-tour="responder"
      className="border-t border-line bg-surface/70 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-2.5 lg:px-5 lg:pb-4">

      <div className="mb-2.5 flex items-center gap-2">
        <div role="radiogroup" aria-label="Qué vas a escribir" className="relative grid shrink-0 grid-cols-2 rounded-lg border border-line bg-bg p-0.5 text-xs font-medium">
          {(
          [
          { valor: 'equipo', etiqueta: 'Tú respondes' },
          { valor: 'cliente', etiqueta: 'Respuesta del cliente' }] as
          const).
          map((o) =>
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={autor === o.valor}
            onClick={() => onCambiarAutor(o.valor)}
            data-tour={o.valor === 'cliente' ? 'pegar-respuesta' : undefined}
            className={cn('relative h-8 rounded-md px-3 transition-colors duration-150', autor === o.valor ? 'text-fg' : 'text-muted hover:text-fg')}>

              {autor === o.valor &&
            <motion.span layoutId={`autor-${id}`} className={cn('absolute inset-0 rounded-md', o.valor === 'cliente' ? 'bg-promise/15' : 'bg-surface-2')} transition={{ duration: 0.2, ease: EASE_OUT }} />
            }
              <span className="relative">{o.etiqueta}</span>
            </button>
          )}
        </div>
        <p className="min-w-0 truncate text-[11px] text-muted">
          {!equipo ? 'Pega lo que te contestó por WhatsApp' : canal === 'whatsapp' ? 'Se abre tu WhatsApp con el mensaje listo' : 'Simulador: solo se registra en Cobrix'}
        </p>
      </div>

      {equipo && (cargandoSugerencias || conIA) &&
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-promise">
          <SparklesIcon size={12} aria-hidden="true" />
          {cargandoSugerencias ? 'La IA está pensando qué responder…' : 'Sugerencias de la IA · elige una, revísala y envía'}
        </p>
      }
      <div className="no-scrollbar -mx-3 mb-2.5 flex gap-2 overflow-x-auto px-3 lg:mx-0 lg:px-0" data-tour="sugerencias">
        {equipo && cargandoSugerencias ?
        [0, 1, 2].map((k) => <Skeleton key={k} className="h-9 w-36 shrink-0 rounded-full lg:h-8" />) :
        chips.map((s) => {
          const etiqueta = typeof s === 'string' ? s : s.etiqueta;
          return (
            <button
              key={etiqueta}
              type="button"
              disabled={ocupado}
              title={typeof s === 'string' ? undefined : s.texto}
              onClick={() => usar(s)}
              className={cn(
                'h-9 shrink-0 whitespace-nowrap rounded-full border px-3 text-xs transition-colors duration-150 disabled:opacity-40 lg:h-8',
                conIA ? 'border-promise/30 text-fg hover:border-promise/60' : 'border-line text-muted hover:border-muted/50 hover:text-fg'
              )}>

                {etiqueta}
              </button>);

        })}
      </div>
      <div className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">
          {equipo ? 'Responder al cliente' : 'Respuesta del cliente'}
        </label>
        <textarea
          id={id}
          rows={texto.length > 90 ? 3 : 1}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setOrigen('manual');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void enviar(texto);
            }
          }}
          placeholder={equipo ? `Responder a ${nombreCliente}…` : `Pega aquí lo que respondió ${nombreCliente}…`}
          className={cn(
            'max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border bg-bg px-3.5 py-2.5 text-[15px] leading-snug placeholder:text-muted focus:outline-none focus:ring-2',
            equipo ? 'border-line focus:border-brand/60 focus:ring-brand/25' : 'border-promise/40 focus:border-promise/60 focus:ring-promise/20'
          )} />

        <motion.button
          type="submit"
          aria-label={equipo ? canal === 'whatsapp' ? 'Enviar por WhatsApp' : 'Registrar respuesta' : 'Guardar respuesta del cliente'}
          disabled={ocupado || !texto.trim()}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-opacity duration-150 disabled:opacity-40', equipo ? 'bg-brand text-on-brand' : 'bg-promise text-white')}>

          {equipo ? <MessageCircleIcon size={18} /> : <ClipboardPasteIcon size={18} />}
        </motion.button>
      </div>
    </form>);

}
