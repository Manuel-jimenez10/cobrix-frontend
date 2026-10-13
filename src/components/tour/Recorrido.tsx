import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheckIcon, GraduationCapIcon, LifeBuoyIcon, ListOrderedIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { useCobranza } from '../../contexts/CobranzaContext';
import { useGuia } from '../../contexts/GuiaContext';
import { useTutorial } from '../../contexts/TutorialContext';
import { useUI } from '../../contexts/UIContext';
import { useEsEscritorio } from '../../hooks/useMediaQuery';
import { EASE_OUT } from '../../utils/motion';
import { Button } from '../ui/Button';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { PASOS_RECORRIDO, type ContextoPaso } from './pasos';
import { Spotlight } from './Spotlight';

const FLUJO = [
{ icono: ListOrderedIcon, titulo: 'Ve a quién cobrar primero', texto: 'Tus clientes ordenados por atraso, monto y respuestas.' },
{ icono: MessageCircleIcon, titulo: 'Contesta a quien te escribe', texto: 'Tú llevas la conversación y cierras el acuerdo.' },
{ icono: CalendarCheckIcon, titulo: 'Registra y cobra promesas', texto: 'Anota la fecha y márcala cumplida cuando paguen.' },
{ icono: SendIcon, titulo: 'Envía recordatorios', texto: 'Plantillas de WhatsApp a todos los vencidos en un clic.' },
{ icono: LifeBuoyIcon, titulo: 'Pregúntale a la Guía', texto: 'Una IA que te explica y te señala dónde presionar.' }];


/** Cliente con el que se practica: el que espera respuesta o, si no hay, el más prioritario. */
function useClienteDePractica() {
  const { clientes } = useCobranza();
  return useMemo(
    () => clientes.find((c) => c.requiereAtencion && c.deuda > 0) ?? [...clientes].filter((c) => c.deuda > 0 && !c.escalado).sort((a, b) => b.prioridad.score - a.prioridad.score)[0] ?? null,
    [clientes]
  );
}

function Bienvenida() {
  const t = useTutorial();
  const navigate = useNavigate();
  const { setFiltrosCartera } = useUI();
  const practica = useClienteDePractica();
  const empezar = () => {
    setFiltrosCartera({ busqueda: '', estado: 'todos', prioridad: 'todas', orden: 'prioridad', atencion: false });
    navigate('/');
    t.empezar(practica?.id ?? null);
  };
  return (
    <ResponsiveDialog
      abierto={!t.bienvenidaVista}
      onCerrar={t.saltarBienvenida}
      titulo="Bienvenido a Cobrix"
      descripcion="La app para gestionar tus cobros por WhatsApp. Esta cartera es de ejemplo y es solo tuya: prueba todo sin miedo.">

      <ol className="mt-1 space-y-2">
        {FLUJO.map((f, i) =>
        <motion.li
          key={f.titulo}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 + i * 0.05, duration: 0.3, ease: EASE_OUT }}
          className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">

            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/15 text-brand" aria-hidden="true">
              <f.icono size={15} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{f.titulo}</span>
              <span className="block text-xs text-muted">{f.texto}</span>
            </span>
          </motion.li>
        )}
      </ol>
      <p className="mt-4 text-sm text-muted">El recorrido te ilumina cada botón que debes presionar. Toma unos 3 minutos.</p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variante="fantasma" onClick={t.saltarBienvenida}>
          Explorar por mi cuenta
        </Button>
        <Button variante="primario" icono={GraduationCapIcon} onClick={empezar}>
          Empezar recorrido
        </Button>
      </div>
    </ResponsiveDialog>);

}

function PasoActual() {
  const t = useTutorial();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const escritorio = useEsEscritorio();
  const { clientes } = useCobranza();
  const { setAbierto: setGuiaAbierta } = useGuia();
  const paso = t.activo ? PASOS_RECORRIDO[t.paso] : null;
  const practica = useClienteDePractica();
  // Si el recorrido empezó antes de cargar la cartera (o el cliente ya no existe), usa el de práctica.
  const valido = clientes.some((c) => c.id === t.clienteId);
  const clienteId = valido ? t.clienteId : practica?.id ?? null;
  const cliente = clientes.find((c) => c.id === clienteId);
  const ctx: ContextoPaso = { clienteId, empresa: cliente?.empresa ?? 'un cliente', escritorio };

  useEffect(() => {
    if (t.activo && !valido && practica) t.fijarCliente(practica.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.activo, valido, practica?.id]);

  // Pasos que avanzan al llegar a una pantalla.
  useEffect(() => {
    if (paso?.avance.tipo === 'ruta' && paso.avance.prueba(pathname, ctx)) t.avanzar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, paso?.id]);

  // La Guía (panel) taparía los botones del recorrido, salvo en el paso que la presenta.
  useEffect(() => {
    if (paso && paso.id !== 'guia' && paso.id !== 'fin') setGuiaAbierta(false);
  }, [paso, setGuiaAbierta]);

  if (!paso) return null;
  const ruta = paso.ruta(ctx);
  const enOtraPantalla = paso.avance.tipo !== 'ruta' && ruta !== pathname;

  return (
    <Spotlight
      objetivo={paso.objetivo(ctx)}
      titulo={paso.titulo(ctx)}
      texto={paso.texto(ctx)}
      progreso={{ actual: t.paso + 1, total: t.total }}
      siguiente={paso.avance.tipo === 'siguiente' ? { etiqueta: paso.id === 'fin' ? 'Terminar' : 'Siguiente', onClick: t.avanzar } : undefined}
      alternativa={{ etiqueta: enOtraPantalla || paso.avance.tipo === 'ruta' ? 'Llévame ahí' : 'Continuar', onClick: () => (enOtraPantalla || paso.avance.tipo === 'ruta') && ruta !== pathname ? navigate(ruta) : t.avanzar() }}
      onClicObjetivo={paso.avance.tipo === 'clic' ? t.avanzar : undefined}
      onSaltarPaso={paso.id === 'fin' ? undefined : t.avanzar}
      onCerrar={t.cerrar} />);

}

function PistaGuia() {
  const t = useTutorial();
  if (!t.pista || t.activo) return null;
  return (
    <Spotlight
      objetivo={t.pista.objetivo}
      titulo={t.pista.titulo}
      texto={t.pista.texto}
      siguiente={{ etiqueta: 'Entendido', onClick: t.cerrarPista }}
      onClicObjetivo={t.cerrarPista}
      onCerrar={t.cerrarPista}
      etiquetaCerrar="Cerrar indicación" />);

}

export function Recorrido() {
  return (
    <>
      <Bienvenida />
      <PasoActual />
      <PistaGuia />
    </>);

}
