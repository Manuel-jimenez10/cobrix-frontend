import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, GraduationCapIcon, PartyPopperIcon, XIcon } from 'lucide-react';
import { useCobranza } from '../../contexts/CobranzaContext';
import { useDirector } from '../../contexts/DirectorContext';
import { PASOS, useTutorial } from '../../contexts/TutorialContext';
import { useUI } from '../../contexts/UIContext';
import { AGENTES } from '../../data/agentes';
import { useEsEscritorio } from '../../hooks/useMediaQuery';
import type { AgenteId } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { EASE_OUT } from '../../utils/motion';
import type { PasoTutorial } from '../../utils/tutorial';
import { AgentAvatar } from '../ui/AgentAvatar';
import { Button } from '../ui/Button';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';

const PREGUNTA_DIRECTOR = '¿Cuánto falta por cobrar?';

const INFO: Record<PasoTutorial, {titulo: string;texto: string;accion: string;agente: AgenteId;}> = {
  cartera: {
    titulo: 'Revisa tu cartera',
    texto: 'Ve quién debe más y por qué el Analista lo puso primero.',
    accion: 'Ir a Cartera',
    agente: 'analista'
  },
  director: {
    titulo: 'Pregúntale al Director',
    texto: `Te responde con datos reales: "${PREGUNTA_DIRECTOR}"`,
    accion: 'Preguntar',
    agente: 'director'
  },
  cobranza: {
    titulo: 'Lanza una cobranza con IA',
    texto: 'Mira al Analista priorizar y al Redactor escribir cada mensaje.',
    accion: 'Iniciar cobranza',
    agente: 'redactor'
  },
  negociar: {
    titulo: 'Responde como un cliente',
    texto: 'Toca una respuesta como "Les pago el viernes" y el Negociador cierra el acuerdo.',
    accion: 'Abrir un cliente',
    agente: 'negociador'
  },
  politicas: {
    titulo: 'Ajusta las reglas del Negociador',
    texto: 'Define plazos, pagos y descuentos. El servidor las hace cumplir.',
    accion: 'Ver políticas',
    agente: 'negociador'
  }
};

const EQUIPO: AgenteId[] = ['director', 'analista', 'redactor', 'negociador'];

function Bienvenida() {
  const { bienvenidaVista, empezar, saltar } = useTutorial();
  return (
    <ResponsiveDialog abierto={!bienvenidaVista} onCerrar={saltar} titulo="Bienvenido a Cobrix" descripcion="Un equipo de cuatro agentes de IA que cobra por ti. Esta cartera es de ejemplo y es solo tuya: prueba todo sin miedo.">
      <ul className="mt-1 space-y-2">
        {EQUIPO.map((id, i) =>
        <motion.li
          key={id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 + i * 0.06, duration: 0.3, ease: EASE_OUT }}
          className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3">

            <AgentAvatar agente={id} />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{AGENTES[id].nombre}</span>
              <span className="block text-xs text-muted">{AGENTES[id].rol}</span>
            </span>
          </motion.li>
        )}
      </ul>
      <p className="mt-4 text-sm text-muted">El recorrido tiene 5 pasos y toma unos 2 minutos.</p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variante="fantasma" onClick={saltar}>
          Explorar por mi cuenta
        </Button>
        <Button variante="primario" icono={GraduationCapIcon} onClick={empezar}>
          Empezar recorrido
        </Button>
      </div>
    </ResponsiveDialog>);

}

function TarjetaPasos() {
  const t = useTutorial();
  const escritorio = useEsEscritorio();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDirectorAbierto, abrirCobranza, sidebarColapsado, directorAbierto } = useUI();
  const { enviar } = useDirector();
  const { clientes } = useCobranza();

  const hechos = PASOS.filter((p) => t.completado(p)).length;
  const siguiente = PASOS.find((p) => !t.completado(p)) ?? null;
  const ocultaEnMovil = !escritorio && (/^\/cartera\/[^/]+/.test(location.pathname) || location.pathname === '/director');

  const ejecutar = (p: PasoTutorial) => {
    if (!escritorio) t.setMinimizado(true);
    if (p === 'cartera') navigate('/cartera');else
    if (p === 'director') {
      if (escritorio) setDirectorAbierto(true);else
      navigate('/director');
      setTimeout(() => void enviar(PREGUNTA_DIRECTOR), escritorio ? 350 : 500);
    } else if (p === 'cobranza') abrirCobranza();else
    if (p === 'negociar') {
      const candidato = clientes.filter((c) => c.deuda > 0 && !c.escalado).sort((a, b) => b.prioridad.score - a.prioridad.score)[0];
      navigate(candidato ? `/cartera/${candidato.id}` : '/cartera');
    } else navigate('/ajustes');
  };

  if (!t.activo || !t.bienvenidaVista || ocultaEnMovil || escritorio && directorAbierto) return null;

  const posicion = escritorio ?
  { left: (sidebarColapsado ? 72 : 240) + 24, bottom: 24 } :
  { left: 12, right: 12, bottom: 'calc(76px + env(safe-area-inset-bottom))' };

  return (
    <motion.aside
      aria-label="Recorrido guiado"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      style={posicion}
      className={cn('fixed z-40 overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-2xl shadow-black/30 backdrop-blur', escritorio && 'w-[340px]')}>

      <div className="flex items-center gap-3 px-4 py-3">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center" aria-hidden="true">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-line" />
            <motion.circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-brand"
              strokeDasharray={2 * Math.PI * 15}
              animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - hechos / PASOS.length) }}
              transition={{ duration: 0.5, ease: EASE_OUT }} />

          </svg>
          <span className="text-[11px] font-semibold tabular-nums">
            {hechos}/{PASOS.length}
          </span>
        </span>
        <button type="button" onClick={() => t.setMinimizado(!t.minimizado)} className="min-w-0 flex-1 text-left" aria-expanded={!t.minimizado}>
          <span className="block text-sm font-semibold">{t.terminado ? '¡Recorrido completo!' : 'Recorrido guiado'}</span>
          <span className="block truncate text-xs text-muted">{t.terminado ? 'Ya viste a los cuatro agentes en acción.' : siguiente ? `Siguiente: ${INFO[siguiente].titulo}` : ''}</span>
        </button>
        <button
          type="button"
          onClick={() => t.setMinimizado(!t.minimizado)}
          aria-label={t.minimizado ? 'Expandir recorrido' : 'Minimizar recorrido'}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg">

          <ChevronDownIcon size={16} className={cn('transition-transform duration-200', t.minimizado && 'rotate-180')} />
        </button>
        <button type="button" onClick={t.cerrar} aria-label="Cerrar recorrido" className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg">
          <XIcon size={16} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!t.minimizado &&
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: EASE_OUT }} className="overflow-hidden">
            {t.terminado ?
          <div className="border-t border-line px-4 py-4">
                <div className="flex items-start gap-3">
                  <PartyPopperIcon size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-muted">
                    Priorizaste, cobraste, negociaste y ajustaste las reglas. Sigue explorando: todo lo que hagas aquí es real y solo afecta tu cartera de ejemplo.
                  </p>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variante="secundario" tamano="sm" onClick={t.cerrar}>
                    Cerrar
                  </Button>
                </div>
              </div> :

          <ol className="max-h-[50vh] overflow-y-auto border-t border-line py-1.5">
                {PASOS.map((p, i) => {
              const hecho = t.completado(p);
              const actual = p === siguiente;
              return (
                <li key={p} className={cn('px-2', actual && 'py-1')}>
                      <div className={cn('flex gap-3 rounded-xl px-2 py-2.5 transition-colors', actual && 'bg-surface-2')}>
                        <span
                      className={cn(
                        'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold',
                        hecho ? 'bg-brand text-on-brand' : actual ? 'border border-brand/60 text-brand' : 'border border-line text-muted'
                      )}>

                          {hecho ?
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                              <CheckIcon size={13} strokeWidth={3} />
                            </motion.span> :

                      i + 1
                      }
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-sm font-medium', hecho && 'text-muted line-through decoration-muted/50')}>{INFO[p].titulo}</p>
                          {actual &&
                      <>
                              <p className="mt-0.5 text-xs leading-relaxed text-muted">{INFO[p].texto}</p>
                              <Button variante="primario" tamano="sm" className="mt-2.5" onClick={() => ejecutar(p)}>
                                {INFO[p].accion}
                                <ArrowRightIcon size={14} aria-hidden="true" />
                              </Button>
                            </>
                      }
                        </div>
                        {!hecho && !actual &&
                    <button type="button" onClick={() => ejecutar(p)} className="self-center rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-fg">
                            Ir
                          </button>
                    }
                      </div>
                    </li>);

            })}
              </ol>
          }
          </motion.div>
        }
      </AnimatePresence>
    </motion.aside>);

}

export function Tutorial() {
  return (
    <>
      <Bienvenida />
      <AnimatePresence>
        <TarjetaPasos />
      </AnimatePresence>
    </>);

}
