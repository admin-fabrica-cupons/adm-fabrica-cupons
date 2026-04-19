"use client";

import { useEffect, useState } from "react";

import { cn } from "../../lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
}

export function TypingAnimation({
  text,
  duration = 20,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); 
    
    // Otimização: mostrar múltiplos caracteres por vez para textos longos
    const chunkSize = text.length > 200 ? 3 : text.length > 100 ? 2 : 1;
    
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + chunkSize));
        i += chunkSize;
      } else {
        setDisplayedText(text); // Garantir texto completo
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [text, duration]);

  return (
    <div
      className={cn(
        "font-display text-sm leading-[1.5rem] tracking-[-0.02em] drop-shadow-sm whitespace-pre-wrap",
        className,
      )}
    >
      {displayedText}
    </div>
  );
}
