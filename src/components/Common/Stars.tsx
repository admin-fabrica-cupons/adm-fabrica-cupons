import React from 'react';
import { Star } from 'lucide-react';

interface StarsProps {
  rating: number;
  size?: number;
  className?: string;
  starColor?: string;
  showNumber?: boolean;
  textColor?: string;
}

const Stars: React.FC<StarsProps> = ({
  rating,
  size = 16,
  className = "",
  starColor = "text-yellow-400",
  showNumber = false,
  textColor = "text-slate-500"
}) => {
  const safeRating = Math.max(0, Math.min(5, rating || 0));
  if (safeRating === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const isFull = s <= Math.floor(safeRating);
          const isPartial = s === Math.ceil(safeRating) && !Number.isInteger(safeRating);
          const partialValue = (safeRating % 1) * 100;
          return (
            <div key={s} className="relative leading-none" style={{ width: size, height: size }}>
              <Star size={size} className={starColor} strokeWidth={1} />
              {(isFull || isPartial) && (
                <div className={`absolute inset-0 overflow-hidden ${starColor}`} style={{ width: isFull ? '100%' : `${partialValue}%` }}>
                  <Star size={size} strokeWidth={1} className="fill-current" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showNumber && (
        <span className={`text-xs font-medium ${textColor}`}>{safeRating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default Stars;
