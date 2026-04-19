import React, { useMemo, useState } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Emoji from '@tiptap/extension-emoji';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import emojiSuggestion from './extensions/EmojiSuggestion';
import { YoutubeCustom } from './extensions/YoutubeCustom';
import { YoutubeDialog } from './components/dialogs/YoutubeDialog';
import { LinkDialog } from './components/dialogs/LinkDialog';
import { CouponNode } from './extensions/CouponNode';
import { ProductNode } from './extensions/ProductNode';
import { AccordionNode } from './extensions/AccordionNode';
import { ProductListNode } from './extensions/ProductListNode';
import { CouponListNode } from './extensions/CouponListNode';
import { HotProductNode } from './extensions/HotProductNode';
import { TableNode } from './extensions/TableNode';
import { ProsConsNode } from './extensions/ProsConsNode';
import { ImageSlidesNode } from './extensions/ImageSlidesNode';
import { NoteOfEditorNode } from './extensions/NoteOfEditorNode';
import { CitationNode } from './extensions/CitationNode';
import { RelatedPostsNode } from './extensions/RelatedPostsNode';
import { SlashCommand } from './extensions/SlashCommand';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorFab } from './components/EditorFab';
import { AIBubbleMenu } from './components/AIBubbleMenu';
import { TextBubbleMenu } from './components/TextBubbleMenu';
import { EditorFooter } from './components/EditorFooter';

interface EditorProps {
  initialContent?: any;
  onChange?: (json: any, html: string) => void;
  editable?: boolean;
}

const underlineStyle = Extension.create({
  name: 'underlineStyle',
  addGlobalAttributes() {
    return [
      {
        types: ['underline'],
        attributes: {
          underlineColor: {
            default: null,
            parseHTML: element => element.style.textDecorationColor?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.underlineColor) {
                return {};
              }
              return { style: `text-decoration-color: ${attributes.underlineColor}` };
            },
          },
          underlineThickness: {
            default: null,
            parseHTML: element => {
              const value = element.style.textDecorationThickness;
              if (!value) return null;
              const parsed = parseFloat(value);
              return Number.isNaN(parsed) ? null : parsed;
            },
            renderHTML: attributes => {
              if (!attributes.underlineThickness) {
                return {};
              }
              return { style: `text-decoration-thickness: ${attributes.underlineThickness}px` };
            },
          },
        },
      },
    ];
  },
});

const typographyStyle = Extension.create({
  name: 'typographyStyle',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
          fontSize: {
            default: null,
            parseHTML: element => {
              const value = element.style.fontSize;
              if (!value) return null;
              const parsed = parseFloat(value);
              return Number.isNaN(parsed) ? null : parsed;
            },
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return { style: `font-size: ${attributes.fontSize}px` };
            },
          },
        },
      },
    ];
  },
});

const listStyle = Extension.create({
  name: 'listStyle',
  addGlobalAttributes() {
    return [
      {
        types: ['orderedList'],
        attributes: {
          listStyleType: {
            default: null,
            parseHTML: element => element.style.listStyleType || null,
            renderHTML: attributes => (attributes.listStyleType ? { style: `list-style-type: ${attributes.listStyleType}` } : {}),
          },
          start: {
            default: 1,
            parseHTML: element => {
              const value = element.getAttribute('start');
              const parsed = value ? Number(value) : 1;
              return Number.isNaN(parsed) ? 1 : parsed;
            },
            renderHTML: attributes => (attributes.start && attributes.start !== 1 ? { start: attributes.start } : {}),
          },
        },
      },
      {
        types: ['bulletList'],
        attributes: {
          listStyleType: {
            default: null,
            parseHTML: element => element.style.listStyleType || null,
            renderHTML: attributes => (attributes.listStyleType ? { style: `list-style-type: ${attributes.listStyleType}` } : {}),
          },
        },
      },
    ];
  },
});

import { ImageNodeView } from './extensions/ImageNodeView';

const buildImageStyle = (attrs: Record<string, any>) => {
  const width = typeof attrs.imageWidth === 'number' ? attrs.imageWidth : (attrs.imageSize === 'small' ? 45 : attrs.imageSize === 'medium' ? 60 : attrs.imageSize === 'large' ? 80 : 100);
  const ratio = attrs.imageRatio === '1:1' ? '1 / 1' : attrs.imageRatio === '4:3' ? '4 / 3' : attrs.imageRatio === '16:9' ? '16 / 9' : '';
  const align = attrs.imageAlign || 'center';
  const styleParts = [`width: ${width}%`, 'display: block'];
  if (ratio) {
    styleParts.push(`aspect-ratio: ${ratio}`, 'object-fit: cover');
  }
  if (align === 'center') {
    styleParts.push('margin-left: auto', 'margin-right: auto');
  } else if (align === 'right') {
    styleParts.push('margin-left: auto', 'margin-right: 0');
  } else {
    styleParts.push('margin-left: 0', 'margin-right: auto');
  }
  return styleParts.join('; ');
};

const ImageWithControls = Image.extend({
  addAttributes() {
    const parentAttributes = this.parent ? this.parent() : {};
    return {
      ...parentAttributes,
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => (attributes.id ? { 'data-id': attributes.id } : {}),
      },
      imageAlign: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => ({ 'data-align': attributes.imageAlign }),
      },
      imageRatio: {
        default: 'auto',
        parseHTML: element => element.getAttribute('data-ratio') || 'auto',
        renderHTML: attributes => ({ 'data-ratio': attributes.imageRatio }),
      },
      imageWidth: {
        default: null,
        parseHTML: element => {
          const value = element.getAttribute('data-width');
          return value ? Number(value) : null;
        },
        renderHTML: attributes => (attributes.imageWidth ? { 'data-width': attributes.imageWidth } : {}),
      },
      imageSize: {
        default: 'full',
        parseHTML: element => element.getAttribute('data-size') || 'full',
        renderHTML: attributes => ({ 'data-size': attributes.imageSize }),
      },
      imageLink: {
        default: null,
        parseHTML: element => element.getAttribute('data-link'),
        renderHTML: attributes => (attributes.imageLink ? { 'data-link': attributes.imageLink } : {}),
      },
      imageCaption: {
        default: '',
        parseHTML: element => element.getAttribute('data-caption') || '',
        renderHTML: attributes => (attributes.imageCaption ? { 'data-caption': attributes.imageCaption } : {}),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const style = buildImageStyle(HTMLAttributes as Record<string, any>);
    if ((HTMLAttributes as Record<string, any>).imageLink) {
      return ['a', { href: (HTMLAttributes as Record<string, any>).imageLink, target: '_blank', rel: 'noopener noreferrer' }, ['img', mergeAttributes(HTMLAttributes, { style })]];
    }
    return ['img', mergeAttributes(HTMLAttributes, { style })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
  draggable: true,
});

export const Editor: React.FC<EditorProps> = ({ initialContent, onChange, editable = true }) => {
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [youtubeCallback, setYoutubeCallback] = useState<((url: string) => void) | null>(null);
  const [linkCallback, setLinkCallback] = useState<((url: string, text?: string) => void) | null>(null);
  const [linkInitialUrl, setLinkInitialUrl] = useState('');
  const [linkInitialText, setLinkInitialText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);


  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
        blockquote: {
          HTMLAttributes: {
            class: 'editor-blockquote',
          },
        },
      }),
      GlobalDragHandle.configure({
        dragHandleWidth: 18,
        scrollTreshold: 100,
      }),
      ImageWithControls,
      Placeholder.configure({
        placeholder: 'Comece a escrever ou digite / para comandos...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      underlineStyle,
      typographyStyle,
      listStyle,
      Color,
      CouponNode,
      ProductNode,
      AccordionNode,
      ProductListNode,
      CouponListNode,
      HotProductNode,
      TableNode,
      ProsConsNode,
      ImageSlidesNode,
      NoteOfEditorNode,
      CitationNode,
      RelatedPostsNode,
      SlashCommand,
      Highlight.configure({ multicolor: true }),
      YoutubeCustom.configure({
        controls: false,
      }),
      CharacterCount,
      Emoji.configure({
        suggestion: emojiSuggestion,
      }),
    ],
    []
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialContent ?? '',
    editable,
    onUpdate: ({ editor }) => {
      // Verificar se editor existe e não foi destruído
      if (!editor || editor.isDestroyed) return;

      const json = editor.getJSON();
      const html = editor.getHTML();
      if (onChange) {
        onChange(json, html);
      }
    },
    onCreate: ({ editor }) => {
      (editor as any).openYoutubeDialog = (callback: (url: string) => void) => {
        setYoutubeCallback(() => callback);
        setIsYoutubeDialogOpen(true);
      };
      (editor as any).openLinkDialog = (callback: (url: string, text?: string) => void, initialUrl = '', initialText = '') => {
        setLinkCallback(() => callback);
        setLinkInitialUrl(initialUrl);
        setLinkInitialText(initialText);
        setIsLinkDialogOpen(true);
      };
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-6 py-6 cursor-text ProseMirror',
      },
    },
  });

  return (
    <>
      <div className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-white dark:bg-slate-900' : 'relative w-full h-full'} border border-slate-200 dark:border-slate-800 ${isFullscreen ? '' : 'rounded-xl'} shadow-sm flex flex-col`}>
        {editor && <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-40"><EditorToolbar editor={editor} onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} isFullscreen={isFullscreen} /></div>}
        {editor && <AIBubbleMenu editor={editor} />}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <EditorContent editor={editor} />
        </div>
        {editor && <EditorFooter editor={editor} />}
        {editor && <EditorFab editor={editor} />}
      </div>

      <YoutubeDialog
        isOpen={isYoutubeDialogOpen}
        onClose={() => setIsYoutubeDialogOpen(false)}
        onSubmit={(url) => {
          if (youtubeCallback) youtubeCallback(url);
          setIsYoutubeDialogOpen(false);
        }}
      />

      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        initialUrl={linkInitialUrl}
        initialText={linkInitialText}
        onSubmit={(url, text) => {
          if (linkCallback) linkCallback(url, text);
          setIsLinkDialogOpen(false);
        }}
      />
    </>
  );
};
