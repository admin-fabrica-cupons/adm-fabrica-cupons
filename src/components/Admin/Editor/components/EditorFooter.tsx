import React from 'react';
import { Editor } from '@tiptap/react';

interface EditorFooterProps {
  editor: Editor;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
      <div className="flex items-center gap-4">
        <span>
          {characterCount} {characterCount === 1 ? 'caractere' : 'caracteres'}
        </span>
        <span>
          {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}
        </span>
      </div>
    </div>
  );
};
