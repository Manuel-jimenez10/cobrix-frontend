import { type ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../../services/api';
import type { Tono } from '../../types/cobranza';
import { POLITICAS_DEFAULT, type Politicas } from '../../types/politicas';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

/* ───────────── Controles ───────────── */

function Segmentado<T extends string | number>({
  opciones,
  valor,
  onChange,
  etiqueta,
  formato = (v) => String(v)
}: {opciones: T[];valor: T;onChange: (v: T) => void;etiqueta: string;formato?: (v: T) => string;}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={etiqueta} className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-line p-1">
      {opciones.map((o) => {
        const activo = o === valor;
        return (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(o)}
            className={cn('relative h-9 min-w-[44px] rounded-md px-3 text-sm font-medium tabular-nums transition-colors duration-150 lg:h-8', activo ? 'text-fg' : 'text-muted hover:text-fg')}>

            {activo && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-md bg-surface-2" transition={{ duration: 0.18, ease: EASE_OUT }} />}
            <span className="relative">{formato(o)}</span>
          </button>);

      })}
    </div>);

}

function Interruptor({ activo, onChange, etiqueta }: {activo: boolean;onChange: (v: boolean) => void;etiqueta: string;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onChange(!activo)}
      className={cn('relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40', activo ? 'bg-brand' : 'bg-line')}>

      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        className={cn('h-5 w-5 rounded-full bg-white shadow-sm', activo ? 'ml-[18px]' : 'ml-0.5')} />

    </button>);

}

function Fila({ titulo, descripcion, children, apilado = false, enLinea = false }: {titulo: string;descripcion?: string;children: ReactNode;apilado?: boolean;enLinea?: boolean;}) {
  return (
    <div
      className={cn(
        'flex gap-3 border-b border-line px-4 py-4 last:border-b-0',
        apilado ? 'flex-col' : enLinea ? 'flex-row items-center justify-between' : 'flex-col sm:flex-row sm:items-center sm:justify-between'
      )}>
      <div className="min-w-0">
        <p className="text-sm font-medium">{titulo}</p>
        {descripcion && <p className="mt-0.5 text-xs leading-relaxed text-muted">{descripcion}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>);

}

function Grupo({ titulo, children }: {titulo: string;children: ReactNode;}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{titulo}</p>
      <div className="rounded-xl border border-line">{children}</div>
    </div>);

}

const claseInput =
'h-11 rounded-lg border border-line bg-surface-2 px-3 text-[15px] tabular-nums outline-none transition-colors focus:border-brand/70 focus:ring-2 focus:ring-brand/20 lg:h-9 lg:text-sm';

const DIAS = [
{ v: 1, t: 'L' },
{ v: 2, t: 'M' },
{ v: 3, t: 'M' },
{ v: 4, t: 'J' },
{ v: 5, t: 'V' },
{ v: 6, t: 'S' },
{ v: 0, t: 'D' }];

const NOMBRE_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const TONOS: Tono[] = ['amable', 'firme', 'final'];
const ETIQUETA_TONO: Record<Tono, string> = { amable: 'Amable', firme: 'Firme', final: 'Aviso final' };

/* ───────────── Formulario ───────────── */

export function PoliticasForm() {
  const [guardadas, setGuardadas] = useState<Politicas | null>(null);
  const [p, setP] = useState<Politicas | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);

  useEffect(() => {
    api.
    getPoliticas().
    then((x) => {
      setGuardadas(x);
      setP(x);
    }).
    catch(() => setErrorCarga(true));
  }, []);

  const cambiado = useMemo(() => Boolean(p && guardadas && JSON.stringify(p) !== JSON.stringify(guardadas)), [p, guardadas]);
  const horarioInvalido = Boolean(p?.horario.activo && (p.horario.desde >= p.horario.hasta || p.horario.dias.length === 0));

  if (errorCarga) return <p className="text-sm text-bad">No pudimos cargar las reglas. Recarga la página para intentarlo de nuevo.</p>;
  if (!p) return <Skeleton className="h-72 w-full rounded-xl" />;

  const set = (cambios: Partial<Politicas>) => setP((x) => x ? { ...x, ...cambios } : x);
  const setHorario = (cambios: Partial<Politicas['horario']>) => setP((x) => x ? { ...x, horario: { ...x.horario, ...cambios } } : x);

  const guardar = async () => {
    setGuardando(true);
    try {
      const r = await api.guardarPoliticas(p);
      setGuardadas(r);
      setP(r);
      toast.success('Reglas guardadas', { description: 'Se aplican desde el siguiente envío.' });
    } catch (e) {
      toast.error('No se pudieron guardar', { description: (e as Error).message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Grupo titulo="Recordatorios">
        <Fila titulo="Tono más fuerte permitido" descripcion="Cada recordatorio sube de tono (amable → firme → final), pero nunca pasa de este nivel.">
          <Segmentado etiqueta="Tono máximo" opciones={TONOS} valor={p.tonoMaximo} onChange={(v) => set({ tonoMaximo: v })} formato={(v) => ETIQUETA_TONO[v]} />
        </Fila>
      </Grupo>

      <Grupo titulo="Horario de envío">
        <Fila enLinea titulo="Limitar horario de envíos" descripcion="Fuera de este horario no se envían recordatorios. Tú puedes contestar a tus clientes cuando quieras.">
          <Interruptor etiqueta="Limitar horario" activo={p.horario.activo} onChange={(v) => setHorario({ activo: v })} />
        </Fila>
        <AnimatePresence initial={false}>
          {p.horario.activo &&
          <motion.div key="horario" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="overflow-hidden">
              <Fila titulo="Días y horas" apilado>
                <div className="flex flex-wrap items-center gap-4">
                  <div role="group" aria-label="Días permitidos" className="flex gap-1.5">
                    {DIAS.map((d) => {
                    const activo = p.horario.dias.includes(d.v);
                    return (
                      <button
                        key={d.v}
                        type="button"
                        aria-pressed={activo}
                        aria-label={NOMBRE_DIA[d.v]}
                        onClick={() => setHorario({ dias: activo ? p.horario.dias.filter((x) => x !== d.v) : [...p.horario.dias, d.v] })}
                        className={cn('grid h-10 w-10 place-items-center rounded-full text-sm font-medium transition-colors lg:h-9 lg:w-9', activo ? 'bg-brand text-on-brand' : 'border border-line text-muted hover:text-fg')}>

                          {d.t}
                        </button>);

                  })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <input type="time" aria-label="Desde" value={p.horario.desde} onChange={(e) => setHorario({ desde: e.target.value })} className={claseInput} />
                    a
                    <input type="time" aria-label="Hasta" value={p.horario.hasta} onChange={(e) => setHorario({ hasta: e.target.value })} className={claseInput} />
                  </div>
                </div>
                {horarioInvalido && <p className="text-xs text-bad">Elige al menos un día y una hora de inicio anterior a la de fin.</p>}
              </Fila>
            </motion.div>
          }
        </AnimatePresence>
      </Grupo>

      <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-10 -mx-1 flex items-center justify-end gap-2 rounded-xl border border-line bg-bg/90 p-2 backdrop-blur lg:bottom-4">
        <AnimatePresence>
          {cambiado &&
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mr-auto hidden pl-2 text-xs text-muted sm:inline">
              Tienes cambios sin guardar
            </motion.span>
          }
        </AnimatePresence>
        <Button variante="fantasma" icono={RotateCcwIcon} onClick={() => setP(structuredClone(POLITICAS_DEFAULT))} disabled={guardando} aria-label="Restablecer valores recomendados">
          <span className="hidden sm:inline">Valores recomendados</span>
        </Button>
        <Button variante="primario" className="flex-1 sm:flex-none" onClick={() => void guardar()} disabled={!cambiado || guardando || horarioInvalido}>
          {guardando ? 'Guardando…' : 'Guardar reglas'}
        </Button>
      </div>
    </div>);

}
