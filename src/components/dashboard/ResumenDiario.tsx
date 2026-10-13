import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRightIcon, SparklesIcon } from 'lucide-react';
import { useCobranza } from '../../contexts/CobranzaContext';
import * as api from '../../services/api';
import type { ResumenDia } from '../../types/cobranza';
import { EASE_OUT } from '../../utils/motion';
import { Skeleton } from '../ui/Skeleton';

/** "Resumen de hoy": el asistente explica en 2–3 frases qué hacer primero y por qué. */
export function ResumenDiario() {
  const { version, clientes } = useCobranza();
  const [resumen, setResumen] = useState<ResumenDia | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    api.
    getResumenDiario().
    then((r) => activo && setResumen(r)).
    catch(() => activo && setResumen(null)).
    finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
    // Se recalcula cuando cambia la cartera (envíos, respuestas, promesas, pagos).
  }, [version]);

  if (!cargando && !resumen) return null;
  if (!clientes.length && !cargando) return null;

  return (
    <section data-tour="resumen-diario" aria-labelledby="resumen-titulo" className="rounded-2xl border border-promise/25 bg-promise/[0.05] px-5 py-4">
      <header className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-promise/15 text-promise" aria-hidden="true">
          <SparklesIcon size={14} />
        </span>
        <h2 id="resumen-titulo" className="text-sm font-medium">
          Resumen de hoy
        </h2>
        {resumen && <span className="text-[11px] text-muted">{resumen.origen === 'ia' ? '· escrito por la IA con tus datos' : '· calculado con tus datos'}</span>}
      </header>
      <AnimatePresence mode="wait" initial={false}>
        {cargando && !resumen ?
        <motion.div key="cargando" exit={{ opacity: 0 }} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </motion.div> :
        resumen ?
        <motion.div key={resumen.texto} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
            <p className="text-[14.5px] leading-relaxed">{resumen.texto}</p>
            {resumen.clientes.length > 0 &&
          <div className="mt-3 flex flex-wrap gap-2">
                {resumen.clientes.map((c) =>
            <Link
              key={c.id}
              to={`/cartera/${c.id}`}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-surface px-3 text-xs font-medium text-fg transition-colors duration-150 hover:border-muted/50 lg:h-8">

                    {c.empresa}
                    <ChevronRightIcon size={13} className="text-muted" aria-hidden="true" />
                  </Link>
            )}
              </div>
          }
          </motion.div> :
        null}
      </AnimatePresence>
    </section>);

}
