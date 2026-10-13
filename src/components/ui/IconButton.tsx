import React, { forwardRef, type ReactNode } from 'react';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  'aria-label': string;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
{ className, children, type = 'button', ...rest },
ref)
{
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg disabled:opacity-40 lg:h-9 lg:w-9',
        className
      )}
      {...rest}>
      
      {children}
    </motion.button>);

});