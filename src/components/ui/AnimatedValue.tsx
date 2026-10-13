import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '../../utils/motion';

interface AnimatedValueProps {
  valor: number;
  children: (actual: number) => ReactNode;
  duracion?: number;
}

/** Contador animado: interpola desde el valor anterior hasta el nuevo. */
export function AnimatedValue({ valor, children, duracion = 0.8 }: AnimatedValueProps) {
  const reducir = useReducedMotion();
  const [actual, setActual] = useState(reducir ? valor : 0);
  const desde = useRef(reducir ? valor : 0);

  useEffect(() => {
    if (reducir) {
      desde.current = valor;
      setActual(valor);
      return;
    }
    const control = animate(desde.current, valor, {
      duration: duracion,
      ease: EASE_OUT,
      onUpdate: (v) => {
        desde.current = v;
        setActual(v);
      }
    });
    return () => control.stop();
  }, [valor, reducir, duracion]);

  return <>{children(actual)}</>;
}