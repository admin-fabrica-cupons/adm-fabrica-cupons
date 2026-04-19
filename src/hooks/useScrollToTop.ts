'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook para garantir que a página sempre inicie no topo ao navegar
 * Resolve o problema de scroll no mobile
 */
export function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);
    
    // Force scroll to top (fallback for some browsers)
    if (typeof window !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Additional fallback with requestAnimationFrame
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  }, [pathname]);
}
