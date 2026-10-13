import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { SendHorizontalIcon } from 'lucide-react';
import { sugerenciasCliente } from '../../data/agentes';

interface SimuladorComposerProps {
  onEnviar: (texto: string) => void;
  ocupado: boolean;
}

export function SimuladorComposer({ onEnviar, ocupado }: SimuladorComposerProps) {
  const [texto, setTexto] = useState('');
  const id = useId();

  const enviar = (valor: string) => {
    if (!valor.trim() || ocupado) return;
    onEnviar(valor);
    setTexto('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar(texto);
      }}
      className="border-t border-line bg-surface/70 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:px-5 lg:pb-4">
      
      <div className="no-scrollbar -mx-3 mb-2.5 flex items-center gap-2 overflow-x-auto px-3 lg:mx-0 lg:px-0">
        <span className="shrink-0 rounded-md bg-promise/10 px-2 py-1 text-[11px] font-medium text-promise">Simulador</span>
        {sugerenciasCliente.map((s) =>
        <button
          key={s}
          type="button"
          disabled={ocupado}
          onClick={() => enviar(s)}
          className="h-9 shrink-0 whitespace-nowrap rounded-full border border-line px-3 text-xs text-muted transition-colors duration-150 hover:border-muted/50 hover:text-fg disabled:opacity-40 lg:h-8">
          
            {s}
          </button>
        )}
      </div>
      <div className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">
          Responder como cliente
        </label>
        <textarea
          id={id}
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              enviar(texto);
            }
          }}
          placeholder="Responder como cliente…"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-bg px-3.5 py-2.5 text-[15px] leading-snug placeholder:text-muted focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25" />
        
        <motion.button
          type="submit"
          aria-label="Enviar como cliente"
          disabled={ocupado || !texto.trim()}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-on-brand transition-opacity duration-150 disabled:opacity-40">
          
          <SendHorizontalIcon size={18} />
        </motion.button>
      </div>
    </form>);

}