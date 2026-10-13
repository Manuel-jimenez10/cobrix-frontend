import React from 'react';
import type { EstadoFactura, Factura } from '../../types/cobranza';
import { cn } from '../../utils/cn';
import { formatFecha } from '../../utils/format';
import { Money } from '../ui/Money';

const ESTADOS: Record<EstadoFactura, {etiqueta: string;clase: string;}> = {
  pendiente: { etiqueta: 'Pendiente', clase: 'text-warn' },
  vencida: { etiqueta: 'Vencida', clase: 'text-bad' },
  pagada: { etiqueta: 'Pagada', clase: 'text-ok' },
  promesa: { etiqueta: 'Promesa', clase: 'text-promise' }
};

export function FacturasList({ facturas }: {facturas: Factura[];}) {
  return (
    <section aria-labelledby="facturas-titulo">
      <h3 id="facturas-titulo" className="text-sm font-medium">
        Facturas <span className="font-normal text-muted">· {facturas.length}</span>
      </h3>
      {facturas.length === 0 ?
      <p className="mt-3 text-sm text-muted">Sin facturas registradas.</p> :

      <ul className="mt-2 divide-y divide-line">
          {facturas.map((f) => {
          const e = ESTADOS[f.estado];
          return (
            <li key={f.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-mono text-[13px]">{f.folio}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Emitida {formatFecha(f.fechaEmision)} · Vence {formatFecha(f.fechaVencimiento)}
                  </p>
                </div>
                <div className="text-right">
                  <Money valor={f.monto} className={cn('text-sm font-medium', f.estado === 'pagada' && 'text-muted line-through decoration-1')} />
                  <p className={cn('mt-0.5 text-xs font-medium', e.clase)}>
                    {e.etiqueta}
                    {f.diasAtraso > 0 && f.estado !== 'pagada' && <span className="font-normal text-muted"> · {f.diasAtraso} d</span>}
                  </p>
                </div>
              </li>);

        })}
        </ul>
      }
    </section>);

}