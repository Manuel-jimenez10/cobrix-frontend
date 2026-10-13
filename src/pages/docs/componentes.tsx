import React, { type ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, CopyIcon, LockIcon, RadioIcon, ZapIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import type { Endpoint, Metodo } from './datos';

/** Aparece suavemente al entrar en pantalla. */
export function Aparece({ children, retraso = 0, className }: {children: ReactNode;retraso?: number;className?: string;}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: retraso, ease: EASE_OUT }}
      className={cn('min-w-0', className)}>

      {children}
    </motion.div>);

}

export function Seccion({ id, eyebrow, titulo, children, descripcion }: {id: string;eyebrow?: string;titulo: string;descripcion?: ReactNode;children: ReactNode;}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-line py-14 last:border-b-0 lg:py-16">
      <Aparece>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>}
        <h2 className="mt-2 text-[26px] font-semibold tracking-tight lg:text-[30px]">{titulo}</h2>
        {descripcion && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{descripcion}</p>}
      </Aparece>
      <div className="mt-8">{children}</div>
    </section>);

}

export function Codigo({ codigo, lenguaje, titulo, className }: {codigo: string;lenguaje?: string;titulo?: string;className?: string;}) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1400);
    } catch {
      /* sin permiso de portapapeles */
    }
  };
  return (
    <div className={cn('min-w-0 overflow-hidden rounded-xl border border-line bg-[rgb(8_9_11)]', className)}>
      <div className="flex h-9 items-center justify-between border-b border-line/70 px-3">
        <span className="font-mono text-[11px] text-muted">{titulo ?? lenguaje ?? ''}</span>
        <button type="button" onClick={() => void copiar()} aria-label="Copiar código" className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={copiado ? 'ok' : 'copiar'} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.12 }}>
              {copiado ? <CheckIcon size={14} className="text-brand" /> : <CopyIcon size={13} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[rgb(214_220_228)]">
        <code>{codigo}</code>
      </pre>
    </div>);

}

const COLOR_METODO: Record<Metodo, string> = {
  GET: 'bg-promise/15 text-promise',
  POST: 'bg-brand/15 text-brand',
  PATCH: 'bg-warn/15 text-warn',
  PUT: 'bg-analista/15 text-analista'
};

export function MetodoBadge({ metodo }: {metodo: Metodo;}) {
  return <span className={cn('inline-flex h-6 w-[52px] shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold', COLOR_METODO[metodo])}>{metodo}</span>;
}

export function TarjetaEndpoint({ e, abiertoInicial = false }: {e: Endpoint;abiertoInicial?: boolean;}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-surface transition-colors', abierto ? 'border-muted/30' : 'border-line hover:border-muted/30')}>
      <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <MetodoBadge metodo={e.metodo} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[13.5px] text-fg">{e.ruta}</span>
          <span className="block truncate text-xs text-muted">{e.resumen}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
          {e.stream &&
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
              <RadioIcon size={11} aria-hidden="true" /> NDJSON
            </span>
          }
          {e.acceso === 'publica' ?
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-muted">Público</span> :

          <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
              {e.acceso === 'ia' ? <ZapIcon size={11} aria-hidden="true" /> : <LockIcon size={11} aria-hidden="true" />}
              {e.acceso === 'ia' ? 'JWT · límite IA' : 'JWT'}
            </span>
          }
        </span>
        <ChevronDownIcon size={16} className={cn('shrink-0 text-muted transition-transform duration-200', abierto && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {abierto &&
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: EASE_OUT }} className="overflow-hidden">
            <div className="space-y-4 border-t border-line px-4 py-4">
              {e.detalle && <p className="text-sm leading-relaxed text-muted">{e.detalle}</p>}
              {e.parametros &&
            <div className="overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="bg-surface-2/60 text-xs text-muted">
                      <tr>
                        <th className="px-3 py-2 font-medium">Parámetro</th>
                        <th className="px-3 py-2 font-medium">Tipo</th>
                        <th className="px-3 py-2 font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {e.parametros.map((p) =>
                  <tr key={p.nombre}>
                          <td className="px-3 py-2 font-mono text-[12.5px] text-fg">{p.nombre}</td>
                          <td className="px-3 py-2 font-mono text-[12px] text-muted">{p.tipo}</td>
                          <td className="px-3 py-2 text-muted">{p.descripcion}</td>
                        </tr>
                  )}
                    </tbody>
                  </table>
                </div>
            }
              <div className={cn('grid grid-cols-1 gap-3', e.cuerpo && e.respuesta && 'xl:grid-cols-2')}>
                {e.cuerpo && <Codigo codigo={e.cuerpo} titulo="Cuerpo (JSON)" />}
                {e.respuesta && <Codigo codigo={e.respuesta} titulo={e.stream ? 'Respuesta · una línea JSON por evento' : 'Respuesta'} />}
              </div>
              {e.errores &&
            <ul className="flex flex-wrap gap-2">
                  {e.errores.map((er) =>
              <li key={er.codigo + er.cuando} className="inline-flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted">
                      <span className="font-mono font-semibold text-bad">{er.codigo}</span>
                      {er.cuando}
                    </li>
              )}
                </ul>
            }
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
