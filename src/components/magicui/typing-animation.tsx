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
    
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
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
