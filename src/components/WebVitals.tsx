'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log métricas no console (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vital:', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: Math.round(metric.delta),
      });
    }

    // Enviar para analytics em produção
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
        });
      }

      // Exemplo: Vercel Analytics
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('event', {
          name: metric.name,
          data: {
            value: Math.round(metric.value),
            rating: metric.rating,
          },
        });
      }
    }
  });

  return null;
}

export default WebVitals;
