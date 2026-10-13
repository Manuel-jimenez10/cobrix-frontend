import { FileTextIcon, SparklesIcon } from 'lucide-react';
import type { OrigenTexto } from '../../types/cobranza';
import { cn } from '../../utils/cn';

/** Indica si un texto lo redactó la IA o viene de la plantilla base. */
export function OrigenBadge({ origen, className }: {origen: OrigenTexto;className?: string;}) {
  const ia = origen === 'ia';
  const Icono = ia ? SparklesIcon : FileTextIcon;
  return (
    <span className={cn('inline-flex h-5 items-center gap-1 rounded px-1.5 text-[11px] font-medium', ia ? 'bg-promise/10 text-promise' : 'bg-surface-2 text-muted', className)}>
      <Icono size={11} aria-hidden="true" />
      {ia ? 'Redactado con IA' : 'Plantilla'}
    </span>);

}
