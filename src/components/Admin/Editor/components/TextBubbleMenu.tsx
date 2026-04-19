import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { useState } from 'react';

interface TextBubbleMenuProps {
  editor: Editor;
}

export const TextBubbleMenu = ({ editor }: TextBubbleMenuProps) => {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu 
      editor={editor} 
      className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${editor.isActive('bold') ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
        title="Negrito"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${editor.isActive('italic') ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
        title="Itálico"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${editor.isActive('strike') ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
        title="Tachado"
      >
        <Strikethrough size={16} />
      </button>
      
      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      <button
        onClick={setLink}
        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${editor.isActive('link') ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}
        title="Link"
      >
        <LinkIcon size={16} />
      </button>
      
      {editor.isActive('link') && (
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500"
          title="Remover Link"
        >
          <Unlink size={16} />
        </button>
      )}
    </BubbleMenu>
  );
};
