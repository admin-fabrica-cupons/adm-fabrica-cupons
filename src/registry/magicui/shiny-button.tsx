import React from "react";
import { cn } from "@/lib/utils";

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-pink-500 via-rose-500 to-rose-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Shine effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center">
          {children}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-pink-400/20 via-rose-400/20 to-pink-400/20 blur-md" />
      </button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

export { ShinyButton };
