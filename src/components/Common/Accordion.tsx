import React, { useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface AccordionItem {
  title?: string;
  content: React.ReactNode | string[];
}

export interface AccordionProps {
  title: string;
  icon?: LucideIcon;
  color?: string; // blue, green, purple, orange, red, indigo, yellow
  items: AccordionItem[];
  isOrdered?: boolean;
  symbolColor?: string;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  icon: Icon,
  color = 'blue',
  items,
  isOrdered = false,
  symbolColor,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Mapeamento de cores para classes Tailwind
  const getColorClasses = (c: string) => {
    const colors: Record<string, { bg: string, text: string, border: string, dot: string, bgDot: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30', dot: 'bg-blue-600 dark:bg-blue-400', bgDot: 'bg-blue-100 dark:bg-blue-900/40' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-900/30', dot: 'bg-green-600 dark:bg-green-400', bgDot: 'bg-green-100 dark:bg-green-900/40' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/30', dot: 'bg-purple-600 dark:bg-purple-400', bgDot: 'bg-purple-100 dark:bg-purple-900/40' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/30', dot: 'bg-orange-600 dark:bg-orange-400', bgDot: 'bg-orange-100 dark:bg-orange-900/40' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-900/30', dot: 'bg-red-600 dark:bg-red-400', bgDot: 'bg-red-100 dark:bg-red-900/40' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/30', dot: 'bg-indigo-600 dark:bg-indigo-400', bgDot: 'bg-indigo-100 dark:bg-indigo-900/40' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-100 dark:border-yellow-900/30', dot: 'bg-yellow-600 dark:bg-yellow-400', bgDot: 'bg-yellow-100 dark:bg-yellow-900/40' },
    };
    return colors[c] || colors.blue;
  };

  const theme = getColorClasses(color);
  
  // Cor do símbolo personalizada ou padrão do tema
  const getSymbolClasses = (sc?: string) => {
    if (!sc) return { dot: theme.dot, bgDot: theme.bgDot };
    const symbolColors: Record<string, { dot: string, bgDot: string }> = {
      blue: { dot: 'bg-blue-600 dark:bg-blue-400', bgDot: 'bg-blue-100 dark:bg-blue-900/40' },
      green: { dot: 'bg-green-600 dark:bg-green-400', bgDot: 'bg-green-100 dark:bg-green-900/40' },
      purple: { dot: 'bg-purple-600 dark:bg-purple-400', bgDot: 'bg-purple-100 dark:bg-purple-900/40' },
      orange: { dot: 'bg-orange-600 dark:bg-orange-400', bgDot: 'bg-orange-100 dark:bg-orange-900/40' },
      red: { dot: 'bg-red-600 dark:bg-red-400', bgDot: 'bg-red-100 dark:bg-red-900/40' },
      indigo: { dot: 'bg-indigo-600 dark:bg-indigo-400', bgDot: 'bg-indigo-100 dark:bg-indigo-900/40' },
      yellow: { dot: 'bg-yellow-600 dark:bg-yellow-400', bgDot: 'bg-yellow-100 dark:bg-yellow-900/40' },
    };
    return symbolColors[sc] || { dot: theme.dot, bgDot: theme.bgDot };
  };

  const symbolTheme = getSymbolClasses(symbolColor);

  return (
    <div className={`mb-4 bg-white dark:bg-slate-900 rounded-2xl border ${isOpen ? theme.border : 'border-gray-100 dark:border-slate-800'} transition-all duration-300 overflow-hidden shadow-sm`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-5 sm:p-6 flex items-center justify-between text-left transition-colors ${isOpen ? theme.bg : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${isOpen ? 'bg-white dark:bg-slate-800 shadow-sm scale-110' : theme.bg}`}>
              <Icon size={20} className={theme.text} />
            </div>
          )}
          <h3 className={`text-base sm:text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
            {title}
          </h3>
        </div>
        <ChevronDown 
          size={20} 
          className={`transition-transform duration-500 ${isOpen ? 'rotate-180 ' + theme.text : 'text-gray-400'}`} 
        />
      </button>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-5 sm:p-6 pt-0 border-t border-gray-100 dark:border-slate-800">
          <div className="mt-6 space-y-6">
            {items.map((section, idx) => (
              <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                {section.title && (
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm sm:text-base flex items-center gap-2">
                    <span className={`w-1 h-4 rounded-full ${theme.dot}`}></span>
                    {section.title}
                  </h4>
                )}
                {Array.isArray(section.content) ? (
                  isOrdered ? (
                    <ol className="space-y-4 ml-1">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 group">
                          <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black transition-transform group-hover:scale-110 ${theme.bg} ${theme.text}`}>
                            {i + 1}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed pt-0.5">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="space-y-4 ml-1">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 group">
                          <div className={`p-1.5 rounded-lg mt-1 transition-transform group-hover:scale-110 ${symbolTheme.bgDot}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${symbolTheme.dot}`}></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed pt-0.5">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed pl-3 border-l-2 border-gray-100 dark:border-slate-800">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
