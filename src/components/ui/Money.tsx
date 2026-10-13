import React from 'react';
import { cn } from '../../utils/cn';
import { formatMXN, partesMonto } from '../../utils/format';

interface MoneyProps {
  valor: number;
  moneda?: boolean;
  className?: string;
}

/** Monto con jerarquía: el signo $ y los centavos se muestran más pequeños. */
export function Money({ valor, moneda = false, className }: MoneyProps) {
  const { entero, centavos, negativo } = partesMonto(valor);
  return (
    <span className={cn('whitespace-nowrap tabular-nums tracking-tight', className)}>
      <span className="sr-only">{formatMXN(valor)}</span>
      <span aria-hidden="true">
        {negativo && '−'}
        <span className="mr-[0.06em] text-[0.62em] font-medium opacity-60" style={{ verticalAlign: '0.32em' }}>
          $
        </span>
        {entero}
        <span className="text-[0.62em] opacity-60">.{centavos}</span>
        {moneda && <span className="ml-[0.3em] text-[0.5em] font-medium opacity-60">MXN</span>}
      </span>
    </span>);

}