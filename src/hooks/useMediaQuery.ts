import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState(() =>
  typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const alCambiar = () => setCoincide(mql.matches);
    alCambiar();
    mql.addEventListener('change', alCambiar);
    return () => mql.removeEventListener('change', alCambiar);
  }, [query]);
  return coincide;
}

export function useEsEscritorio(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}