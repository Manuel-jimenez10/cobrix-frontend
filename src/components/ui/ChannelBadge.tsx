import React from 'react';
import { MessageCircleIcon, MonitorSmartphoneIcon } from 'lucide-react';
import type { Canal } from '../../types/cobranza';
import { cn } from '../../utils/cn';

export function ChannelBadge({ canal, className }: {canal: Canal;className?: string;}) {
  const esWhatsApp = canal === 'whatsapp';
  const Icono = esWhatsApp ? MessageCircleIcon : MonitorSmartphoneIcon;
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md border border-line px-2 text-xs font-medium text-muted', className)}>
      <Icono size={12} className={esWhatsApp ? 'text-ok' : 'text-promise'} aria-hidden="true" />
      {esWhatsApp ? 'WhatsApp' : 'Simulador'}
    </span>);

}