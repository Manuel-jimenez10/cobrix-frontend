import React from 'react';
import { TrendingUpIcon } from 'lucide-react';
import type { Dashboard } from '../../types/cobranza';
import { AnimatedValue } from '../ui/AnimatedValue';
import { Money } from '../ui/Money';

export function KpiGrid({ dashboard }: {dashboard: Dashboard;}) {
  const d = dashboard;
  return (
    <section aria-label="Indicadores de cartera" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
      <div className="col-span-2 bg-surface p-5 lg:col-span-1 lg:p-6">
        <p className="text-sm text-muted">Por cobrar</p>
        <AnimatedValue valor={d.porCobrar}>
          {(v) => <Money valor={v} className="mt-2 block text-[36px] font-semibold leading-none lg:text-[40px]" />}
        </AnimatedValue>
        <p className="mt-3 text-sm text-muted">
          <span className="tabular-nums">{d.facturasAbiertas}</span> facturas abiertas
        </p>
      </div>

      <div className="bg-surface p-5 lg:p-6">
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-bad" aria-hidden="true" />
          Vencido
        </p>
        <AnimatedValue valor={d.vencido}>
          {(v) => <Money valor={v} className="mt-2 block text-[22px] font-semibold leading-tight lg:text-2xl" />}
        </AnimatedValue>
        <p className="mt-2 text-sm text-bad">
          <span className="tabular-nums">{d.clientesVencidos}</span> clientes
        </p>
      </div>

      <div className="bg-surface p-5 lg:p-6">
        <p className="text-sm text-muted">Recuperado este mes</p>
        <AnimatedValue valor={d.recuperadoMes}>
          {(v) => <Money valor={v} className="mt-2 block text-[22px] font-semibold leading-tight lg:text-2xl" />}
        </AnimatedValue>
        {d.recuperadoVariacion > 0 &&
        <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-ok">
            <TrendingUpIcon size={14} aria-hidden="true" />
            <span className="tabular-nums">+{d.recuperadoVariacion.toFixed(1)}%</span>
            <span className="font-normal text-muted">vs. mes pasado</span>
          </p>
        }
      </div>

      <div className="col-span-2 flex items-end justify-between gap-4 bg-surface p-5 lg:col-span-1 lg:block lg:p-6">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-promise" aria-hidden="true" />
            Promesas activas
          </p>
          <AnimatedValue valor={d.promesasActivas}>
            {(v) => <span className="mt-2 block text-[22px] font-semibold tabular-nums leading-tight lg:text-2xl">{Math.round(v)}</span>}
          </AnimatedValue>
        </div>
        <p className="mt-2 text-sm text-muted">
          por <Money valor={d.montoPromesas} className="text-fg" />
        </p>
      </div>
    </section>);

}