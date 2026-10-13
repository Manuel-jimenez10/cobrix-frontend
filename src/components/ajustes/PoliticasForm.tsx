import { type ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcwIcon, ShieldCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../../services/api';
import type { Tono } from '../../types/cobranza';
import { ETIQUETAS_MOTIVO, POLITICAS_DEFAULT, type MotivoEscalamiento, type Politicas } from '../../types/politicas';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { avisarTutorial } from '../../utils/tutorial';
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

  if (errorCarga) return <p className="text-sm text-bad">No pudimos cargar las políticas. Recarga la página para intentarlo de nuevo.</p>;
  if (!p) return <Skeleton className="h-72 w-full rounded-xl" />;

  const set = (cambios: Partial<Politicas>) => setP((x) => x ? { ...x, ...cambios } : x);
  const setEscalar = (cambios: Partial<Politicas['escalar']>) => setP((x) => x ? { ...x, escalar: { ...x.escalar, ...cambios } } : x);
  const setHorario = (cambios: Partial<Politicas['horario']>) => setP((x) => x ? { ...x, horario: { ...x.horario, ...cambios } } : x);

  const guardar = async () => {
    setGuardando(true);
    try {
      const r = await api.guardarPoliticas(p);
      setGuardadas(r);
      setP(r);
      avisarTutorial('politicas');
      toast.success('Políticas guardadas', { description: 'El Negociador ya las está aplicando.' });
    } catch (e) {
      toast.error('No se pudieron guardar', { description: (e as Error).message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-brand/30 bg-brand/[0.05] p-4">
        <ShieldCheckIcon size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-medium text-fg">Se aplican en el servidor, no solo en el prompt.</span> Si el agente intenta prometer algo fuera de estas reglas, el
          sistema lo rechaza y lo obliga a reformular.
        </p>
      </div>

      <Grupo titulo="Acuerdos de pago">
        <Fila titulo="Número máximo de pagos" descripcion={p.maxPagos === 1 ? 'Solo se acepta el pago total.' : `El saldo se puede dividir en hasta ${p.maxPagos} pagos, cada 15 días.`}>
          <Segmentado etiqueta="Número máximo de pagos" opciones={[1, 2, 3, 4, 6]} valor={p.maxPagos} onChange={(v) => set({ maxPagos: v })} formato={(v) => v === 1 ? 'Total' : String(v)} />
        </Fila>
        <Fila titulo="Plazo máximo del primer pago" descripcion="Días a partir de hoy que el agente puede aceptar.">
          <Segmentado etiqueta="Plazo máximo" opciones={[7, 15, 30, 45, 60]} valor={p.plazoMaxDias} onChange={(v) => set({ plazoMaxDias: v })} formato={(v) => `${v} d`} />
        </Fila>
        <AnimatePresence initial={false}>
          {p.maxPagos > 1 &&
          <motion.div key="inicial" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="overflow-hidden">
              <Fila titulo="Pago inicial mínimo" descripcion="Porcentaje del saldo que debe cubrir el primer pago parcial.">
                <Segmentado etiqueta="Pago inicial mínimo" opciones={[0, 25, 30, 50]} valor={p.pagoInicialMinPct} onChange={(v) => set({ pagoInicialMinPct: v })} formato={(v) => v === 0 ? 'Sin mínimo' : `${v}%`} />
              </Fila>
            </motion.div>
          }
        </AnimatePresence>
        <Fila titulo="Descuento por liquidar" descripcion="Solo si el cliente paga todo en una exhibición.">
          <Segmentado etiqueta="Descuento máximo" opciones={[0, 5, 10, 15]} valor={p.descuentoMaxPct} onChange={(v) => set({ descuentoMaxPct: v })} formato={(v) => v === 0 ? 'Nunca' : `Hasta ${v}%`} />
        </Fila>
        <Fila titulo="Tono más fuerte permitido" descripcion="El Redactor no pasará de este nivel, aunque sea el tercer intento.">
          <Segmentado etiqueta="Tono máximo" opciones={TONOS} valor={p.tonoMaximo} onChange={(v) => set({ tonoMaximo: v })} formato={(v) => ETIQUETA_TONO[v]} />
        </Fila>
      </Grupo>

      <Grupo titulo="Escalar a una persona cuando…">
        {(Object.keys(ETIQUETAS_MOTIVO) as MotivoEscalamiento[]).map((m) =>
        <Fila key={m} titulo={ETIQUETAS_MOTIVO[m]} enLinea>
            <Interruptor etiqueta={ETIQUETAS_MOTIVO[m]} activo={p.escalar[m]} onChange={(v) => setEscalar({ [m]: v })} />
          </Fila>
        )}
        <Fila titulo="El saldo supera un monto" descripcion="Los clientes con deudas mayores los atiende siempre una persona.">
          <div className="flex items-center gap-3">
            {p.escalar.montoMayorA !== null &&
            <label className="flex items-center gap-1.5 text-sm text-muted">
                $
                <input
                type="number"
                inputMode="numeric"
                min={1000}
                step={1000}
                aria-label="Monto límite en MXN"
                value={p.escalar.montoMayorA}
                onChange={(e) => setEscalar({ montoMayorA: Math.max(1, Number(e.target.value) || 0) })}
                className={cn(claseInput, 'w-32')} />

                MXN
              </label>
            }
            <Interruptor
              etiqueta="Escalar por monto"
              activo={p.escalar.montoMayorA !== null}
              onChange={(v) => setEscalar({ montoMayorA: v ? 50_000 : null })} />

          </div>
        </Fila>
      </Grupo>

      <Grupo titulo="Horario de envío">
        <Fila enLinea titulo="Limitar horario de cobranza" descripcion="Fuera del horario no se inician envíos. Las respuestas a clientes se atienden siempre.">
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
          {guardando ? 'Guardando…' : 'Guardar políticas'}
        </Button>
      </div>
    </div>);

}
