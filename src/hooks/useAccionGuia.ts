import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuia } from '../contexts/GuiaContext';
import { useTutorial } from '../contexts/TutorialContext';
import { useUI } from '../contexts/UIContext';
import type { AccionGuia } from '../types/guia';
import { useEsEscritorio } from './useMediaQuery';

/** Ejecuta los botones que propone la Guía: navegar, abrir el Director, iniciar el recorrido… */
export function useAccionGuia() {
  const navigate = useNavigate();
  const escritorio = useEsEscritorio();
  const { setDirectorAbierto, abrirCobranza, setFiltrosCartera } = useUI();
  const { reiniciar, empezar, terminado } = useTutorial();
  const { setAbierto } = useGuia();

  return useCallback(
    (a: AccionGuia) => {
      switch (a.destino) {
        case 'inicio':
          return navigate('/');
        case 'cartera':
          return navigate('/cartera');
        case 'cliente':
          return navigate(a.clienteId ? `/cartera/${a.clienteId}` : '/cartera');
        case 'atencion':
          setFiltrosCartera((f) => ({ ...f, estado: 'todos', prioridad: 'todas', busqueda: '', atencion: true }));
          return navigate('/cartera');
        case 'director':
          if (escritorio) {
            setAbierto(false);
            setDirectorAbierto(true);
            return;
          }
          return navigate('/director');
        case 'promesas':
          return navigate('/promesas');
        case 'ajustes':
          return navigate('/ajustes');
        case 'reglas':
          return navigate('/ajustes#reglas');
        case 'whatsapp':
          return navigate('/ajustes#whatsapp');
        case 'recorrido':
          if (!escritorio) navigate('/');
          return terminado ? reiniciar() : empezar();
        case 'iniciar_cobranza':
          if (!escritorio) navigate('/');
          return abrirCobranza();
      }
    },
    [navigate, escritorio, setDirectorAbierto, abrirCobranza, setFiltrosCartera, reiniciar, empezar, terminado, setAbierto]
  );
}
