import React, { useEffect, useMemo, useRef, useState, useId } from 'react';
import { Editor } from '@tiptap/react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  ChevronDown,
  Check,
  X,
  Undo2,
  Redo2,
  Minus,
  Highlighter,
  Youtube,
  Maximize2,
  Minimize2,
  Type,
} from 'lucide-react';
import { TbBlockquote } from 'react-icons/tb';
import { TableOfContents } from './TableOfContents';
import AIImageModal from '../../Util/AIImageModal';

interface EditorToolbarProps {
  editor: Editor;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onToggleFullscreen, isFullscreen = false }) => {
  const colorRef = useRef<HTMLDivElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const underlineRef = useRef<HTMLDivElement | null>(null);
  const linkDescriptionId = useId();
  const imageDescriptionId = useId();
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);
  const [isUnderlineOpen, setIsUnderlineOpen] = useState(false);
  const [isTextStyleOpen, setIsTextStyleOpen] = useState(false);
  const [isFontFamilyOpen, setIsFontFamilyOpen] = useState(false);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const textStyleRef = useRef<HTMLDivElement | null>(null);
  const fontFamilyRef = useRef<HTMLDivElement | null>(null);
  const fontSizeRef = useRef<HTMLDivElement | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isAiImageOpen, setIsAiImageOpen] = useState(false);
  const [underlineColor, setUnderlineColor] = useState('#2563eb');
  const [underlineThickness, setUnderlineThickness] = useState(2);
  const [fontFamily, setFontFamily] = useState('default');
  const [fontSize, setFontSize] = useState(16);
  const [customTextColor, setCustomTextColor] = useState('#000000');
  const [, setToolbarVersion] = useState(0);
  const [textStyleType, setTextStyleType] = useState<'paragraph' | 'heading1' | 'heading2' | 'heading3'>('paragraph');

  // Close all dropdowns when one opens
  const closeAllDropdowns = () => {
    setIsColorOpen(false);
    setIsHighlightOpen(false);
    setIsUnderlineOpen(false);
    setIsTextStyleOpen(false);
    setIsFontFamilyOpen(false);
    setIsFontSizeOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(event.target as Node)) {
        setIsColorOpen(false);
      }
      if (highlightRef.current && !highlightRef.current.contains(event.target as Node)) {
        setIsHighlightOpen(false);
      }
      if (underlineRef.current && !underlineRef.current.contains(event.target as Node)) {
        setIsUnderlineOpen(false);
      }
      if (textStyleRef.current && !textStyleRef.current.contains(event.target as Node)) {
        setIsTextStyleOpen(false);
      }
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(event.target as Node)) {
        setIsFontFamilyOpen(false);
      }
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setIsFontSizeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateState = () => {
      setToolbarVersion((prev) => prev + 1);
      const textStyleAttrs = editor.getAttributes('textStyle') || {};
      const underlineAttrs = editor.getAttributes('underline') || {};
      
      setUnderlineColor(underlineAttrs.underlineColor || '#2563eb');
      setUnderlineThickness(underlineAttrs.underlineThickness || 2);
      
      setFontFamily(textStyleAttrs.fontFamily || 'default');
      setFontSize(textStyleAttrs.fontSize || 16);

      if (textStyleAttrs.color) {
        setCustomTextColor(textStyleAttrs.color);
      }

      if (editor.isActive('heading', { level: 1 })) {
        setTextStyleType('heading1');
      } else if (editor.isActive('heading', { level: 2 })) {
        setTextStyleType('heading2');
      } else if (editor.isActive('heading', { level: 3 })) {
        setTextStyleType('heading3');
      } else {
        setTextStyleType('paragraph');
      }
    };

    updateState();
    editor.on('selectionUpdate', updateState);
    editor.on('transaction', updateState);
    return () => {
      editor.off('selectionUpdate', updateState);
      editor.off('transaction', updateState);
    };
  }, [editor]);
  
  useEffect(() => {
    const handleOpenImageDialog = (event: Event) => {
      const detail = (event as CustomEvent<{ src?: string; alt?: string }>).detail;
      setImageUrl(detail?.src || '');
      setImageAlt(detail?.alt || '');
      setIsEditingImage(true);
      setIsImageOpen(true);
    };

    window.addEventListener('tiptap-open-image-dialog', handleOpenImageDialog);
    return () => window.removeEventListener('tiptap-open-image-dialog', handleOpenImageDialog);
  }, []);

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');

    if ((editor as any).openLinkDialog) {
      (editor as any).openLinkDialog((url: string, text?: string) => {
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
          return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }, previousUrl, text);
      return;
    }
  };

  const openImageDialog = () => {
    const attrs = editor.getAttributes('image') || {};
    setImageUrl(attrs.src || '');
    setImageAlt(attrs.imageCaption || attrs.alt || '');
    setIsEditingImage(editor.isActive('image'));
    setIsImageOpen(true);
  };

  const isValidImageUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleImageSubmit = () => {
    const url = imageUrl.trim();
    if (!url) {
      setIsImageOpen(false);
      setImageUrl('');
      setImageAlt('');
      setIsEditingImage(false);
      setImageError(null);
      return;
    }
    if (!isValidImageUrl(url)) {
      setImageError('URL inválida. Use http ou https.');
      return;
    }

    const nextAlt = imageAlt.trim();
    if (isEditingImage && editor.isActive('image')) {
      (editor as any).chain().focus().updateAttributes('image', { src: url, alt: nextAlt, imageCaption: nextAlt }).run();
    } else {
      (editor as any).chain().focus().setImage({ src: url, alt: nextAlt, imageCaption: nextAlt }).run();
    }
    setIsImageOpen(false);
    setImageUrl('');
    setImageAlt('');
    setIsEditingImage(false);
    setImageError(null);
  };
  
  const applyUnderlineStyle = (color?: string, thickness?: number) => {
    const nextColor = color ?? underlineColor;
    const nextThickness = thickness ?? underlineThickness;
    if (editor.isActive('underline')) {
      editor.chain().focus().updateAttributes('underline', {
        underlineColor: nextColor,
        underlineThickness: nextThickness,
      }).run();
    } else {
      editor.chain().focus().setMark('underline', {
        underlineColor: nextColor,
        underlineThickness: nextThickness,
      }).run();
    }
  };

  const colorPresets = useMemo(
    () => [
      '#000000', '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827',
      '#fecaca', '#ef4444', '#fed7aa', '#f97316', '#fde68a', '#eab308', '#fef08a', '#bbf7d0', '#22c55e', '#bae6fd', '#0ea5e9',
      '#bfdbfe', '#2563eb', '#c7d2fe', '#6366f1', '#ddd6fe', '#8b5cf6', '#e9d5ff', '#a855f7', '#fbcfe8', '#ec4899', '#fce7f3',
    ],
    []
  );
  const highlightPresets = useMemo(
    () => [
      '#fef08a', '#fde68a', '#fcd34d', '#fecaca', '#fbcfe8', '#ddd6fe', '#c7d2fe', '#bae6fd', '#bbf7d0', '#fed7aa',
    ],
    []
  );
  const underlinePresets = useMemo(
    () => ['#000000', '#ffffff', '#2563eb', '#10b981', '#f97316', '#e11d48', '#a855f7', '#94a3b8', '#fde68a', '#bbf7d0'],
    []
  );
  const fontFamilies = useMemo(
    () => [
      { label: 'Padrão', value: 'default' },
      { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
      { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
      { label: 'Courier New', value: '"Courier New", Courier, monospace' },
      { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    ],
    []
  );

  const fontSizes = useMemo(
    () => [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72],
    []
  );

  const underlineThicknessOptions = useMemo(
    () => [1, 2, 3, 4, 6],
    []
  );

  const textStyleOptions = [
    { label: 'Texto', value: 'paragraph', icon: <Type size={14} /> },
    { label: 'Título 1', value: 'heading1', icon: <Heading1 size={14} /> },
    { label: 'Título 2', value: 'heading2', icon: <Heading2 size={14} /> },
    { label: 'Título 3', value: 'heading3', icon: <Heading3 size={14} /> },
  ];

  const handleTextStyleChange = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (value === 'heading1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value === 'heading2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === 'heading3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };
  
  return (
    <>
      <div className={`border-b border-slate-800/50 dark:border-slate-700/50 p-2 bg-slate-900/95 dark:bg-slate-950/95 z-40 w-full backdrop-blur-sm flex items-center gap-1.5 flex-wrap ${isFullscreen ? 'justify-center' : ''}`}>
      
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().undo().run()}
            disabled={!(editor as any).can().undo()}
            className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 dark:hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().redo().run()}
            disabled={!(editor as any).can().redo()}
            className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 dark:hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Typography Group */}
        <div className="flex items-center gap-3 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-1.5 flex-shrink-0">
          {/* Text Style Dropdown */}
          <div className="relative" ref={textStyleRef}>
            <button
              type="button"
              onMouseEnter={() => {
                closeAllDropdowns();
                setIsTextStyleOpen(true);
              }}
              onClick={() => {
                closeAllDropdowns();
                setIsTextStyleOpen(prev => !prev);
              }}
              className="h-8 px-2.5 min-w-[110px] flex items-center justify-between gap-1.5 rounded-md bg-slate-700/50 dark:bg-slate-800/50 text-xs text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-600 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                {textStyleOptions.find(opt => opt.value === textStyleType)?.icon}
                <span>{textStyleOptions.find(opt => opt.value === textStyleType)?.label}</span>
              </div>
              <ChevronDown size={12} />
            </button>
            {isTextStyleOpen && (
              <div 
                className="absolute top-9 left-0 z-[10001] min-w-[130px] rounded-lg border border-slate-700 bg-slate-900 shadow-xl backdrop-blur-sm"
                onMouseLeave={() => setIsTextStyleOpen(false)}
              >
                <div className="p-1">
                  {textStyleOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleTextStyleChange(option.value);
                        setIsTextStyleOpen(false);
                        editor.commands.focus();
                      }}
                      className="w-full flex items-center gap-2 rounded-md py-1.5 px-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Font Family Dropdown */}
          <div className="relative" ref={fontFamilyRef}>
            <button
              type="button"
              onMouseEnter={() => {
                closeAllDropdowns();
                setIsFontFamilyOpen(true);
              }}
              onClick={() => {
                closeAllDropdowns();
                setIsFontFamilyOpen(prev => !prev);
              }}
              className="h-8 px-2.5 min-w-[100px] flex items-center justify-between gap-1.5 rounded-md bg-slate-700/50 dark:bg-slate-800/50 text-xs text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-600 transition-colors"
              title="Família da fonte"
            >
              <span>{fontFamilies.find(f => f.value === fontFamily)?.label || 'Fonte'}</span>
              <ChevronDown size={12} />
            </button>
            {isFontFamilyOpen && (
              <div 
                className="absolute top-9 left-0 z-[10001] min-w-[130px] rounded-lg border border-slate-700 bg-slate-900 shadow-xl backdrop-blur-sm"
                onMouseLeave={() => setIsFontFamilyOpen(false)}
              >
                <div className="p-1 max-h-[200px] overflow-y-auto">
                  {fontFamilies.map(option => (
                    <button
                      key={option.label}
                      onClick={() => {
                        const nextValue = option.value === 'default' ? null : option.value;
                        setFontFamily(option.value);
                        (editor as any).chain().focus().setMark('textStyle', { fontFamily: nextValue }).run();
                        setIsFontFamilyOpen(false);
                        editor.commands.focus();
                      }}
                      className="w-full text-left rounded-md py-1.5 px-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Font Size Dropdown */}
          <div className="relative" ref={fontSizeRef}>
            <button
              type="button"
              onMouseEnter={() => {
                closeAllDropdowns();
                setIsFontSizeOpen(true);
              }}
              onClick={() => {
                closeAllDropdowns();
                setIsFontSizeOpen(prev => !prev);
              }}
              className="h-8 px-2.5 w-[60px] flex items-center justify-between gap-1.5 rounded-md bg-slate-700/50 dark:bg-slate-800/50 text-xs text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-600 transition-colors"
              title="Tamanho da fonte"
            >
              <span>{fontSize}</span>
              <ChevronDown size={12} />
            </button>
            {isFontSizeOpen && (
              <div 
                className="absolute top-9 left-0 z-[10001] min-w-[60px] rounded-lg border border-slate-700 bg-slate-900 shadow-xl backdrop-blur-sm"
                onMouseLeave={() => setIsFontSizeOpen(false)}
              >
                <div className="p-1 max-h-[200px] overflow-y-auto">
                  {fontSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        setFontSize(size);
                        (editor as any).chain().focus().setMark('textStyle', { fontSize: size }).run();
                        setIsFontSizeOpen(false);
                        editor.commands.focus();
                      }}
                      className="w-full text-center rounded-md py-1.5 px-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Formatting */}
        <div className="flex items-center gap-0.5 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().toggleBold().run()}
            disabled={!(editor as any).can().chain().focus().toggleBold().run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Negrito (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().toggleItalic().run()}
            disabled={!(editor as any).can().chain().focus().toggleItalic().run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Itálico (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().toggleStrike().run()}
            disabled={!(editor as any).can().chain().focus().toggleStrike().run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('strike') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Tachado (Ctrl+Shift+X)"
          >
            <Strikethrough size={16} />
          </button>
          
          <div className="w-px h-5 bg-slate-700 mx-0.5" />
          
          <TableOfContents editor={editor} />
          
          {/* Underline */}
          <div className="relative flex items-center" ref={underlineRef}>
            <button
              type="button"
              onClick={() => {
                if (editor.isActive('underline')) {
                  (editor as any).chain().focus().unsetUnderline().run();
                } else {
                  applyUnderlineStyle();
                }
              }}
              className={`h-8 w-7 rounded-l-md flex items-center justify-center transition-colors ${editor.isActive('underline') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              title="Sublinhado"
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              onMouseEnter={() => {
                closeAllDropdowns();
                setIsUnderlineOpen(true);
              }}
              onClick={() => {
                closeAllDropdowns();
                setIsUnderlineOpen(prev => !prev);
              }}
              className="h-8 w-5 rounded-r-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border-l border-slate-700 transition-colors"
              title="Opções de sublinhado"
            >
              <ChevronDown size={10} />
            </button>
            {isUnderlineOpen && (
              <div 
                className="absolute top-9 left-0 z-[10001] w-64 rounded-lg border border-slate-700 bg-slate-900 shadow-xl backdrop-blur-sm p-3 space-y-3"
                onMouseLeave={() => setIsUnderlineOpen(false)}
              >
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2">Espessura</div>
                  <div className="flex items-center gap-1.5">
                    {underlineThicknessOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setUnderlineThickness(option);
                          applyUnderlineStyle(underlineColor, option);
                        }}
                        className={`h-9 flex-1 rounded-md border flex items-center justify-center px-2 transition-colors ${
                          underlineThickness === option
                            ? 'bg-slate-800 border-blue-600'
                            : 'border-slate-700 hover:bg-slate-800/50'
                        }`}
                        title={`${option}px`}
                      >
                        <div 
                          className={`w-full ${underlineThickness === option ? 'bg-blue-500' : 'bg-slate-600'}`} 
                          style={{ height: `${option}px`, borderRadius: '99px' }} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2">Cor</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {underlinePresets.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setUnderlineColor(color);
                          applyUnderlineStyle(color, underlineThickness);
                        }}
                        className={`h-7 w-7 rounded-md border transition-all hover:scale-110 ${underlineColor === color ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-700'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Highlight */}
          <div className="relative" ref={highlightRef}>
            <button
              type="button"
              onMouseEnter={() => {
                closeAllDropdowns();
                setIsHighlightOpen(true);
              }}
              onClick={() => {
                closeAllDropdowns();
                setIsHighlightOpen(prev => !prev);
              }}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('highlight') ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              title="Realçar texto"
            >
              <Highlighter size={16} />
            </button>
            {isHighlightOpen && (
              <div 
                className="absolute top-9 left-0 z-[10001] w-52 rounded-lg border border-slate-700 bg-slate-900 shadow-xl backdrop-blur-sm p-2.5"
                onMouseLeave={() => setIsHighlightOpen(false)}
              >
                <div className="grid grid-cols-5 gap-1.5">
                  {highlightPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        (editor as any).chain().focus().toggleHighlight({ color }).run();
                        setIsHighlightOpen(false);
                      }}
                      className="h-7 w-7 rounded-md border border-slate-700 hover:scale-110 hover:border-slate-600 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      (editor as any).chain().focus().unsetHighlight().run();
                      setIsHighlightOpen(false);
                    }}
                    className="flex-1 h-7 rounded-md border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Remover realce
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Text Color */}
          <div className="relative" ref={colorRef}>
            <button
              type="button"
              onMouseEnter={() => {
                closeAllDropdowns();
                setIsColorOpen(true);
              }}
              onClick={() => {
                closeAllDropdowns();
                setIsColorOpen(prev => !prev);
              }}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.getAttributes('textStyle').color ? 'bg-slate-800' : 'hover:bg-slate-700/50'} text-slate-400 hover:text-slate-200`}
              title="Cor do texto"
            >
              <Palette size={16} style={{ color: editor.getAttributes('textStyle').color || undefined }} />
            </button>
            {isColorOpen && (
              <div 
                className="absolute top-9 left-0 z-[10001] w-60 rounded-lg border border-slate-700 bg-slate-900 shadow-xl backdrop-blur-sm p-2.5"
                onMouseLeave={() => setIsColorOpen(false)}
              >
                <div className="grid grid-cols-6 gap-1.5">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        (editor as any).chain().focus().setColor(color).run();
                        setIsColorOpen(false);
                      }}
                      className="h-6 w-6 rounded-md border border-slate-700 hover:scale-110 hover:border-slate-600 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-400">Personalizada</span>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md border border-slate-700" style={{ backgroundColor: customTextColor }} />
                      <input
                        type="color"
                        value={customTextColor}
                        onChange={(event) => {
                          const nextColor = event.target.value;
                          setCustomTextColor(nextColor);
                          (editor as any).chain().focus().setColor(nextColor).run();
                        }}
                        className="h-7 w-10 rounded-md border border-slate-700 bg-slate-800 cursor-pointer"
                        aria-label="Selecionar cor personalizada"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      (editor as any).chain().focus().unsetColor().run();
                      setIsColorOpen(false);
                    }}
                    className="w-full h-7 rounded-md border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Remover cor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Alignment */}
        <div className="flex items-center gap-0.5 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().setTextAlign('left').run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Alinhar à esquerda"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().setTextAlign('center').run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Centralizar"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().setTextAlign('right').run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Alinhar à direita"
          >
            <AlignRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().setTextAlign('justify').run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Justificar"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        {/* Lists & Quote */}
        <div className="flex items-center gap-0.5 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Lista com marcadores"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Lista numerada"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Citação"
          >
            <TbBlockquote size={16} />
          </button>
        </div>

        {/* Insert */}
        <div className="flex items-center gap-0.5 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={openLinkDialog}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('link') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Inserir link"
          >
            <LinkIcon size={16} />
          </button>
          <button
            type="button"
            onClick={openImageDialog}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${editor.isActive('image') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            title="Inserir imagem"
          >
            <ImageIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if ((editor as any).openYoutubeDialog) {
                (editor as any).openYoutubeDialog((url: string) => {
                  (editor as any).chain().focus().setYoutubeVideo({ src: url }).run();
                });
              } else {
                const url = window.prompt('URL do vídeo do YouTube:');
                if (url) {
                  (editor as any).chain().focus().setYoutubeVideo({ src: url }).run();
                }
              }
            }}
            className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            title="Inserir YouTube"
          >
            <Youtube size={16} />
          </button>
          <button
            type="button"
            onClick={() => (editor as any).chain().focus().setHorizontalRule().run()}
            className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            title="Linha horizontal"
          >
            <Minus size={16} />
          </button>
        </div>
        
        {/* Fullscreen */}
        <div className="flex items-center gap-0.5 bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-0.5 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            title={isFullscreen ? 'Sair da tela cheia (Esc)' : 'Tela cheia (F11)'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      {/* Image Dialog */}
      <Dialog.Root open={isImageOpen} onOpenChange={setIsImageOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-950/50 z-[10000]" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-[10001] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-6"
            aria-describedby={imageDescriptionId}
          >
            <Dialog.Title className="text-lg font-semibold text-slate-100">
              Inserir imagem
            </Dialog.Title>
            <Dialog.Description id={imageDescriptionId} className="text-sm text-slate-400">
              Informe o endereço e o texto alternativo
            </Dialog.Description>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">URL da imagem</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    if (imageError) {
                      setImageError(null);
                    }
                  }}
                  placeholder="https://"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {imageError && (
                  <div className="text-xs text-rose-400">{imageError}</div>
                )}
                <button
                  type="button"
                  onClick={() => setIsAiImageOpen(true)}
                  className="mt-2 h-8 px-3 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Gerar com IA
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Texto alternativo</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(event) => setImageAlt(event.target.value)}
                  placeholder="Descrição da imagem"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-9 px-4 rounded-lg border border-slate-700 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  <X size={14} className="inline mr-1" />
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleImageSubmit}
                disabled={!imageUrl.trim()}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={14} className="inline mr-1" />
                Aplicar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      <AIImageModal
        isOpen={isAiImageOpen}
        onClose={() => setIsAiImageOpen(false)}
        onApplyImage={(url) => {
          setImageUrl(url);
          setImageError(null);
          setIsAiImageOpen(false);
        }}
        title="Gerar imagem"
      />
    </>
  );
};
