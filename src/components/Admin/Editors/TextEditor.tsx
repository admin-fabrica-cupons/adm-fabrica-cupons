import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered, Palette,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, ChevronDown, Check,
  Sun, Moon, Type
} from 'lucide-react';
import AIChatModal from '../Util/AIChatModal';
import InputWithClear from '../Util/InputWithClear';
import { RiRobot3Fill } from 'react-icons/ri';

// --- Interfaces ---
interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  heading: 'h1' | 'h2' | 'h3' | 'p';
  listType: 'ul' | 'ol' | null;
  color: string;
  underlineColor: string;
  underlineThickness: number;
}

interface TextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  postTitle?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  content,
  onContentChange,
  placeholder = 'Comece a escrever...',
  postTitle
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null); // Guardião da posição do cursor

  const [isInitialized, setIsInitialized] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [currentFormat, setCurrentFormat] = useState<FormatState>({
    bold: false, italic: false, underline: false,
    align: 'left', heading: 'p', listType: null,
    color: 'var(--editor-text)',
    underlineColor: 'var(--editor-primary)',
    underlineThickness: 2.5
  });

  const [showUnderlineSettings, setShowUnderlineSettings] = useState(false);
  const [showAIGeneration, setShowAIGeneration] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const colorPalettes = {
    light: [
      '#111827', '#1f2937', '#374151', '#6b7280', '#9ca3af',
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
      '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#ffffff'
    ],
    dark: [
      '#f9fafb', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280',
      '#f87171', '#fb923c', '#facc15', '#4ade80', '#34d399',
      '#60a5fa', '#818cf8', '#c084fc', '#f472b6', '#ffffff'
    ],
    universal: [
      'var(--editor-text)', 'var(--editor-text-muted)', 'var(--editor-gray-400)', 'var(--editor-gray-300)', 'var(--editor-gray-200)',
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
      '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#ffffff'
    ]
  };

  const thicknessOptions = [1, 2, 2.5, 3, 4, 5];

  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorTheme] = useState<'light' | 'dark' | 'universal'>('universal');
  const paletteColors = colorPalettes[colorTheme];

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = content || '<p><br></p>';
      setIsInitialized(true);
    }
  }, [content, isInitialized]);

  // Sincronização secundária caso o conteúdo mude externamente (como reset ou preview)
  useEffect(() => {
    if (editorRef.current && !showPreview && editorRef.current.innerHTML !== content && content !== '') {
      editorRef.current.innerHTML = content;
    }
  }, [showPreview, content]);

  // --- Lógica de Seleção (Essencial para o Link) ---
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    }
  };

  const updateFormatState = useCallback(() => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const anchorNode = selection.anchorNode;
    const element = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode as HTMLElement;
    if (!element || !editorRef.current.contains(element)) return;

    const bold = document.queryCommandState('bold');
    const italic = document.queryCommandState('italic');
    const color = document.queryCommandValue('foreColor');

    let align: FormatState['align'] = 'left';
    const alignElement = element.closest('[style*="text-align"]') as HTMLElement;
    if (alignElement) align = alignElement.style.textAlign as FormatState['align'];

    let listType: FormatState['listType'] = null;
    if (element.closest('ul')) listType = 'ul';
    else if (element.closest('ol')) listType = 'ol';

    let heading: FormatState['heading'] = 'p';
    const headingEl = element.closest('h1, h2, h3, p');
    if (headingEl) heading = headingEl.tagName.toLowerCase() as FormatState['heading'];

    // Detecção de underline customizado
    const underlineEl = element.closest('.modern-underline') as HTMLElement;
    const underline = !!underlineEl;
    const underlineColor = underlineEl ? underlineEl.style.borderBottomColor : currentFormat.underlineColor;
    const underlineThickness = underlineEl ? parseFloat(underlineEl.style.borderBottomWidth) : currentFormat.underlineThickness;

    setCurrentFormat(prev => ({
      ...prev, bold, italic, underline, align: align || 'left', heading, listType, color,
      underlineColor: underlineColor || prev.underlineColor,
      underlineThickness: underlineThickness || prev.underlineThickness
    }));
  }, [currentFormat.underlineColor, currentFormat.underlineThickness]);

  const insertHtmlAtSelection = (html: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const execCompat = (command: string, value?: string) => {
    const exec = (document as any).execCommand;
    if (typeof exec !== 'function') return;
    exec.call(document, command, false, value);
  };

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    if (command === 'customUnderline') {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const span = `<span class="modern-underline" style="border-bottom: ${currentFormat.underlineThickness}px solid ${currentFormat.underlineColor}; padding-bottom: 1px; display: inline-block;">${selection.toString()}</span>`;
        insertHtmlAtSelection(span);
      } else {
        execCompat('underline');
      }
    } else if (command === 'insertHTML' && value) {
      insertHtmlAtSelection(value);
    } else {
      execCompat(command, value);
    }
    updateFormatState();
    onContentChange(editorRef.current?.innerHTML || '');
  };

  const handleInsertLink = () => {
    if (!editorRef.current) return;

    // 1. Volta o foco e restaura o cursor exatamente onde estava
    editorRef.current.focus();
    restoreSelection();

    // 2. Se houver texto selecionado, usa-o como texto do link
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';

    // 3. Se o usuário digitou texto personalizado, usa-o; senão, usa o texto selecionado
    const finalText = linkText.trim() || selectedText;

    // 4. Se não houver texto, cria um link simples
    if (!finalText) {
      if (linkUrl) {
        execCommand('createLink', linkUrl);
      }
    } else {
      // 5. Cria o HTML do link com o texto final
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${finalText}</a>`;
      execCommand('insertHTML', linkHtml);
    }

    // 6. Limpa e fecha
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const ToolbarButton = ({ active, onClick, children, title, className = "" }: any) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${active ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'} ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-visible">

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md p-1 mr-1">
          <button onMouseDown={e => e.preventDefault()} onClick={() => setShowPreview(false)} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${!showPreview ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Edit</button>
          <button onMouseDown={e => e.preventDefault()} onClick={() => setShowPreview(true)} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${showPreview ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Preview</button>
        </div>

        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md p-1 mr-1">
          <button onMouseDown={e => e.preventDefault()} onClick={() => setEditorTheme('light')} title="Ver tema claro" className={`p-1 rounded transition-all ${editorTheme === 'light' ? 'bg-white shadow text-orange-500' : 'text-gray-500'}`}><Sun size={12} /></button>
          <button onMouseDown={e => e.preventDefault()} onClick={() => setEditorTheme('dark')} title="Ver tema escuro" className={`p-1 rounded transition-all ${editorTheme === 'dark' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}><Moon size={12} /></button>
        </div>

        {/* Títulos */}
        <div className="relative">
          <button onMouseDown={e => e.preventDefault()} onClick={() => setShowHeadingMenu(!showHeadingMenu)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold border dark:border-gray-600 dark:text-white min-w-[120px]">
            <span className="flex-1 text-left uppercase text-[11px] tracking-wider">
              {currentFormat.heading === 'p' ? 'Normal' : `Título ${currentFormat.heading.slice(1)}`}
            </span>
            <ChevronDown size={14} />
          </button>
          {showHeadingMenu && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-2 w-48 overflow-hidden">
              {['p', 'h1', 'h2', 'h3'].map((tag) => (
                <button key={tag} onMouseDown={e => e.preventDefault()} onClick={() => { execCommand('formatBlock', tag.toUpperCase()); setShowHeadingMenu(false); }} className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between ${currentFormat.heading === tag ? 'text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                  <span className={tag === 'h1' ? 'text-xl' : tag === 'h2' ? 'text-lg' : 'text-base'}>{tag === 'p' ? 'Parágrafo' : `Título ${tag.slice(1)}`}</span>
                  {currentFormat.heading === tag && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton active={currentFormat.bold} onClick={() => execCommand('bold')} title="Negrito"><Bold size={18} /></ToolbarButton>
        <ToolbarButton active={currentFormat.italic} onClick={() => execCommand('italic')} title="Itálico"><Italic size={18} /></ToolbarButton>

        {/* Underline Customizado */}
        <div className="relative flex items-center">
          <ToolbarButton
            active={currentFormat.underline}
            onClick={() => execCommand('customUnderline')}
            title="Sublinhado Moderno"
          >
            <div className="relative">
              <Underline size={18} />
              <div className="absolute -bottom-1 left-0 right-0 h-0.5" style={{ backgroundColor: currentFormat.underlineColor }} />
            </div>
          </ToolbarButton>
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => setShowUnderlineSettings(!showUnderlineSettings)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {showUnderlineSettings && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Ajustes do Sublinhado</h4>

              <div className="space-y-4">
                {/* Espessura */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-2 block">ESPESSURA: {currentFormat.underlineThickness}px</label>
                  <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                    {thicknessOptions.map(t => (
                      <button
                        key={t}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setCurrentFormat(prev => ({ ...prev, underlineThickness: t }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFormat.underlineThickness === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cor do Sublinhado */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-2 block">COR DO TRAÇO</label>
                  <div className="grid grid-cols-5 gap-2">
                    {paletteColors.map(c => (
                      <button
                        key={c}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setCurrentFormat(prev => ({ ...prev, underlineColor: c }))}
                        className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-110 flex items-center justify-center"
                        style={{ backgroundColor: c.startsWith('var') ? `var(${c.match(/var\(([^)]+)\)/)?.[1] || ''})` : c }}
                      >
                        {currentFormat.underlineColor === c && <Check size={12} className="text-white drop-shadow-sm" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Cores */}
        {/* Cores */}
<div className="relative">
  <ToolbarButton 
    active={showColorPicker} 
    onClick={() => setShowColorPicker(!showColorPicker)} 
    title="Cor"
  >
    <div className="flex flex-col items-center">
      <Palette size={18} />
      {/* Barra de cor abaixo do ícone para feedback visual */}
      <div 
        className="w-4 h-1 mt-0.5 rounded-full border border-black/10" 
        style={{ backgroundColor: currentFormat.color }} 
      />
    </div>
  </ToolbarButton>

  {showColorPicker && (
    <div className="absolute top-full left-0 mt-2 z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 w-60 animate-in fade-in slide-in-from-top-2">
      <div className="flex flex-col gap-2 items-center justify-between mb-3">
        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Escolha a Cor</h4>
        <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 p-1">
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => setColorTheme('light')}
            className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-full transition ${colorTheme === 'light' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-300'}`}
          >
            Claro
          </button>
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => setColorTheme('dark')}
            className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-full transition ${colorTheme === 'dark' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-300'}`}
          >
            Escuro
          </button>
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => setColorTheme('universal')}
            className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-full transition ${colorTheme === 'universal' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-300'}`}
          >
            Ambos
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2.5 mb-4">
        {paletteColors.map(c => {
          const isVariable = c.startsWith('var');
          
          // Resolve a cor para o preview do botão
          const resolveColor = (color: string) => {
            if (!color.startsWith('var')) return color;
            const map: any = {
              'var(--editor-text)': editorTheme === 'light' ? '#111827' : '#ffffff',
              'var(--editor-text-muted)': editorTheme === 'light' ? '#4b5563' : '#f3f4f6',
              'var(--editor-gray-400)': editorTheme === 'light' ? '#9ca3af' : '#d1d5db',
              'var(--editor-gray-300)': editorTheme === 'light' ? '#d1d5db' : '#9ca3af',
              'var(--editor-gray-200)': editorTheme === 'light' ? '#e5e7eb' : '#4b5563',
            };
            return map[color] || color;
          };

          const finalColor = resolveColor(c);

          return (
            <button
              key={c}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { 
                execCommand('foreColor', finalColor); 
                setShowColorPicker(false); 
              }}
              className="group relative w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm transition-transform hover:scale-110 active:scale-95 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: finalColor }}
            >
              {/* Texto AUTO agora é apenas um overlay transparente */}
              {isVariable && (
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black leading-none text-white mix-blend-difference pointer-events-none opacity-50 group-hover:opacity-100">
                  AUTO
                </span>
              )}
              
              {/* Check de seleção com sombra para visibilidade */}
              {currentFormat.color.toLowerCase() === finalColor.toLowerCase() && (
                <Check size={12} className="z-10 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Input de cor personalizada corrigido */}
      <label className="relative flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl cursor-pointer text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Palette size={14} className="text-gray-400" />
        <span>Personalizada</span>
        <input 
          type="color" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => { 
            execCommand('foreColor', e.target.value); 
            setShowColorPicker(false); 
          }} 
        />
      </label>
    </div>
  )}
</div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton active={currentFormat.align === 'left'} onClick={() => execCommand('justifyLeft')} title="Alinhar à esquerda"><AlignLeft size={18} /></ToolbarButton>
        <ToolbarButton active={currentFormat.align === 'center'} onClick={() => execCommand('justifyCenter')} title="Centralizar"><AlignCenter size={18} /></ToolbarButton>
        <ToolbarButton active={currentFormat.align === 'right'} onClick={() => execCommand('justifyRight')} title="Alinhar à direita"><AlignRight size={18} /></ToolbarButton>
        <ToolbarButton active={currentFormat.align === 'justify'} onClick={() => execCommand('justifyFull')} title="Justificar"><AlignJustify size={18} /></ToolbarButton>

        <ToolbarButton active={currentFormat.listType === 'ul'} onClick={() => execCommand('insertUnorderedList')}><List size={18} /></ToolbarButton>
        <ToolbarButton active={currentFormat.listType === 'ol'} onClick={() => execCommand('insertOrderedList')}><ListOrdered size={18} /></ToolbarButton>

        <ToolbarButton onClick={() => { saveSelection(); setShowLinkDialog(true); }} title="Link"><LinkIcon size={18} /></ToolbarButton>
        <ToolbarButton onClick={() => execCommand('removeFormat')} title="Limpar"><Trash2 size={18} /></ToolbarButton>

        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => { saveSelection(); setShowAIGeneration(true); }}
          className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 transition-all group ai-button"
          title="Gerar texto com IA"
        >
          <RiRobot3Fill size={16} className="ai-bot-icon text-white" />
          <span>Texto de IA</span>
        </button>
      </div>

      {/* EDITOR AREA */}
      <div className={`relative min-h-[350px] transition-colors duration-500 rounded-b-xl editor-theme-${editorTheme} ${editorTheme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div
          ref={editorRef}
          contentEditable
          onInput={() => onContentChange(editorRef.current?.innerHTML || '')}
          onKeyUp={updateFormatState}
          onMouseUp={updateFormatState}
          className={`editor-content p-8 outline-none min-h-[350px] ${showPreview ? 'hidden' : 'block'}`}
          data-placeholder={placeholder}
        />

        {showPreview && (
          <div
            className="editor-content p-8 animate-in fade-in duration-300"
            dangerouslySetInnerHTML={{ __html: content || '<p><br></p>' }}
          />
        )}
      </div>

      {/* LINK DIALOG */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Adicionar Hyperlink</h3>
            <div className="space-y-4">
              <InputWithClear
                autoFocus
                type="text"
                className="w-full p-3 border dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all hover:border-gray-300 dark:hover:border-slate-600"
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onClear={() => setLinkUrl('')}
              />
              <InputWithClear
                type="text"
                className="w-full p-3 border dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all hover:border-gray-300 dark:hover:border-slate-600"
                placeholder="Texto para exibir (opcional)"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
                onClear={() => setLinkText('')}
              />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowLinkDialog(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleInsertLink} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors">Inserir Link</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS DE TÍTULOS E LISTAS */}
      <style>{`
        .editor-content:empty:before { content: attr(data-placeholder); color: #9ca3af; font-style: italic; }
        .editor-content h1 { font-size: 2.5rem !important; font-weight: 800; margin: 1rem 0; line-height: 1.2; }
        .editor-content h2 { font-size: 1.8rem !important; font-weight: 700; margin: 0.8rem 0; }
        .editor-content h3 { font-size: 1.4rem !important; font-weight: 600; margin: 0.6rem 0; }
        .editor-content ul { list-style-type: disc !important; padding-left: 2rem !important; margin: 1rem 0; }
        .editor-content ol { list-style-type: decimal !important; padding-left: 2rem !important; margin: 1rem 0; }
        .editor-content li { display: list-item; margin-bottom: 0.4rem; }
        .editor-content a { color: #2563eb; text-decoration: underline; pointer-events: auto; }
        
        /* Sublinhado Moderno e Animado - Estilo Base */
        .modern-underline {
          text-decoration: none !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: modern-underline-pulse 2.5s infinite ease-in-out;
        }

        .modern-underline:hover {
          filter: drop-shadow(0 0 4px rgba(0,0,0,0.1));
          transform: translateY(-1px);
        }

        /* Sistema de Cores Adaptativas */
        .editor-theme-light {
          --editor-text: #111827;
          --editor-text-muted: #4b5563;
          --editor-gray-400: #9ca3af;
          --editor-gray-300: #d1d5db;
          --editor-gray-200: #e5e7eb;
          --editor-primary: #2563eb;
        }

        .editor-theme-dark {
          --editor-text: #ffffff;
          --editor-text-muted: #f3f4f6;
          --editor-gray-400: #d1d5db;
          --editor-gray-300: #9ca3af;
          --editor-gray-200: #4b5563;
          --editor-primary: #60a5fa;
        }

        .editor-content { color: var(--editor-text); }
        .editor-content a { color: var(--editor-primary); }

        /* Correção automática para prevenir texto invisível */
        .editor-theme-dark .editor-content [style*="color: rgb(0, 0, 0)"],
        .editor-theme-dark .editor-content [style*="color: #000"],
        .editor-theme-dark .editor-content [style*="color: #000000"] {
          color: var(--editor-text) !important;
        }

        .editor-theme-light .editor-content [style*="color: rgb(255, 255, 255)"],
        .editor-theme-light .editor-content [style*="color: #ffffff"],
        .editor-theme-light .editor-content [style*="color: white"],
        .editor-theme-light .editor-content [style*="color: #fff"] {
          color: var(--editor-text) !important;
        }

        /* AI Button Glow Effect */
        .ai-button {
          position: relative;
          overflow: visible;
        }
        
        .ai-button:hover .ai-bot-icon {
          filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.7)) drop-shadow(0 0 16px rgba(147, 51, 234, 0.5));
          animation: ai-glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes ai-glow {
          from {
            filter: drop-shadow(0 0 4px rgba(236, 72, 153, 0.5)) drop-shadow(0 0 10px rgba(147, 51, 234, 0.35));
          }
          to {
            filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.9)) drop-shadow(0 0 22px rgba(147, 51, 234, 0.6));
          }
        }
      `}</style>

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={showAIGeneration}
        onClose={() => setShowAIGeneration(false)}
        onInsert={(text) => {
          execCommand('insertHTML', text);
          setShowAIGeneration(false);
        }}
        initialPrompt={aiPrompt}
        postTitle={postTitle}
      />
    </div>
  );
};

export default TextEditor;
