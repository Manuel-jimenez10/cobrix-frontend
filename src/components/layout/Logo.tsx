import React from 'react';

export function Logo({ compacto = false }: {compacto?: boolean;}) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-on-brand" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
          <path d="M16.8 7.6a6.2 6.2 0 1 0 0 8.8" />
          <path d="M12 9.6v4.8" />
        </svg>
      </span>
      {compacto ? <span className="sr-only">Cobrix</span> : <span className="text-[17px] font-semibold tracking-tight">Cobrix</span>}
    </span>);

}