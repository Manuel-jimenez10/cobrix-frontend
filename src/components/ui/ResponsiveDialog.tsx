import React from 'react';
import { useEsEscritorio } from '../../hooks/useMediaQuery';
import { BottomSheet } from './BottomSheet';
import { type DialogProps, Modal } from './Modal';

/** Modal centrado en escritorio, hoja inferior arrastrable en móvil. */
export function ResponsiveDialog(props: DialogProps) {
  const escritorio = useEsEscritorio();
  return escritorio ? <Modal {...props} /> : <BottomSheet {...props} />;
}