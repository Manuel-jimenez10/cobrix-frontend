import React, { forwardRef, ReactNode } from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { BoxIcon } from "lucide-react";
type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro';
type Tamano = 'sm' | 'md' | 'lg';
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variante?: Variante;
  tamano?: Tamano;
  icono?: typeof BoxIcon;
  children?: ReactNode;
}
const VARIANTES: Record<Variante, string> = {
  primario: 'bg-brand text-on-brand hover:bg-brand/90',
  secundario: 'border border-line bg-surface-2 text-fg hover:bg-line/70',
  fantasma: 'text-muted hover:bg-surface-2 hover:text-fg',
  peligro: 'bg-bad/10 text-bad hover:bg-bad/15'
};
const TAMANOS: Record<Tamano, string> = {
  sm: 'h-10 px-3 text-sm lg:h-8',
  md: 'h-11 px-4 text-sm lg:h-9',
  lg: 'h-12 px-5 text-[15px]'
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variante = 'secundario',
  tamano = 'md',
  icono: Icono,
  className,
  children,
  type = 'button',
  ...rest
}, ref) {
  return <motion.button ref={ref} type={type} whileTap={{
    scale: 0.97
  }} transition={{
    duration: 0.12
  }} className={cn('inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45', VARIANTES[variante], TAMANOS[tamano], className)} {...rest}>
      {Icono && <Icono size={16} strokeWidth={2} aria-hidden="true" />}
      {children}
    </motion.button>;
});