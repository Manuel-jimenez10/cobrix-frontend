import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Ilustracion = 'cartera' | 'promesas' | 'seleccion' | 'error';

interface EmptyStateProps {
  ilustracion: Ilustracion;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}

function Dibujo({ tipo }: {tipo: Ilustracion;}) {
  const comun = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (tipo === 'promesas') {
    return (
      <svg viewBox="0 0 120 96" className="h-24 w-32" aria-hidden="true">
        <rect x="22" y="18" width="76" height="62" rx="10" {...comun} className="text-line" />
        <path d="M22 36h76" {...comun} className="text-line" />
        <path d="M42 12v12M78 12v12" {...comun} className="text-muted" />
        <circle cx="60" cy="58" r="12" {...comun} className="text-brand" />
        <path d="M54.5 58.5l4 4 7-8" {...comun} className="text-brand" />
      </svg>);

  }
  if (tipo === 'seleccion') {
    return (
      <svg viewBox="0 0 120 96" className="h-24 w-32" aria-hidden="true">
        <rect x="14" y="16" width="62" height="14" rx="5" {...comun} className="text-line" />
        <rect x="14" y="38" width="62" height="14" rx="5" {...comun} className="text-brand" />
        <rect x="14" y="60" width="62" height="14" rx="5" {...comun} className="text-line" />
        <path d="M84 30h20M84 45h20M84 60h12" {...comun} className="text-muted" />
      </svg>);

  }
  if (tipo === 'error') {
    return (
      <svg viewBox="0 0 120 96" className="h-24 w-32" aria-hidden="true">
        <path d="M60 16l40 66H20z" {...comun} className="text-line" />
        <path d="M60 40v18M60 68v1" {...comun} className="text-bad" />
      </svg>);

  }
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-32" aria-hidden="true">
      <rect x="30" y="22" width="56" height="64" rx="8" {...comun} className="text-line" />
      <rect x="38" y="12" width="56" height="64" rx="8" {...comun} className="text-muted" />
      <path d="M48 30h28M48 40h20M48 58h12" {...comun} className="text-muted" />
      <path d="M70 58h14" {...comun} className="text-brand" />
    </svg>);

}

export function EmptyState({ ilustracion, titulo, descripcion, accion, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <Dibujo tipo={ilustracion} />
      <h3 className="mt-4 text-base font-semibold">{titulo}</h3>
      {descripcion && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>);

}