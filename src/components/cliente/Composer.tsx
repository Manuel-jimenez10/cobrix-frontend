import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { SendHorizontalIcon } from 'lucide-react';
import { sugerenciasCliente, sugerenciasEquipo } from '../../data/sugerencias';
import type { Autor } from '../../hooks/useConversacion';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';

interface ComposerProps {
  autor: Autor;
  onCambiarAutor: (a: Autor) => void;
  onEnviar: (texto: string) => Promise<boolean>;
  ocupado: boolean;
  /** Ventana de 24 h de WhatsApp abierta (dentro de ella se permite texto libre). */
  ventanaAbierta: boolean;
  nombreCliente: string;
}

/** Caja para escribir como equipo (respuesta real) o como cliente (simulador para probar). */
export function Composer({ autor, onCambiarAutor, onEnviar, ocupado, ventanaAbierta, nombreCliente }: ComposerProps) {
  const [texto, setTexto] = useState('');
  const id = useId();
  const sugerencias = autor === 'cliente' ? sugerenciasCliente : sugerenciasEquipo;

  const enviar = async (valor: string) => {
    if (!valor.trim() || ocupado) return;
    if (await onEnviar(valor)) setTexto('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void enviar(texto);
      }}
      data-tour="responder"
      className="border-t border-line bg-surface/70 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-2.5 lg:px-5 lg:pb-4">

      <div className="mb-2.5 flex items-center gap-2">
        <div role="radiogroup" aria-label="Escribir como" className="relative grid shrink-0 grid-cols-2 rounded-lg border border-line bg-bg p-0.5 text-xs font-medium">
          {(
          [
          { valor: 'equipo', etiqueta: 'Tú (equipo)' },
          { valor: 'cliente', etiqueta: 'Simular cliente' }] as
          const).
          map((o) =>
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={autor === o.valor}
            onClick={() => onCambiarAutor(o.valor)}
            className={cn('relative h-8 rounded-md px-3 transition-colors duration-150', autor === o.valor ? 'text-fg' : 'text-muted hover:text-fg')}>

              {autor === o.valor &&
            <motion.span layoutId={`autor-${id}`} className={cn('absolute inset-0 rounded-md', o.valor === 'cliente' ? 'bg-promise/15' : 'bg-surface-2')} transition={{ duration: 0.2, ease: EASE_OUT }} />
            }
              <span className="relative">{o.etiqueta}</span>
            </button>
          )}
        </div>
        <p className="min-w-0 truncate text-[11px] text-muted">
          {autor === 'cliente' ? `Escribes como ${nombreCliente} (prueba)` : ventanaAbierta ? 'Ventana abierta: puedes escribir libre' : 'Por WhatsApp solo sale con la ventana abierta'}
        </p>
      </div>

      <div className="no-scrollbar -mx-3 mb-2.5 flex gap-2 overflow-x-auto px-3 lg:mx-0 lg:px-0">
        {sugerencias.map((s) =>
        <button
          key={s}
          type="button"
          disabled={ocupado}
          onClick={() => void enviar(s)}
          className="h-9 shrink-0 whitespace-nowrap rounded-full border border-line px-3 text-xs text-muted transition-colors duration-150 hover:border-muted/50 hover:text-fg disabled:opacity-40 lg:h-8">

            {s}
          </button>
        )}
      </div>
      <div className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">
          {autor === 'cliente' ? 'Escribir como cliente' : 'Responder al cliente'}
        </label>
        <textarea
          id={id}
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void enviar(texto);
            }
          }}
          placeholder={autor === 'cliente' ? 'Escribe como si fueras el cliente…' : `Responder a ${nombreCliente}…`}
          className={cn(
            'max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border bg-bg px-3.5 py-2.5 text-[15px] leading-snug placeholder:text-muted focus:outline-none focus:ring-2',
            autor === 'cliente' ? 'border-promise/40 focus:border-promise/60 focus:ring-promise/20' : 'border-line focus:border-brand/60 focus:ring-brand/25'
          )} />

        <motion.button
          type="submit"
          aria-label={autor === 'cliente' ? 'Enviar como cliente' : 'Enviar respuesta'}
          disabled={ocupado || !texto.trim()}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-opacity duration-150 disabled:opacity-40', autor === 'cliente' ? 'bg-promise text-white' : 'bg-brand text-on-brand')}>

          <SendHorizontalIcon size={18} />
        </motion.button>
      </div>
    </form>);

}
