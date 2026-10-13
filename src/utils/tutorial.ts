/** Pasos del recorrido guiado. Cualquier parte de la app puede avisar que se completó uno. */
export type PasoTutorial = 'cartera' | 'cobranza' | 'atender' | 'director' | 'guia';

const EVENTO = 'cobrix:tutorial';

export function avisarTutorial(paso: PasoTutorial) {
  window.dispatchEvent(new CustomEvent<PasoTutorial>(EVENTO, { detail: paso }));
}

export function escucharTutorial(fn: (paso: PasoTutorial) => void): () => void {
  const manejador = (e: Event) => fn((e as CustomEvent<PasoTutorial>).detail);
  window.addEventListener(EVENTO, manejador);
  return () => window.removeEventListener(EVENTO, manejador);
}
