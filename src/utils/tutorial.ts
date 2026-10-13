/**
 * Eventos del recorrido guiado: cualquier parte de la app avisa cuando el usuario
 * completó una acción, y el recorrido avanza solo.
 */
export type EventoTutorial = 'cartera' | 'atender' | 'promesa' | 'cumplir' | 'pagada' | 'cobranza' | 'guia';

const EVENTO = 'cobrix:tutorial';

export function avisarTutorial(evento: EventoTutorial) {
  window.dispatchEvent(new CustomEvent<EventoTutorial>(EVENTO, { detail: evento }));
}

export function escucharTutorial(fn: (evento: EventoTutorial) => void): () => void {
  const manejador = (e: Event) => fn((e as CustomEvent<EventoTutorial>).detail);
  window.addEventListener(EVENTO, manejador);
  return () => window.removeEventListener(EVENTO, manejador);
}
