import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className }: {className?: string;}) {
  return <div className={cn('rounded-md bg-surface-2 motion-safe:animate-pulse', className)} aria-hidden="true" />;
}