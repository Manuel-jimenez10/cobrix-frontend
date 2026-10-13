import React from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT } from '../../utils/motion';

export function SuccessCheck({ tamano = 40 }: {tamano?: number;}) {
  return (
    <motion.span
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="relative inline-grid shrink-0 place-items-center rounded-full bg-ok/15 text-ok"
      style={{ width: tamano, height: tamano }}
      aria-hidden="true">
      
      <motion.span
        className="absolute inset-0 rounded-full border border-ok/60"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.55, opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.12, ease: 'easeOut' }} />
      
      <svg viewBox="0 0 24 24" width={tamano * 0.5} height={tamano * 0.5} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.28, delay: 0.08, ease: 'easeOut' }} />
      </svg>
    </motion.span>);

}