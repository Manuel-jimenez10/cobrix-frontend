import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import { Button } from '../ui/Button';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SpotlightProps {
  /** Valores de data-tour, en orden de preferencia: se ilumina el primero visible. */
  objetivo: string[];
  titulo: string;
  texto: string;
  /** "3 de 15" */
  progreso?: {actual: number;total: number;};
  /** Botón principal cuando el paso solo es informativo. */
  siguiente?: {etiqueta: string;onClick: () => void;};
  /** Si el elemento no está en pantalla: botón para llevar al usuario a donde sí está. */
  alternativa?: {etiqueta: string;onClick: () => void;};
  /** El usuario presionó el elemento iluminado. */
  onClicObjetivo?: () => void;
  onSaltarPaso?: () => void;
  onCerrar: () => void;
  etiquetaCerrar?: string;
}

const MARGEN = 6;
const ANCHO_TARJETA = 320;

function buscar(objetivos: string[]): HTMLElement | null {
  for (const o of objetivos) {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(o)}"]`))) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return el;
    }
  }
  return null;
}

/**
 * Oscurece la pantalla, deja un "hueco" sobre el elemento que hay que presionar y muestra
 * una burbuja con la instrucción. Solo el elemento iluminado recibe clics.
 */
export function Spotlight({ objetivo, titulo, texto, progreso, siguiente, alternativa, onClicObjetivo, onSaltarPaso, onCerrar, etiquetaCerrar = 'Salir del recorrido' }: SpotlightProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [buscando, setBuscando] = useState(true);
  const [vista, setVista] = useState({ w: window.innerWidth, h: window.innerHeight });
  const elRef = useRef<HTMLElement | null>(null);
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const [altoTarjeta, setAltoTarjeta] = useState(180);
  const reducir = useReducedMotion();
  const clave = objetivo.join('|');

  // Sigue al elemento en cada cuadro (se mueve con scroll, animaciones y cambios de layout).
  useEffect(() => {
    setBuscando(true);
    setRect(null);
    elRef.current = null;
    let cuadro = 0;
    let desplazado = false;
    const inicio = performance.now();
    const ciclo = () => {
      const el = buscar(objetivo);
      if (el) {
        if (!desplazado) {
          desplazado = true;
          const r = el.getBoundingClientRect();
          if (r.top < 70 || r.bottom > window.innerHeight - 90) el.scrollIntoView({ block: 'center', behavior: reducir ? 'auto' : 'smooth' });
        }
        elRef.current = el;
        const r = el.getBoundingClientRect();
        setRect((prev) => prev && Math.abs(prev.top - r.top) < 0.5 && Math.abs(prev.left - r.left) < 0.5 && Math.abs(prev.width - r.width) < 0.5 && Math.abs(prev.height - r.height) < 0.5 ? prev : { top: r.top, left: r.left, width: r.width, height: r.height });
        setBuscando(false);
      } else {
        elRef.current = null;
        setRect(null);
        if (performance.now() - inicio > 1200) setBuscando(false);
      }
      cuadro = requestAnimationFrame(ciclo);
    };
    cuadro = requestAnimationFrame(ciclo);
    return () => cancelAnimationFrame(cuadro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(() => {
    const alCambiar = () => setVista({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', alCambiar);
    return () => window.removeEventListener('resize', alCambiar);
  }, []);

  // Detecta el clic en el elemento iluminado (el clic sigue su curso normal).
  useEffect(() => {
    if (!onClicObjetivo) return;
    const alClic = (e: MouseEvent) => {
      const el = elRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) setTimeout(onClicObjetivo, 0);
    };
    document.addEventListener('click', alClic, true);
    return () => document.removeEventListener('click', alClic, true);
  }, [onClicObjetivo]);

  useLayoutEffect(() => {
    if (tarjetaRef.current) setAltoTarjeta(tarjetaRef.current.offsetHeight);
  });

  const hueco = rect && {
    top: Math.max(rect.top - MARGEN, 0),
    left: Math.max(rect.left - MARGEN, 0),
    width: Math.min(rect.width + MARGEN * 2, vista.w),
    height: rect.height + MARGEN * 2
  };

  // Burbuja: debajo del elemento si cabe, si no arriba; si no hay elemento, centrada.
  const ancho = Math.min(ANCHO_TARJETA, vista.w - 24);
  let posTarjeta: React.CSSProperties;
  let debajo = true;
  if (hueco) {
    const abajo = hueco.top + hueco.height + 12;
    const arriba = hueco.top - 12 - altoTarjeta;
    const top = abajo + altoTarjeta < vista.h - 8 ? abajo : arriba > 8 ? arriba : Math.max(8, vista.h - altoTarjeta - 8);
    const left = Math.min(Math.max(12, hueco.left + hueco.width / 2 - ancho / 2), vista.w - ancho - 12);
    posTarjeta = { top, left, width: ancho };
    debajo = top >= hueco.top + hueco.height;
  } else {
    posTarjeta = { top: Math.max(12, vista.h / 2 - altoTarjeta / 2), left: vista.w / 2 - ancho / 2, width: ancho };
  }

  const velo = 'fixed bg-black/60 pointer-events-auto';
  const sinObjetivo = !hueco && !buscando;

  return createPortal(
    <div className="fixed inset-0 z-[70]" style={{ pointerEvents: 'none' }} aria-live="polite">
      {hueco ?
      <>
          <div className={velo} style={{ top: 0, left: 0, right: 0, height: hueco.top }} />
          <div className={velo} style={{ top: hueco.top + hueco.height, left: 0, right: 0, bottom: 0 }} />
          <div className={velo} style={{ top: hueco.top, left: 0, width: hueco.left, height: hueco.height }} />
          <div className={velo} style={{ top: hueco.top, left: hueco.left + hueco.width, right: 0, height: hueco.height }} />
          <motion.div
          className="fixed rounded-xl ring-2 ring-brand"
          style={{ top: hueco.top, left: hueco.left, width: hueco.width, height: hueco.height, boxShadow: '0 0 0 4px rgb(var(--brand) / 0.25)' }}
          animate={reducir ? undefined : { opacity: [1, 0.55, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />

        </> :

      <div className={cn(velo, 'inset-0')} />
      }

      {!buscando &&
      <motion.div
        ref={tarjetaRef}
        key={clave + titulo}
        role="dialog"
        aria-label={titulo}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        style={{ ...posTarjeta, pointerEvents: 'auto' }}
        className="fixed rounded-2xl border border-brand/40 bg-surface p-4 shadow-2xl shadow-black/50">

          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {progreso &&
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-brand">
                  Paso {progreso.actual} de {progreso.total}
                </p>
            }
              <p className="text-[15px] font-semibold leading-snug">{titulo}</p>
            </div>
            <button type="button" onClick={onCerrar} aria-label={etiquetaCerrar} className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
              <XIcon size={16} />
            </button>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{texto}</p>
          {progreso &&
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${progreso.actual / progreso.total * 100}%` }} />
            </div>
        }
          <div className="mt-3 flex items-center justify-between gap-2">
            {onSaltarPaso ?
          <button type="button" onClick={onSaltarPaso} className="rounded-md px-1.5 py-1 text-xs text-muted hover:text-fg">
                Saltar paso
              </button> :

          <span />
          }
            {siguiente ?
          <Button variante="primario" tamano="sm" onClick={siguiente.onClick}>
                {siguiente.etiqueta}
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Button> :
          sinObjetivo && alternativa ?
          <Button variante="primario" tamano="sm" onClick={alternativa.onClick}>
                {alternativa.etiqueta}
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Button> :
          hueco ?
          <span className="text-xs font-medium text-brand">Presiona lo iluminado {debajo ? '↑' : '↓'}</span> :
          null}
          </div>
        </motion.div>
      }
    </div>,
    document.body
  );
}
