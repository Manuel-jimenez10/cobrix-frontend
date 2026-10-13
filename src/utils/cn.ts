import { twMerge } from 'tailwind-merge';

export function cn(...clases: Array<string | false | null | undefined>): string {
  return twMerge(clases.filter(Boolean).join(' '));
}