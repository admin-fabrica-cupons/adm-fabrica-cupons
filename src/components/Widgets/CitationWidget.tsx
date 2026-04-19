import React from 'react';
import { RiDoubleQuotesL, RiDoubleQuotesR } from 'react-icons/ri';

interface CitationData {
  text?: string;
  source?: string;
}

interface CitationWidgetProps {
  data: CitationData;
}

const CitationWidget: React.FC<CitationWidgetProps> = ({ data }) => {
  const text = data.text?.trim();
  if (!text) return null;

  return (
    <div className="not-prose my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4">
      <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
        <RiDoubleQuotesL size={18} className="mt-0.5 shrink-0" />
        <p className="text-sm italic font-light text-slate-700 dark:text-slate-200 leading-relaxed">
          {text}
        </p>
        <RiDoubleQuotesR size={18} className="mt-0.5 shrink-0" />
      </div>
      {data.source?.trim() && (
        <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          — {data.source}
        </div>
      )}
    </div>
  );
};

export default CitationWidget;
