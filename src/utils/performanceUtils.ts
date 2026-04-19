/**
 * Utilitários de Performance para o Admin
 */

/**
 * Verifica se o dispositivo é de baixa performance
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verifica número de cores do processador
  const cores = navigator.hardwareConcurrency || 1;
  if (cores <= 2) return true;
  
  // Verifica memória disponível (se disponível)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory <= 4) return true;
  
  // Verifica se é mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return isMobile;
}

/**
 * Reduz a qualidade de animações em dispositivos lentos
 */
export function getAnimationDuration(baseDuration: number): number {
  return isLowEndDevice() ? baseDuration * 0.5 : baseDuration;
}

/**
 * Decide se deve usar animações complexas
 */
export function shouldUseComplexAnimations(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Respeita preferência do usuário
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return false;
  
  return !isLowEndDevice();
}

/**
 * Throttle function para eventos frequentes
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Debounce function para inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Lazy load de imagens com Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          const src = image.dataset.src;
          if (src) {
            image.src = src;
            image.removeAttribute('data-src');
          }
          observer.unobserve(image);
        }
      });
    });
    observer.observe(img);
  } else {
    // Fallback para navegadores antigos
    const src = img.dataset.src;
    if (src) {
      img.src = src;
    }
  }
}

/**
 * Mede performance de uma função
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[Performance] ${name} failed after ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Otimiza re-renders comparando objetos
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => obj1[key] === obj2[key]);
}

/**
 * Calcula chunk size ideal para animação de texto
 */
export function getOptimalChunkSize(textLength: number): number {
  if (isLowEndDevice()) {
    // Dispositivos lentos: chunks maiores
    return textLength > 200 ? 5 : textLength > 100 ? 3 : 2;
  }
  
  // Dispositivos normais
  return textLength > 200 ? 3 : textLength > 100 ? 2 : 1;
}

/**
 * Calcula duração ideal para animação de texto
 */
export function getOptimalAnimationSpeed(textLength: number): number {
  const baseSpeed = isLowEndDevice() ? 5 : 8; // ms por chunk
  
  // Textos muito longos podem ser mais rápidos
  if (textLength > 500) return baseSpeed * 0.7;
  if (textLength > 200) return baseSpeed * 0.85;
  
  return baseSpeed;
}
