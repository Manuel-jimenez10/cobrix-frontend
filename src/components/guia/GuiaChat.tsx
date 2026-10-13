import React, { Fragment, useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ArrowUpIcon, GraduationCapIcon } from 'lucide-react';
import { useGuia, type MensajeChatGuia } from '../../contexts/GuiaContext';
import { useAccionGuia } from '../../hooks/useAccionGuia';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { GuiaAvatar } from './GuiaAvatar';

export const SUGERENCIAS_GUIA = [
'¿Por dónde empiezo?',
'Un cliente me respondió, ¿qué hago?',
'¿Cómo registro una promesa de pago?',
'¿Por qué un cliente va primero?',
'¿Cómo conecto WhatsApp?'];


/** Negritas (**texto**) y saltos de línea: lo poco de Markdown que usa la Guía. */
function TextoGuia({ texto }: {texto: string;}) {
  return (
    <>
      {texto.split('\n').map((linea, i) =>
      <Fragment key={i}>
          {i > 0 && <br />}
          {linea.split(/(\*\*[^*]+\*\*)/g).map((parte, j) =>
        /^\*\*[^*]+\*\*$/.test(parte) ? <strong key={j} className="font-semibold text-fg">{parte.slice(2, -2)}</strong> : <Fragment key={j}>{parte.replace(/^\s*[*-]\s+/, '• ')}</Fragment>
        )}
        </Fragment>
      )}
    </>);

}

function Burbuja({ m, escribiendo }: {m: MensajeChatGuia;escribiendo: boolean;}) {
  const ejecutar = useAccionGuia();
  if (m.rol === 'usuario') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-surface-2 px-3.5 py-2.5 text-[14.5px] leading-relaxed">{m.texto}</p>
      </div>);

  }
  return (
    <div className="flex gap-2.5">
      <GuiaAvatar tamano="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className={cn('text-[14.5px] leading-relaxed text-fg/90', m.error && 'text-bad')}>
          {m.texto ? <TextoGuia texto={m.texto} /> : escribiendo && <span className="text-muted">Pensando…</span>}
          {escribiendo && m.texto && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-fg motion-safe:animate-pulse" aria-hidden="true" />}
        </p>
        {m.acciones.length > 0 &&
        <div className="mt-2.5 flex flex-wrap gap-2">
            {m.acciones.map((a, i) =>
          <motion.button
            key={`${a.destino}-${i}`}
            type="button"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05, ease: EASE_OUT }}
            onClick={() => ejecutar(a)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 text-sm font-medium text-brand transition-colors hover:bg-brand/15">

                {a.destino === 'recorrido' && <GraduationCapIcon size={14} aria-hidden="true" />}
                {a.etiqueta}
                {a.destino !== 'recorrido' && <ArrowRightIcon size={14} aria-hidden="true" />}
              </motion.button>
          )}
          </div>
        }
      </div>
    </div>);

}

export function GuiaChat() {
  const { mensajes, enviar, generando } = useGuia();
  const [texto, setTexto] = useState('');
  const listaRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const reducir = useReducedMotion();
  const ultimo = mensajes[mensajes.length - 1];

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducir ? 'auto' : 'smooth' });
  }, [mensajes, reducir]);

  const mandar = (valor: string) => {
    if (!valor.trim() || generando) return;
    void enviar(valor);
    setTexto('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listaRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5" aria-live="polite">
        {mensajes.length === 0 ?
        <div>
            <div className="flex gap-2.5">
              <GuiaAvatar tamano="sm" className="mt-0.5" />
              <p className="text-[14.5px] leading-relaxed text-fg/90">
                Hola, soy la <strong className="font-semibold text-fg">Guía de Cobrix</strong>. Te explico cómo usar la app y te llevo a la pantalla correcta. ¿Qué quieres hacer?
              </p>
            </div>
            <div className="mt-4 flex flex-col items-start gap-2 pl-[34px]">
              {SUGERENCIAS_GUIA.map((s) =>
            <button
              key={s}
              type="button"
              onClick={() => mandar(s)}
              className="rounded-xl border border-line px-3 py-2 text-left text-sm text-muted transition-colors hover:border-muted/50 hover:text-fg">

                  {s}
                </button>
            )}
            </div>
          </div> :

        mensajes.map((m) => <Burbuja key={m.id} m={m} escribiendo={generando && m.id === ultimo?.id} />)
        }
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mandar(texto);
        }}
        className="border-t border-line p-3 pb-[calc(12px+env(safe-area-inset-bottom))] lg:pb-3">

        <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-1.5 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20">
          <label htmlFor={inputId} className="sr-only">
            Pregúntale a la Guía
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
            placeholder="¿Cómo hago…?"
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] leading-snug placeholder:text-muted focus:outline-none" />

          <motion.button
            type="submit"
            aria-label="Enviar pregunta"
            disabled={generando || !texto.trim()}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-on-brand transition-opacity duration-150 disabled:opacity-35">

            <ArrowUpIcon size={18} />
          </motion.button>
        </div>
      </form>
    </div>);

}
