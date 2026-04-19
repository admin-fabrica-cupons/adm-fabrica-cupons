import React from 'react';
import { X } from 'lucide-react';

interface InputWithClearProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  onClear: () => void;
  label?: string;
  containerClassName?: string;
  as?: 'input' | 'textarea';
  icon?: React.ReactNode;
}

const InputWithClear: React.FC<InputWithClearProps> = ({ 
  onClear, 
  label, 
  containerClassName = '', 
  className = '',
  value,
  as = 'input',
  icon,
  ...props 
}) => {
  const Component = as === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
            {icon}
          </div>
        )}
        <Component
          value={value}
          className={`w-full p-2 ${icon ? 'pl-10' : ''} pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-transparent outline-none transition-all ${className}`}
          {...(props as any)}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors z-10"
            title="Limpar"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InputWithClear;
