import React from 'react';
import { AlertTriangle, Info, Lightbulb } from 'lucide-react';

type NoteVariant = 'info' | 'tip' | 'warning';

interface NoteOfEditorData {
  variant?: NoteVariant;
  title?: string;
  content?: string;
}

interface NoteOfEditorProps {
  data: NoteOfEditorData;
}

const NoteOfEditor: React.FC<NoteOfEditorProps> = ({ data }) => {
  const variant = (data.variant || 'info') as NoteVariant;
  const variants: Record<NoteVariant, { label: string; icon: React.ReactNode; wrapper: string; title: string; text: string }> = {
    info: {
      label: 'Info',
      icon: <Info size={18} />,
      wrapper: 'border-blue-200 bg-blue-50/70 dark:border-blue-800/50 dark:bg-blue-900/20',
      title: 'text-blue-700 dark:text-blue-300',
      text: 'text-blue-900/80 dark:text-blue-100/80',
    },
    tip: {
      label: 'Dica',
      icon: <Lightbulb size={18} />,
      wrapper: 'border-orange-200 bg-orange-50/70 dark:border-orange-800/50 dark:bg-orange-900/20',
      title: 'text-orange-700 dark:text-orange-300',
      text: 'text-orange-900/80 dark:text-orange-100/80',
    },
    warning: {
      label: 'Aviso',
      icon: <AlertTriangle size={18} />,
      wrapper: 'border-red-200 bg-red-50/70 dark:border-red-800/50 dark:bg-red-900/20',
      title: 'text-red-700 dark:text-red-300',
      text: 'text-red-900/80 dark:text-red-100/80',
    },
  };

  const current = variants[variant];
  const title = data.title?.trim() || current.label;
  const content = data.content?.trim();

  return (
    <div className={`not-prose my-6 rounded-xl border p-4 ${current.wrapper}`}>
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${current.title}`}>
        {current.icon}
        {title}
      </div>
      {content && (
        <p className={`mt-2 text-sm leading-relaxed whitespace-pre-line ${current.text}`}>
          {content}
        </p>
      )}
    </div>
  );
};

export default NoteOfEditor;
