import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpIcon } from 'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { AGENTES, sugerenciasDirector } from '../../data/agentes';
import { cn } from '../../utils/cn';
import { AgentAvatar } from '../ui/AgentAvatar';
import { DirectorBienvenida } from './DirectorBienvenida';
import { DirectorMessage } from './DirectorMessage';

export function DirectorChat({ compacto = false }: {compacto?: boolean;}) {
  const { activa, enviar, generando, delegando, resolverConfirmacion } = useDirector();
  const [texto, setTexto] = useState('');
  const listaRef = useRef<HTMLDivElement>(null);
  const reducir = useReducedMotion();
  const inputId = useId();
  const vacia = activa.mensajes.length === 0;

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducir ? 'auto' : 'smooth' });
  }, [activa.mensajes, delegando, reducir]);

  const mandar = (valor: string) => {
    if (!valor.trim() || generando) return;
    void enviar(valor);
    setTexto('');
  };

  const ultimo = activa.mensajes[activa.mensajes.length - 1];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listaRef} className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <div className={cn('mx-auto w-full space-y-6 px-4 py-6', !compacto && 'max-w-3xl lg:px-8')}>
          {vacia ?
          <DirectorBienvenida onSugerencia={mandar} compacto={compacto} /> :

          activa.mensajes.map((m) =>
          <DirectorMessage
            key={m.id}
            mensaje={m}
            enCurso={generando && m.id === ultimo?.id}
            esperando={generando && m.id === ultimo?.id && !delegando}
            bloqueado={generando}
            onResolver={(bloqueId, confirmar) => void resolverConfirmacion(m.id, bloqueId, confirmar)} />

          )
          }
          <AnimatePresence>
            {delegando &&
            <motion.div
              key={delegando.texto}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2.5 pl-11"
              role="status">
              
                <AgentAvatar agente={delegando.agente} tamano="sm" activo />
                <span className={cn('text-sm font-medium', AGENTES[delegando.agente].texto)}>{delegando.texto}</span>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-line bg-bg/60">
        <div className={cn('mx-auto w-full px-4 pb-3 pt-3', !compacto && 'max-w-3xl lg:px-8 lg:pb-5')}>
          {!vacia &&
          <div className="no-scrollbar -mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">
              {sugerenciasDirector.map((s) =>
            <button
              key={s}
              type="button"
              disabled={generando}
              onClick={() => mandar(s)}
              className="h-9 shrink-0 whitespace-nowrap rounded-full border border-line px-3 text-xs text-muted transition-colors duration-150 hover:border-muted/50 hover:text-fg disabled:opacity-40 lg:h-8">
              
                  {s}
                </button>
            )}
            </div>
          }
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mandar(texto);
            }}
            className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-1.5 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20">
            
            <label htmlFor={inputId} className="sr-only">
              Escribe al Director
            </label>
            <textarea
              id={inputId}
              rows={1}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  mandar(texto);
                }
              }}
              placeholder="Pregunta por tu cartera o pide una acción…"
              className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] leading-snug placeholder:text-muted focus:outline-none" />
            
            <motion.button
              type="submit"
              aria-label="Enviar al Director"
              disabled={generando || !texto.trim()}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-on-brand transition-opacity duration-150 disabled:opacity-35">
              
              <ArrowUpIcon size={18} />
            </motion.button>
          </form>
        </div>
      </div>
    </div>);

}