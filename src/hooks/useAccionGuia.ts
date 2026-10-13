import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCobranza } from '../contexts/CobranzaContext';
import { useGuia } from '../contexts/GuiaContext';
import { type Pista, useTutorial } from '../contexts/TutorialContext';
import { useUI } from '../contexts/UIContext';
import type { AccionGuia } from '../types/guia';
import { useEsEscritorio } from './useMediaQuery';

/**
 * Ejecuta los botones que propone la Guía: lleva a la pantalla correcta
 * e ilumina el elemento exacto que hay que presionar.
 */
export function useAccionGuia() {
  const navigate = useNavigate();
  const escritorio = useEsEscritorio();
  const { setFiltrosCartera } = useUI();
  const { clientes } = useCobranza();
  const tutorial = useTutorial();
  const { setAbierto } = useGuia();

  return useCallback(
    (a: AccionGuia) => {
      const ir = (ruta: string, pista?: Pista) => {
        if (escritorio) setAbierto(false);
        navigate(ruta);
        if (pista) setTimeout(() => tutorial.mostrarPista(pista), 250);
      };
      const cliente = clientes.find((c) => c.id === a.clienteId);
      switch (a.destino) {
        case 'inicio':
          return ir('/');
        case 'cartera':
          return ir('/cartera');
        case 'cliente':
          return ir(a.clienteId ? `/cartera/${a.clienteId}` : '/cartera', {
            objetivo: ['responder'],
            titulo: `Contéstale a ${cliente?.empresa ?? 'tu cliente'}`,
            texto: 'Con “Tú (equipo)” seleccionado, escribe o toca una sugerencia y presiona enviar.'
          });
        case 'atencion':{
            setFiltrosCartera((f) => ({ ...f, estado: 'todos', prioridad: 'todas', busqueda: '', atencion: true }));
            const primero = clientes.find((c) => c.requiereAtencion);
            return ir('/cartera', primero ? {
              objetivo: [`cliente-${primero.id}`],
              titulo: `${primero.empresa} espera tu respuesta`,
              texto: 'Presiona su tarjeta para abrir la conversación y contestarle.'
            } : undefined);
          }
        case 'registrar_promesa':
          return ir(a.clienteId ? `/cartera/${a.clienteId}` : '/cartera', {
            objetivo: ['registrar-promesa'],
            titulo: 'Presiona “Registrar promesa”',
            texto: 'Elige el monto y la fecha que acordaron. Sus recordatorios se pausan hasta ese día.'
          });
        case 'promesas':
          return ir('/promesas', {
            objetivo: ['cumplir-promesa'],
            titulo: 'Cuando te paguen',
            texto: 'Presiona “Cumplida” en la promesa: el pago se suma a lo recuperado del mes.'
          });
        case 'iniciar_cobranza':
          return ir('/', {
            objetivo: ['iniciar-cobranza'],
            titulo: 'Presiona “Iniciar cobranza”',
            texto: 'Verás a quién se le enviará el recordatorio antes de confirmar.'
          });
        case 'reglas':
          return ir('/ajustes#reglas', { objetivo: ['reglas'], titulo: 'Reglas de cobranza', texto: 'Aquí defines el horario de envíos y el tono máximo. Al terminar presiona “Guardar reglas”.' });
        case 'whatsapp':
          return ir('/ajustes#whatsapp', { objetivo: ['whatsapp'], titulo: 'Conexión con WhatsApp', texto: 'Revisa el estado de la conexión y escribe tu número de pruebas.' });
        case 'ajustes':
          return ir('/ajustes');
        case 'recorrido':{
            const practica = clientes.find((c) => c.requiereAtencion && c.deuda > 0) ?? [...clientes].filter((c) => c.deuda > 0).sort((x, y) => y.prioridad.score - x.prioridad.score)[0];
            setFiltrosCartera({ busqueda: '', estado: 'todos', prioridad: 'todas', orden: 'prioridad', atencion: false });
            ir('/');
            return tutorial.empezar(practica?.id ?? null);
          }
        case 'guia':
          return escritorio ? setAbierto(true) : navigate('/guia');
      }
    },
    [navigate, escritorio, setFiltrosCartera, clientes, tutorial, setAbierto]
  );
}
