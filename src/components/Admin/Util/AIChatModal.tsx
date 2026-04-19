import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, BookOpen, Trash2 } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import {
  RiBriefcase4Line,
  RiArrowDownSLine, 
  RiExpandDiagonalFill, 
  RiCloseCircleLine, 
  RiMagicLine,
  RiMegaphoneLine, 
  RiRobot3Fill, 
  RiTextSnippet,
  RiLayoutGridLine,
  RiSendPlaneFill,
  RiLoader3Fill,
  RiErrorWarningLine,
  RiSparklingLine
} from 'react-icons/ri';
import { useAppSounds } from '../../../hooks/useAppSounds';
import { TypingAnimation } from '@/registry/magicui/typing-animation';
import { Particles } from '@/registry/magicui/particles';
import { MagicCard } from '@/registry/magicui/magic-card';
import { ShinyButton } from '@/registry/magicui/shiny-button';
import AnimatedShinyText from '@/registry/magicui/animated-shiny-text';
import { motion, AnimatePresence } from 'framer-motion';
import { MdShortText } from 'react-icons/md';
import { TbTextPlus } from 'react-icons/tb';
import { IoText } from 'react-icons/io5';
import { LuLetterText } from 'react-icons/lu';
import { BsTextParagraph } from 'react-icons/bs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isSegmented?: boolean;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  initialPrompt?: string;
  productName?: string;
  couponName?: string;
  discount?: string;
  storeName?: string;
  postTitle?: string;
}

const tones = [
  { id: 'normal', label: 'Normal', icon: RiRobot3Fill },
  { id: 'persuasive', label: 'Vendedor (Ofertas)', icon: RiMegaphoneLine },
  { id: 'fun', label: 'Divertido (Com Emojis)', icon: RiMagicLine },
  { id: 'serious', label: 'Profissional (Sem Emojis)', icon: RiBriefcase4Line },
];

const responseTypes = [
  { id: 'descricao-curta', label: 'Descricao curta', Icon: MdShortText },
  { id: 'descricao-longa', label: 'Descricao longa', Icon: TbTextPlus },
  { id: 'texto-normal', label: 'Texto normal', Icon: IoText },
  { id: 'texto-longo', label: 'Texto longo', Icon: LuLetterText },
  { id: 'paragrafos-bem-dividido', label: 'Sugestao de estrutura', Icon: BsTextParagraph },
  { id: 'titulo', label: 'Titulo Magnetico', Icon: RiTextSnippet },
  { id: 'resposta-inteligente', label: 'Resposta Inteligente', Icon: RiLayoutGridLine },
];

const SegmentedContent: React.FC<{
  content: string;
  onInsert: (text: string) => void;
  onCopy: (text: string) => void;
  copied: boolean;
}> = ({ content, onInsert, onCopy, copied }) => {
  const segments = content.split(/\n\s*\n|\n---\n/).filter(s => s.trim().length > 0);

  return (
    <div className="space-y-4">
      {segments.map((segment, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-pink-50 dark:bg-pink-950/20 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30 group/segment"
        >
          <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
            {segment}
          </div>
          <div className="mt-3 flex gap-2 opacity-0 group-hover/segment:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(segment)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-400 hover:text-pink-500 transition-colors border border-slate-200 dark:border-slate-600"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            <button
              onClick={() => onInsert(segment)}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase transition-all border border-emerald-200 dark:border-emerald-800"
            >
              <BookOpen size={12} /> Inserir Parte
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const IntelligentResponseContent: React.FC<{
  content: string;
  onCopy: (text: string) => void;
  onInsert: (text: string) => void;
}> = ({ content, onCopy, onInsert }) => {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const parseMarkdown = (text: string) => {
    // Parse markdown with support for bold, italic, and inline formatting
    const parseInline = (str: string) => {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      
      // Match **bold**, *italic*, and `code`
      const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
      let match;
      
      while ((match = regex.exec(str)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(str.substring(lastIndex, match.index));
        }
        
        // Add formatted text
        if (match[1]) {
          parts.push(<strong key={`bold-${match.index}`} className="font-bold text-slate-900 dark:text-white">{match[1]}</strong>);
        } else if (match[2]) {
          parts.push(<em key={`italic-${match.index}`} className="italic text-slate-800 dark:text-slate-100">{match[2]}</em>);
        } else if (match[3]) {
          parts.push(<code key={`code-${match.index}`} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700 dark:text-slate-200">{match[3]}</code>);
        }
        
        lastIndex = regex.lastIndex;
      }
      
      // Add remaining text
      if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
      }
      
      return parts.length > 0 ? parts : str;
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentSection: string[] = [];
    let currentSectionType: 'paragraph' | 'bullets' | null = null;
    let sectionKey = 0;

    const flushSection = () => {
      if (currentSection.length === 0) return;

      if (currentSectionType === 'bullets') {
        elements.push(
          <div key={`bullets-${sectionKey}`} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 group/section">
            <ul className="space-y-2">
              {currentSection.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-200 flex items-start gap-3">
                  <span className="text-pink-500 font-bold mt-0.5 flex-shrink-0">•</span>
                  <span className="flex-1">{parseInline(item)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopy(currentSection.join('\n'))}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-pink-500 transition-colors border border-slate-200 dark:border-slate-600"
                title="Copiar"
              >
                {copiedText === currentSection.join('\n') ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        );
      } else if (currentSectionType === 'paragraph') {
        const text = currentSection.join(' ');
        elements.push(
          <div key={`para-${sectionKey}`} className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 group/section">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{parseInline(text)}</p>
            <div className="mt-3 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopy(text)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-pink-500 transition-colors border border-slate-200 dark:border-slate-600"
                title="Copiar"
              >
                {copiedText === text ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        );
      }

      currentSection = [];
      currentSectionType = null;
      sectionKey++;
    };

    lines.forEach((line) => {
      if (line.startsWith('# ')) {
        flushSection();
        const title = line.replace(/^#+\s+/, '').trim();
        elements.push(
          <h1 key={`h1-${sectionKey}`} className="text-3xl font-black text-slate-900 dark:text-white mt-8 mb-4 pt-6 border-t-2 border-pink-500 tracking-tight">
            {parseInline(title)}
          </h1>
        );
        sectionKey++;
      } else if (line.startsWith('## ')) {
        flushSection();
        const title = line.replace(/^#+\s+/, '').trim();
        elements.push(
          <h2 key={`h2-${sectionKey}`} className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-6 mb-3">
            {parseInline(title)}
          </h2>
        );
        sectionKey++;
      } else if (line.startsWith('### ')) {
        flushSection();
        const title = line.replace(/^#+\s+/, '').trim();
        elements.push(
          <h3 key={`h3-${sectionKey}`} className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">
            {parseInline(title)}
          </h3>
        );
        sectionKey++;
      } else if (line.startsWith('- ')) {
        if (currentSectionType !== 'bullets') {
          flushSection();
          currentSectionType = 'bullets';
        }
        currentSection.push(line.replace(/^-\s+/, '').trim());
      } else if (line.trim() === '') {
        flushSection();
      } else {
        if (currentSectionType !== 'paragraph') {
          flushSection();
          currentSectionType = 'paragraph';
        }
        if (line.trim()) {
          currentSection.push(line.trim());
        }
      }
    });

    flushSection();
    return elements;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="space-y-4">
        {parseMarkdown(content)}
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => handleCopy(content)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
        >
          {copiedText === content ? <Check size={14} /> : <Copy size={14} />}
          {copiedText === content ? 'Copiado' : 'Copiar Tudo'}
        </button>
        <button
          onClick={() => onInsert(content)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
        >
          <BookOpen size={14} /> Inserir
        </button>
      </div>
    </motion.div>
  );
};

const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialPrompt = '',
  productName = '',
  couponName = '',
  discount = '',
  storeName = '',
  postTitle = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { playAiSuccess, playAiError, playClick, playMessageSent } = useAppSounds();
  const [tone, setTone] = useState('normal');
  const [responseType, setResponseType] = useState('texto-normal');
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [expandedText, setExpandedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const selectedResponseType = responseTypes.find(option => option.id === responseType);
  const selectedTone = tones.find(option => option.id === tone);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const expandedRef = useRef<HTMLTextAreaElement>(null);
  const hasSentInitialPrompt = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = React.useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    let finalMessageContent = textToSend;

    if (messages.length === 0) {
      const contextParts = [];
      if (postTitle) contextParts.push(`Titulo do Post: ${postTitle}`);
      if (productName) contextParts.push(`Produto: ${productName}`);
      if (couponName) contextParts.push(`Cupom: ${couponName}`);
      if (discount) contextParts.push(`Desconto: ${discount}`);
      if (storeName) contextParts.push(`Loja: ${storeName}`);

      if (contextParts.length > 0) {
        finalMessageContent = `Contexto:\n${contextParts.join('\n')}\n\n${textToSend}`;
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);
    playMessageSent();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalMessageContent,
          tone,
          responseSize: responseType
        }),
      });

      if (!response.ok) throw new Error('Falha na geracao');

      const data = await response.json();
      const isSegmented = responseType === 'resposta-inteligente' || responseType === 'titulo';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        isSegmented
      }]);

      playAiSuccess();
    } catch (error) {
      setErrorMessage('Erro ao processar sua solicitacao. Tente novamente.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, tive um erro ao processar sua solicitacao.'
      }]);
      playAiError();
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages.length, postTitle, productName, couponName, discount, storeName, tone, responseType, playMessageSent, playAiSuccess, playAiError]);

  useEffect(() => {
    if (isOpen) {
      if (initialPrompt && !hasSentInitialPrompt.current) {
        setInput(initialPrompt);
        hasSentInitialPrompt.current = true;
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (!isOpen) {
      hasSentInitialPrompt.current = false;
      setMessages([]);
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isInputExpanded) {
      setExpandedText(input);
      requestAnimationFrame(() => expandedRef.current?.focus());
    }
  }, [isInputExpanded, input]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setMessages([]);
    setShowClearConfirm(false);
    playClick();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <MagicCard className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[32px] border-none shadow-2xl overflow-hidden flex flex-col h-[640px] relative pointer-events-auto z-[10000]"
        gradientColor="#ec489920"
      >
        <Particles
          className="absolute inset-0 pointer-events-none"
          quantity={50}
          color="#ec4899"
        />

        {/* Header */}
        <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 ${isLoading ? 'animate-pulse' : ''}`}>
              <RiRobot3Fill size={20} className="text-white" />
            </div>
            <div>
              <AnimatedShinyText className="text-sm font-black tracking-tight">
                Lu Assistente
              </AnimatedShinyText>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                AI Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-all text-slate-400 hover:text-rose-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Options - Fixed Toolbar */}
        <div className="sticky top-0 px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-4 z-20 overflow-x-auto no-scrollbar">
          <Select.Root value={tone} onValueChange={setTone}>
            <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-pink-300 transition-all shadow-sm outline-none">
              {tones.find(t => t.id === tone)?.icon({ size: 14, className: "text-pink-500" })}
              <Select.Value />
              <RiArrowDownSLine size={12} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-[10001] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95">
                <Select.Viewport>
                  {tones.map(t => (
                    <Select.Item key={t.id} value={t.id} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 outline-none cursor-pointer">
                      <t.icon size={14} className="text-slate-400" />
                      <Select.ItemText>{t.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <Select.Root value={responseType} onValueChange={setResponseType}>
            <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-pink-300 transition-all shadow-sm outline-none">
              {selectedResponseType?.Icon ? <selectedResponseType.Icon size={14} className="text-pink-500" /> : <RiSparklingLine size={14} className="text-pink-500" />}
              <Select.Value />
              <RiArrowDownSLine size={12} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-[10001] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 max-h-[300px]">
                <Select.Viewport>
                  {responseTypes.map(opt => (
                    <Select.Item key={opt.id} value={opt.id} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 outline-none cursor-pointer">
                      <opt.Icon size={14} className="text-slate-400" />
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <button
            onClick={handleClear}
            className="ml-auto p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            title="Limpar Conversa"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale"
              >
                <div className="w-16 h-16 rounded-3xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 mb-4">
                  <RiSparklingLine size={32} />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                  Como posso brilhar hoje?
                </p>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg
                  ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-br from-pink-500 to-rose-600'}
                `}>
                  {msg.role === 'user' ? <RiBriefcase4Line size={14} className="text-slate-500" /> : <RiRobot3Fill size={14} className="text-white" />}
                </div>

                <div className={`group relative max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none'}
                  `}>
                    {msg.role === 'assistant' ? (
                      msg.isSegmented ? (
                        <IntelligentResponseContent
                          content={msg.content}
                          onInsert={onInsert}
                          onCopy={(text) => handleCopy(text, idx)}
                        />
                      ) : (
                        <TypingAnimation
                          text={msg.content}
                          duration={8}
                          className="text-sm leading-relaxed"
                        />
                      )
                    ) : (
                      msg.content
                    )}

                    {msg.role === 'assistant' && !msg.isSegmented && (
                      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-500 transition-all"
                        >
                          {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                          {copiedIndex === idx ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          onClick={() => onInsert(msg.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm shadow-emerald-500/10"
                        >
                          <BookOpen size={12} /> Inserir Tudo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center animate-pulse">
                <RiRobot3Fill size={14} className="text-white animate-spin" />
              </div>
              <div className="h-10 w-24 bg-slate-100 dark:bg-slate-900 rounded-3xl rounded-tl-none animate-pulse" />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Padronizado */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50 z-20">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 group/input">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Como posso te inspirar hoje?"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 rounded-lg border-2 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none resize-none text-sm min-h-[44px] max-h-[160px] dark:text-white shadow-sm"
                disabled={isLoading}
                rows={1}
              />
              <button
                onClick={() => setIsInputExpanded(true)}
                className="absolute right-3 top-3 text-slate-400 hover:text-pink-500 transition-all p-1"
              >
                <RiExpandDiagonalFill size={16} />
              </button>
            </div>

            <ShinyButton
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 flex-shrink-0"
            >
              {isLoading ? <RiLoader3Fill size={18} className="animate-spin" /> : selectedTone?.icon ? <selectedTone.icon size={18} /> : <RiSendPlaneFill size={18} />}
            </ShinyButton>
          </div>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-16 left-4 right-4 z-50 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-sm text-red-600 dark:text-red-300 shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                <RiErrorWarningLine size={18} className="text-red-500" />
              </div>
              <p className="flex-1 font-medium">{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Confirm Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowClearConfirm(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    Limpar Conversa?
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Isso apagará todo o histórico atual. Essa ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmClear}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all"
                    >
                      Sim, limpar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Expanded Input */}
        <AnimatePresence>
          {isInputExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Editor Magico</h3>
                <button onClick={() => setIsInputExpanded(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <textarea
                ref={expandedRef}
                value={expandedText}
                onChange={(e) => setExpandedText(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg leading-relaxed dark:text-white resize-none"
                placeholder="Escreva sua visao detalhada aqui..."
              />
              <div className="flex justify-end pt-6 gap-3">
                <button
                  onClick={() => setIsInputExpanded(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <ShinyButton
                  onClick={() => {
                    setInput(expandedText);
                    setIsInputExpanded(false);
                  }}
                  className="h-12 px-8 text-xs font-black uppercase tracking-widest"
                >
                  Aplicar Magia
                </ShinyButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MagicCard>
    </div>
  );
};

export default AIChatModal;