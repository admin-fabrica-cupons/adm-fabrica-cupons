import { useEffect, useState, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
}

export function useMouse(): MousePosition {
  const elementRef = useRef<HTMLElement | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = elementRef.current?.getBoundingClientRect();
      const elementX = rect ? event.clientX - rect.left : event.clientX;
      const elementY = rect ? event.clientY - rect.top : event.clientY;
      setMousePosition({ 
        x: event.clientX, 
        y: event.clientY,
        elementX,
        elementY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return mousePosition;
}