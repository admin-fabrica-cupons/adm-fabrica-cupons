import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface HyperTextProps {
  text: string;
  duration?: number;
  className?: string;
  animateOnVisible?: boolean;
}

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export const HyperText: React.FC<HyperTextProps> = ({
  text,
  duration = 0.5,
  className = '',
  animateOnVisible = true,
}) => {
  const [displayText, setDisplayText] = React.useState(text);
  const [isAnimating, setIsAnimating] = React.useState(!animateOnVisible);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animateOnVisible) {
      setIsAnimating(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnimating(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animateOnVisible]);

  useEffect(() => {
    if (!isAnimating) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (index < currentIndex) {
                return char;
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, (duration * 1000) / text.length);

    return () => clearInterval(interval);
  }, [isAnimating, text, duration]);

  return (
    <div ref={ref} className={className}>
      {displayText}
    </div>
  );
};

export default HyperText;
