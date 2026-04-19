import React from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AffiliateButtonProps {
  href: string;
  text?: string;
  logo?: string;
  variant?: 'blue' | 'green' | 'orange';
  className?: string;
  compact?: boolean;
  themeClasses?: {
    button?: string;
  };
}

const AffiliateButton: React.FC<AffiliateButtonProps> = ({
  href,
  text = 'Ver Oferta',
  logo,
  variant = 'blue',
  className = "",
  compact = false,
  themeClasses
}) => {

  const variants = {
    blue: {
      bg: "bg-gradient-to-b from-[#2D3277] via-[#353b8c] to-[#1e2255]",
      glow: "shadow-[0_4px_14px_0_rgba(53,59,140,0.39)] hover:shadow-[0_6px_20px_rgba(53,59,140,0.23)]",
      border: "border-blue-400/30",
      hover: "hover:bg-[#353b8c]"
    },
    green: {
      bg: "bg-gradient-to-b from-green-600 via-green-500 to-green-700",
      glow: "shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.23)]",
      border: "border-green-300/30",
      hover: "hover:bg-green-500"
    },
    orange: {
      bg: "bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600",
      glow: "shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)]",
      border: "border-orange-200/30",
      hover: "hover:bg-orange-400"
    }
  };

  const style = variants[variant];

  // Base classes - rounded-md for near-zero rounding
  const baseClasses = "relative flex items-center justify-center w-full rounded-md transition-all duration-200 active:scale-[0.97] group overflow-hidden border";

  // Responsive size classes with proper breakpoints
  const sizeClasses = compact
    ? "py-2.5 px-3 sm:px-4 min-h-[42px] sm:min-h-[46px]"
    : "py-3 px-4 sm:py-3.5 sm:px-6 md:py-4 md:px-8 min-h-[48px] sm:min-h-[52px] md:min-h-[56px]";

  const finalButtonClass = themeClasses?.button
    ? themeClasses.button
    : cn(style.bg, style.border, style.glow, style.hover);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(baseClasses, sizeClasses, finalButtonClass, "no-underline hover:no-underline !no-underline", className)}
    >
      {/* Brilho Superior (Glass Effect) */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70" />

      {/* Conteúdo - always horizontal row, never stack */}
      <div className="relative z-10 flex flex-row items-center justify-center gap-1.5 sm:gap-2 w-full">
        {logo && logo.trim() !== '' && (
          <div className={cn(
            "bg-white rounded px-0.5 sm:px-1 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
            compact ? "h-6.5 sm:h-7 w-auto" : "h-5 sm:h-6 md:h-7 w-auto"
          )}>
            <Image
              src={logo}
              alt="Loja"
              width={56}
              height={28}
              unoptimized
              className={cn(
                "h-full w-auto object-contain",
                compact ? "max-w-[40px]" : "max-w-[44px] sm:max-w-[56px]"
              )}
            />
          </div>
        )}

        <span className={cn(
          "font-bold text-white text-center leading-none tracking-wide truncate",
          compact ? "text-sm sm:text-base font-black" : "text-[11px] sm:text-xs md:text-sm"
        )}>
          {text}
        </span>
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
    </a>
  );
};

export default AffiliateButton;
