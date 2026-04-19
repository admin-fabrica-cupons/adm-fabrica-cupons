import React, { useState, useRef, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import {
  RiUserLine,
  RiFileCopyLine,
  RiCheckLine,
  RiDragMove2Line,
  RiExpandDiagonalFill,
  RiLayoutRightLine,
  RiLayoutRight2Line,
  RiArrowRightDownLine,
  RiAiGenerateText,
  RiCloseCircleLine,
  RiMegaphoneLine,
  RiBriefcase4Line,
  RiMagicLine,
  RiRobot3Line,
  RiImageAiLine,
  RiArrowDownSLine,
  RiLoader3Fill,
  RiTextSnippet,
  RiLayoutGridLine,
  RiSendPlaneFill,
  RiErrorWarningLine,
  RiSparklingLine
} from 'react-icons/ri';
import { LuBotMessageSquare } from 'react-icons/lu';
import { useAppSounds } from '../../hooks/useAppSounds';
import { AiOutlineClear } from 'react-icons/ai';
import { TypingAnimation } from '../magicui/typing-animation';
import { Particles } from '../magicui/particles';
import { MagicCard } from '../magicui/magic-card';
import { ShinyButton } from '@/registry/magicui/shiny-button';
import AnimatedShinyText from '../magicui/animated-shiny-text';
import { Groq, Qwen, Nova, Gemini, Mistral } from '@lobehub/icons';
import { MdShortText } from 'react-icons/md';
import { TbTextPlus } from 'react-icons/tb';
import { IoText } from 'react-icons/io5';
import { LuLetterText } from 'react-icons/lu';
import { BsTextParagraph } from 'react-icons/bs';
import { Copy, Check, BookOpen, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isSegmented?: boolean;
}

export interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'docked' | 'floating';
  onToggleMode?: () => void;
  onToggleAssistant?: () => void;
  assistantType?: 'text' | 'image';
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  inputText?: string;
  setInputText?: React.Dispatch<React.SetStateAction<string>>;
  tone?: string;
  setTone?: React.Dispatch<React.SetStateAction<string>>;
  replyTo?: Message | null;
  setReplyTo?: React.Dispatch<React.SetStateAction<Message | null>>;
}

const toneOptions = [
  { id: 'normal', label: 'Normal', icon: RiRobot3Line },
  { id: 'persuasive', label: 'Vendedor', icon: RiMegaphoneLine },
  { id: 'fun', label: 'Criativo', icon: RiMagicLine },
  { id: 'serious', label: 'Profissional', icon: RiBriefcase4Line },
];

const responseSizeOptions = [
  { id: 'descricao-curta', label: 'Descricao curta', Icon: MdShortText },
  { id: 'descricao-longa', label: 'Descricao longa', Icon: TbTextPlus },
  { id: 'texto-normal', label: 'Texto normal', Icon: IoText },
  { id: 'texto-longo', label: 'Texto longo', Icon: LuLetterText },
  { id: 'paragrafos-bem-dividido', label: 'Paragrafos bem dividido', Icon: BsTextParagraph },
  { id: 'titulo', label: 'Titulo', Icon: RiTextSnippet },
  { id: 'resposta-inteligente', label: 'Resposta Inteligente', Icon: RiLayoutGridLine },
];

const modelOptions = [
  { id: 'groq', label: 'Groq', Icon: Groq.Avatar },
  { id: 'qwen-safety', label: 'Qwen Safety', Icon: Qwen.Avatar },
  { id: 'nova-fast', label: 'Nova Fast', Icon: Nova.Avatar },
  { id: 'mistral', label: 'Mistral', Icon: Mistral.Avatar },
  { id: 'gemini-fast', label: 'Gemini Fast', Icon: Gemini.Avatar },
];

const RiAiGenerate2 = RiAiGenerateText;

const SegmentedContent: React.FC<{
  content: string;
  onCopy: (text: string) => void;
  onInsert?: (text: string) => void;
}> = ({ content, onCopy, onInsert }) => {
  const segments = content.split(/\n\s*\n|\n---\n/).filter(s => s.trim().length > 0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-3">
      {segments.map((segment, i) => {
        const titleMatch = segment.match(/^(.+?)[\n:]\s*([\s\S]*)$/);
        const title = titleMatch ? titleMatch[1].trim() : null;
        const body = titleMatch ? titleMatch[2].trim() : segment.trim();

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-pink-50/50 dark:bg-pink-950/20 rounded-xl p-3 border border-pink-100 dark:border-pink-900/30 group/seg"
          >
            {title && (
              <p className="text-[10px] font-black uppercase tracking-widest text-pink-600 mb-1">
                {title}
              </p>
            )}
            <div className="relative">
              <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap select-all cursor-text bg-white dark:bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700/50">
                {body || segment}
              </div>
              <div className="mt-2 flex gap-1.5 opacity-0 group-hover/seg:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(body || segment, i)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-slate-700 text-slate-400 hover:text-pink-500 transition-colors border border-slate-200 dark:border-slate-600 text-[10px] font-bold"
                >
                  {copiedIdx === i ? <Check size={10} /> : <Copy size={10} />}
                  {copiedIdx === i ? 'Copiado' : 'Copiar'}
                </button>
                {onInsert && (
                  <button
                    onClick={() => onInsert(body || segment)}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-200 dark:border-emerald-800"
                  >
                    <BookOpen size={10} /> Inserir
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const IntelligentResponseContent: React.FC<{
  content: string;
  onCopy: (text: string) => void;
  onInsert?: (text: string) => void;
}> = ({ content, onCopy, onInsert }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
        {onInsert && (
          <button
            onClick={() => onInsert(content)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
          >
            <BookOpen size={14} /> Inserir
          </button>
        )}
      </div>
    </motion.div>
  );
};

const AIChat: React.FC<AIChatProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'floating', 
  onToggleMode,
  onToggleAssistant,
  assistantType = 'text',
  messages: propsMessages,
  setMessages: propsSetMessages,
  inputText: propsInputText,
  setInputText: propsSetInputText,
  tone: propsTone,
  setTone: propsSetTone,
  replyTo: propsReplyTo,
  setReplyTo: propsSetReplyTo
}) => {
  const [internalMessages, setInternalMessages] = useState<Message[]>([]);
  const [internalInputText, setInternalInputText] = useState('');
  const [internalTone, setInternalTone] = useState('normal');
  const [responseSize, setResponseSize] = useState('texto-normal');
  const [model, setModel] = useState('groq');
  const [internalReplyTo, setInternalReplyTo] = useState<Message | null>(null);
  const [expandedAiText, setExpandedAiText] = useState<string | null>(null);
  const selectedModel = modelOptions.find(option => option.id === model);
  const selectedResponseSize = responseSizeOptions.find(option => option.id === responseSize);

  const isMessagesControlled = propsMessages !== undefined;
  const isInputTextControlled = propsInputText !== undefined;
  const isToneControlled = propsTone !== undefined;
  const isReplyToControlled = propsReplyTo !== undefined;

  const messages = isMessagesControlled ? propsMessages! : internalMessages;
  const setMessages = isMessagesControlled ? propsSetMessages! : setInternalMessages;
  const inputText = isInputTextControlled ? propsInputText! : internalInputText;
  const setInputText = isInputTextControlled ? propsSetInputText! : setInternalInputText;
  const tone = isToneControlled ? propsTone! : internalTone;
  const setTone = isToneControlled ? propsSetTone! : setInternalTone;
  const replyTo = isReplyToControlled ? propsReplyTo! : internalReplyTo;
  const setReplyTo = isReplyToControlled ? propsSetReplyTo! : setInternalReplyTo;

  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const { playMessageReceived, playMessageSent, playClick, playChatClose, playAiSuccess, playAiError } = useAppSounds();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length === 0 && !isMessagesControlled) {
      setMessages([
        {
          id: '1',
          text: 'Ola! Eu sou a Lu. Posso te ajudar a criar conteudo, gerar ideias para posts, escrever descricoes de produtos e muito mais. O que voce gostaria de fazer?',
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [expandedText, setExpandedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [textToInsert, setTextToInsert] = useState('');
  const [isSelectingInput, setIsSelectingInput] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [size, setSize] = useState({ width: 480, height: 620 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const expandedRef = useRef<HTMLTextAreaElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const userSelectBackup = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const defaultWidth = 480;
      const defaultHeight = 620;
      const x = Math.max(24, window.innerWidth - defaultWidth - 24);
      const y = 24;
      setPosition({ x, y });
      setSize({ width: defaultWidth, height: defaultHeight });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isInputExpanded) return;
    setExpandedText(inputText);
    requestAnimationFrame(() => {
      expandedRef.current?.focus();
    });
  }, [isInputExpanded, inputText]);

  useEffect(() => {
    if (isDragging || isResizing) {
      if (userSelectBackup.current === null) {
        userSelectBackup.current = document.body.style.userSelect;
      }
      document.body.style.userSelect = 'none';
      return () => {
        if (userSelectBackup.current !== null) {
          document.body.style.userSelect = userSelectBackup.current;
          userSelectBackup.current = null;
        }
      };
    }
  }, [isDragging, isResizing]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;
    const handleMove = (event: MouseEvent) => {
      if (isDragging) {
        const nextX = event.clientX - dragOffset.current.x;
        const nextY = event.clientY - dragOffset.current.y;
        const maxX = window.innerWidth - size.width - 12;
        const maxY = window.innerHeight - size.height - 12;
        setPosition({
          x: Math.min(Math.max(12, nextX), Math.max(12, maxX)),
          y: Math.min(Math.max(12, nextY), Math.max(12, maxY)),
        });
      }
      if (isResizing) {
        const nextWidth = resizeStart.current.width + (event.clientX - resizeStart.current.x);
        const nextHeight = resizeStart.current.height + (event.clientY - resizeStart.current.y);
        const maxWidth = window.innerWidth - position.x - 12;
        const maxHeight = window.innerHeight - position.y - 12;
        setSize({
          width: Math.min(Math.max(360, nextWidth), Math.max(360, maxWidth)),
          height: Math.min(Math.max(420, nextHeight), Math.max(420, maxHeight)),
        });
      }
    };
    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, isResizing, position.x, position.y, size.width, size.height]);

  const simulateTyping = (text: string, isSegmented = false) => {
    const aiMessageId = (Date.now() + 1).toString();
    
    setMessages((prev) => [...prev, {
      id: aiMessageId,
      text,
      sender: 'ai',
      timestamp: new Date(),
      isSegmented,
    }]);
    
    playMessageReceived();
    setIsTyping(false);
    setIsGenerating(false);
    setReplyTo(null);
  };

  const generateResponse = async (userMessage: string) => {
    setIsGenerating(true);
    setIsTyping(true);
    setErrorMessage(null);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'ai' ? 'assistant' : m.sender,
        content: m.text
      }));

      const apiMessages = [...conversationHistory, { role: 'user', content: userMessage }];

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          tone,
          replyTo: replyTo ? { text: replyTo.text, id: replyTo.id } : null,
          responseSize,
          model
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const replyText = data.reply || data.text || 'Desculpe, nao consegui gerar uma resposta.';
      const isSegmented = responseSize === 'resposta-inteligente' || responseSize === 'titulo';
      playAiSuccess();
      simulateTyping(replyText, isSegmented);

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      playAiError();
      
      // Adiciona mensagem de erro na conversa
      const errorMessageText = error.message || 'Erro ao processar sua solicitacao';
      const errorMessageInChat: Message = {
        id: (Date.now() + 1).toString(),
        text: `⚠️ ${errorMessageText}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessageInChat]);
      
      setErrorMessage(errorMessageText);
      setIsGenerating(false);
      setIsTyping(false);
      setReplyTo(null);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    playMessageSent();

    setTimeout(() => {
      generateResponse(inputText.trim());
    }, 500);
  };

  const handleCopy = async (message: Message) => {
    if (message.sender !== 'ai') return;
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      setCopiedMessageId(null);
    }
  };

  const handleStartDrag = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('select')) return;
    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    setIsDragging(true);
  };

  const handleStartResize = (event: React.MouseEvent) => {
    event.preventDefault();
    resizeStart.current = {
      x: event.clientX,
      y: event.clientY,
      width: size.width,
      height: size.height,
    };
    setIsResizing(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setMessages([
      {
        id: '1',
        text: 'Ola! Eu sou a Lu. Posso te ajudar a criar conteudo, gerar ideias para posts, escrever descricoes de produtos e muito mais. O que voce gostaria de fazer?',
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setShowClearConfirm(false);
    playChatClose();
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    playClick();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleInsert = (message: Message) => {
    if (message.sender !== 'ai') return;
    setTextToInsert(message.text);
    setIsSelectingInput(true);
    playClick();
    
    document.body.style.cursor = 'context-menu';
    
    const cleanup = () => {
      setIsSelectingInput(false);
      document.body.style.cursor = '';
      document.removeEventListener('click', handleInputClick, true);
      document.removeEventListener('keydown', handleEsc, true);
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
      }
    };

    const handleInputClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('.ai-insert-cancel-btn')) {
        cleanup();
        return;
      }

      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isInput && !target.closest('.ai-chat-selection')) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          if (target.isContentEditable) {
            target.focus();
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(message.text));
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              target.innerText += message.text;
            }
          } else {
            const input = target as HTMLInputElement | HTMLTextAreaElement;
            const start = input.selectionStart || input.value.length;
            const end = input.selectionEnd || input.value.length;
            
            if (typeof input.setRangeText === 'function') {
              input.setRangeText(message.text, start, end, 'end');
            } else {
              const text = input.value;
              input.value = text.substring(0, start) + message.text + text.substring(end);
              const newPos = start + message.text.length;
              input.setSelectionRange(newPos, newPos);
            }
            
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });
            input.dispatchEvent(inputEvent);
            input.dispatchEvent(changeEvent);
          }
          playClick();
          
          target.style.transition = 'box-shadow 0.3s';
          const originalShadow = target.style.boxShadow;
          target.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.5)';
          setTimeout(() => {
            target.style.boxShadow = originalShadow;
          }, 500);

        } catch (err) {
          console.error('Erro ao inserir texto:', err);
          navigator.clipboard.writeText(message.text);
        }
        
        cleanup();
      } else if (!target.closest('.ai-chat-selection') && !target.closest('.ai-insert-overlay')) {
        cleanup();
      }
    };
    
    document.addEventListener('keydown', handleEsc, true);
    setTimeout(() => {
      document.addEventListener('click', handleInputClick, true);
    }, 50);
  };

  const handleApplyExpanded = () => {
    setInputText(expandedText);
    setIsInputExpanded(false);
    playClick();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleCloseExpanded = () => {
    setIsInputExpanded(false);
    playClick();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  if (!isOpen) return null;

  const isDocked = mode === 'docked';

  // Renderizar overlay fora do MagicCard para evitar problemas com position: relative
  const overlayContent = isSelectingInput && (
    <div className="fixed inset-0 z-[2000] pointer-events-none ai-insert-overlay flex items-start justify-center pt-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/90 text-white px-6 py-3 rounded-full shadow-xl border border-white/20 backdrop-blur-md pointer-events-auto flex items-center gap-4"
      >
        <p className="text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Clique no campo onde deseja inserir...
        </p>
        <button 
          className="ai-insert-cancel-btn text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
          onClick={() => setIsSelectingInput(false)}
        >
          Cancelar (Esc)
        </button>
      </motion.div>
    </div>
  );

  const ChatContent = (
    <MagicCard
      className="flex flex-col h-full bg-white dark:bg-slate-950 border-none shadow-2xl relative overflow-hidden group/card"
      gradientColor="#ec489920"
    >
      <Particles
        className="absolute inset-0 pointer-events-none"
        quantity={60}
        staticity={50}
        color="#ec4899"
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-14 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-20"
        onMouseDown={!isDocked ? handleStartDrag : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg ${isGenerating ? 'animate-pulse' : ''}`}>
              <RiRobot3Line size={18} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <AnimatedShinyText className="text-sm font-bold tracking-tight">
            Lu Assistente
          </AnimatedShinyText>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleAssistant && (
            <button
              onClick={onToggleAssistant}
              className="p-2 rounded-xl text-slate-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all"
              title="Trocar Assistente"
            >
              {assistantType === 'text' ? <RiImageAiLine size={18} /> : <RiRobot3Line size={18} />}
            </button>
          )}
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
            >
              {isDocked ? <RiLayoutRightLine size={18} /> : <RiLayoutRight2Line size={18} />}
            </button>
          )}
          <button
            onClick={handleClear}
            className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            title="Limpar conversa"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Model & Tone Selector */}
      <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-4 z-20">
        <Select.Root value={model} onValueChange={setModel}>
          <Select.Trigger className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-500 transition-colors">
            {selectedModel?.Icon ? <selectedModel.Icon size={14} /> : <RiSparklingLine size={14} />}
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-[1001] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95">
              <Select.Viewport>
                {modelOptions.map(opt => (
                  <Select.Item key={opt.id} value={opt.id} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 outline-none cursor-pointer">
                    {opt.Icon && <opt.Icon size={16} />}
                    <Select.ItemText>{opt.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <Select.Root value={tone} onValueChange={setTone}>
          <Select.Trigger className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-500 transition-colors">
            {toneOptions.find(t => t.id === tone)?.icon({ size: 14, className: 'text-pink-500' })}
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-[1001] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95">
              <Select.Viewport>
                {toneOptions.map(opt => (
                  <Select.Item key={opt.id} value={opt.id} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 outline-none cursor-pointer"
                  >
                    <opt.icon size={14} className="text-pink-500" />
                    <Select.ItemText>{opt.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <Select.Root value={responseSize} onValueChange={setResponseSize}>
          <Select.Trigger className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-500 transition-colors">
            {selectedResponseSize?.Icon ? <selectedResponseSize.Icon size={14} className="text-pink-500" /> : <IoText size={14} className="text-pink-500" />}
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-[1001] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95">
              <Select.Viewport>
                {responseSizeOptions.map(opt => (
                  <Select.Item key={opt.id} value={opt.id} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 outline-none cursor-pointer"
                  >
                    <opt.Icon size={14} className="text-pink-500" />
                    <Select.ItemText>{opt.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar z-10">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 shadow-inner">
                <RiSparklingLine size={40} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Pronto para criar?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Descreva o que voce precisa abaixo.</p>
              </div>
            </motion.div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.sender === 'user' ? (
                  <div className="px-4 py-2.5 rounded-2xl text-sm shadow-sm bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-tr-none">
                    {msg.text}
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2.5 rounded-2xl text-sm shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none">
                      {msg.isSegmented ? (
                        <IntelligentResponseContent
                          content={msg.text}
                          onCopy={(text) => navigator.clipboard.writeText(text)}
                          onInsert={() => handleInsert(msg)}
                        />
                      ) : (
                        <TypingAnimation
                          text={msg.text}
                          duration={20}
                          className="text-sm leading-relaxed"
                        />
                      )}
                    </div>

                    {!msg.isSegmented && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleCopy(msg)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-400 hover:text-pink-500 transition-colors border border-slate-200 dark:border-slate-700 text-[10px] font-bold"
                        >
                          {copiedMessageId === msg.id ? <Check size={10} /> : <Copy size={10} />}
                          {copiedMessageId === msg.id ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          onClick={() => handleReply(msg)}
                          className="flex items-center gap-1 px-2 py-1 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-md text-[10px] font-bold border border-pink-200 dark:border-pink-800"
                        >
                          <LuBotMessageSquare size={10} /> Responder
                        </button>
                        <button
                          onClick={() => handleInsert(msg)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-200 dark:border-emerald-800"
                        >
                          <BookOpen size={10} /> Inserir
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Padronizado com AIImageChat */}
      <div className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800/50 z-20">
        {replyTo && (
          <div className="flex items-center justify-between bg-pink-50/80 dark:bg-pink-950/30 p-2 rounded-t-xl border-b border-pink-100/80 dark:border-pink-900/40 text-xs mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex items-center gap-2 truncate text-pink-900 dark:text-pink-100">
              <LuBotMessageSquare className="text-pink-600 flex-shrink-0" size={14} />
              <span className="font-semibold">Respondendo:</span>
              <span className="truncate max-w-[200px] italic opacity-80">&quot;{replyTo.text}&quot;</span>
            </div>
            <button 
              onClick={() => setReplyTo(null)}
              className="text-pink-400 hover:text-red-500 p-1 hover:bg-pink-100/80 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <RiCloseCircleLine size={16} />
            </button>
          </div>
        )}
        
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 group/input">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Como posso te inspirar hoje?"
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 rounded-lg border-2 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none resize-none text-sm min-h-[44px] max-h-[160px] dark:text-white shadow-sm"
              disabled={isGenerating}
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
            onClick={handleSend}
            disabled={isGenerating || !inputText.trim()}
            className="h-10 w-10 flex-shrink-0"
          >
            {isGenerating ? <RiLoader3Fill size={18} className="animate-spin" /> : selectedModel?.Icon ? <selectedModel.Icon size={18} /> : <RiSendPlaneFill size={18} />}
          </ShinyButton>
        </div>
      </div>

      {/* Error Notification - Posicionamento ajustado */}
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

      {/* Insert Overlay - Renderizado fora do MagicCard */}

      {/* Clear Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
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
                  <AiOutlineClear size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  Limpar Conversa?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Isso apagara todo o historico atual e o contexto da IA. Essa acao nao pode ser desfeita.
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
            className="absolute inset-0 z-[100] bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 flex flex-col p-6 rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">Editor Mágico</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Expanda sua criatividade</p>
              </div>
              <button 
                onClick={() => setIsInputExpanded(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={expandedRef}
              value={expandedText}
              onChange={(e) => setExpandedText(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none resize-none text-base leading-relaxed dark:text-white shadow-sm"
              placeholder="Escreva sua visão detalhada aqui... Deixe sua criatividade fluir!"
            />

            {/* Character count */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{expandedText.length} caracteres</span>
              <span>{expandedText.split(/\s+/).filter(w => w.length > 0).length} palavras</span>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-6 gap-3 border-t border-slate-200 dark:border-slate-700 mt-6">
              <button
                onClick={() => setIsInputExpanded(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <ShinyButton
                onClick={handleApplyExpanded}
                disabled={!expandedText.trim()}
                className="h-11 px-8 text-xs font-black uppercase tracking-widest"
              >
                Aplicar Magia ✨
              </ShinyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resizer */}
      {!isDocked && (
        <div
          className="absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize z-50 flex items-center justify-center text-slate-400 hover:text-pink-500 transition-colors"
          onMouseDown={handleStartResize}
        >
          <RiArrowRightDownLine size={18} />
        </div>
      )}
    </MagicCard>
  );

  if (isDocked) {
    return (
      <div className="relative w-full h-full">
        {ChatContent}
        {overlayContent}
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-[1000] ai-chat-selection pointer-events-auto"
        style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
      >
        {ChatContent}
      </motion.div>
      {overlayContent}
    </>
  );
};

export default AIChat;
