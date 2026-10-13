import { useEffect, useState } from 'react';

/** Re-renderiza periódicamente para mantener frescos los tiempos relativos. */
export function useAhora(intervalo = 30_000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), intervalo);
    return () => clearInterval(id);
  }, [intervalo]);
  return ahora;
}