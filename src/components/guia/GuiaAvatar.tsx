import React from 'react';
import { LifeBuoyIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function GuiaAvatar({ tamano = 'md', className }: {tamano?: 'sm' | 'md';className?: string;}) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand ring-1 ring-brand/40', tamano === 'sm' ? 'h-6 w-6' : 'h-8 w-8', className)}>
      <LifeBuoyIcon size={tamano === 'sm' ? 12 : 15} strokeWidth={2.2} />
    </span>);

}
