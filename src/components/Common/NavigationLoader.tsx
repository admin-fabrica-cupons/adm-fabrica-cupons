'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset loading state when pathname changes
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Listen for navigation start
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('#') && !link.target) {
        const url = new URL(link.href);
        if (url.pathname !== pathname && url.origin === window.location.origin) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Top loading bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[9999] origin-left"
          />
          
          {/* Overlay with spinner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-[9998] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/20 border-b-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold animate-pulse">
                Carregando...
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
