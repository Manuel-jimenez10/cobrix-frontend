import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function Kbd({ children, className }: {children: ReactNode;className?: string;}) {
  return (
    <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface px-1.5 font-sans text-[11px] font-medium text-muted', className)}>
      {children}
    </kbd>);

}