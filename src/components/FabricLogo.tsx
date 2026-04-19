import React from 'react';
import Image from 'next/image';

const FabricLogo: React.FC<{ className?: string; textClassName?: string }> = ({ className = '', textClassName = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8 shrink-0">
        <Image
          src="/logo.svg"
          alt="Logo Fábrica de Cupons"
          fill
          className="object-contain"
        />
      </div>
      <span className={`font-bold text-slate-800 dark:text-slate-200 text-lg tracking-tight ${textClassName}`}>
        Fábrica de Cupons
      </span>
    </div>
  );
};

export default FabricLogo;
