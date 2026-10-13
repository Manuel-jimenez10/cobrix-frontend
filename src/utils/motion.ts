export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
export const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];

export function teclaMod(): string {
  if (typeof navigator === 'undefined') return 'Ctrl';
  return /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
}