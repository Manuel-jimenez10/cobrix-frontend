import { useEffect, useState } from 'react';

export function useScrolled(umbral = 24): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const alScroll = () => setScrolled(window.scrollY > umbral);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, [umbral]);
  return scrolled;
}