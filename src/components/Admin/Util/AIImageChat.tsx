import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import * as Select from '@radix-ui/react-select';
import {
  RiImageAiLine,
  RiImageAiFill,
  RiImageEditLine,
  RiFolderImageFill,
  RiRobot3Line,
  RiMagicLine,
  RiLayoutRightLine,
  RiLayoutRight2Line,
  RiArrowRightDownLine,
  RiArrowDownSLine,
  RiCloseLine,
  RiFileCopyLine,
  RiCheckLine,
  RiDownloadCloud2Line,
  RiErrorWarningLine,
  RiInformationLine,
  RiLoader3Fill,
  RiSendPlaneFill,
  RiCloseCircleLine,
} from 'react-icons/ri';
import { X } from 'lucide-react';
import { useAppSounds } from '../../../hooks/useAppSounds';
import { Particles } from '@/registry/magicui/particles';
import { MagicCard } from '@/registry/magicui/magic-card';
import { ShinyButton } from '@/registry/magicui/shiny-button';
import AnimatedShinyText from '@/registry/magicui/animated-shiny-text';
import HyperText from '@/registry/magicui/hyper-text';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenAI } from '@lobehub/icons';

type ImageMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
  savedUrl?: string;
};

interface AIImageChatProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImage?: (url: string) => void;
  onToggleAssistant?: () => void;
  assistantType?: 'text' | 'image';
  mode?: 'docked' | 'floating';
  onToggleMode?: () => void;
  variant?: 'modal' | 'panel';
  title?: string;
}

const modelOptions = [
  { id: 'flux', label: 'Flux', Icon: RiImageAiLine },
  { id: 'zimage', label: 'Z-Image', Icon: RiImageAiFill },
  { id: 'gptimage', label: 'GPT Image', Icon: OpenAI.Avatar }
];

const generatingMessages = [
  'Sua imagem está quase pronta...',
  'Gerando sua obra de arte',
  'Criando algo incrível',
  'Processando sua visão',
  'Quase lá...'
];

const toneOptions = [
  { id: 'none', label: 'Sem tom' },
  { id: 'cinematic', label: 'Cinemático' },
  { id: 'minimal', label: 'Minimalista' },
  { id: 'vibrant', label: 'Vibrante' },
  { id: 'neon', label: 'Neon' }
];

const AIImageChat: React.FC<AIImageChatProps> = ({
  isOpen,
  onClose,
  onApplyImage,
  onToggleAssistant,
  assistantType = 'image',
  mode,
  onToggleMode,
  variant = 'modal',
  title = 'Lu Image'
}) => {
  const { playClick, playMessageSent, playAiSuccess, playAiError } = useAppSounds();
  const [messages, setMessages] = useState<ImageMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState(modelOptions[0].id);
  const [tone, setTone] = useState(toneOptions[0].id);
  const selectedModel = modelOptions.find(option => option.id === model);
  const [pendingImageId, setPendingImageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [currentGeneratingMessage, setCurrentGeneratingMessage] = useState('');
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

  const [displayMode, setDisplayMode] = useState<'modal' | 'panel' | 'floating'>(variant === 'panel' ? 'panel' : 'modal');
  const resolvedMode = mode ? (mode === 'docked' ? 'panel' : 'floating') : displayMode;
  const isFloating = resolvedMode === 'floating';

  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [size, setSize] = useState({ width: 480, height: 620 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const userSelectBackup = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isFloating) {
      const defaultWidth = 480;
      const defaultHeight = 620;
      const x = Math.max(24, window.innerWidth - defaultWidth - 24);
      const y = 24;
      setPosition({ x, y });
      setSize({ width: defaultWidth, height: defaultHeight });
    }
  }, [isOpen, isFloating]);

  // Simular progresso de geração
  useEffect(() => {
    if (!isGenerating) {
      setGeneratingProgress(0);
      setCurrentGeneratingMessage('');
      return;
    }

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;
      setGeneratingProgress(progress);
      
      const messageIndex = Math.floor((progress / 100) * (generatingMessages.length - 1));
      setCurrentGeneratingMessage(generatingMessages[messageIndex]);
    }, 800);

    return () => clearInterval(progressInterval);
  }, [isGenerating]);

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
        setPosition({
          x: Math.min(Math.max(12, nextX), window.innerWidth - size.width - 12),
          y: Math.min(Math.max(12, nextY), window.innerHeight - size.height - 12),
        });
      }
      if (isResizing) {
        const nextWidth = resizeStart.current.width + (event.clientX - resizeStart.current.x);
        const nextHeight = resizeStart.current.height + (event.clientY - resizeStart.current.y);
        setSize({
          width: Math.max(360, nextWidth),
          height: Math.max(420, nextHeight),
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
  }, [isDragging, isResizing, size.width, size.height]);

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

  const generateImage = async (promptText: string) => {
    if (!promptText || isGenerating) return;

    console.log('AIImageChat: generate:start', { prompt: promptText, model, tone });
    
    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratingProgress(0);
    const newMessageId = Date.now().toString();
    const userMessageId = Date.now().toString() + '_user';
    setPendingImageId(newMessageId);

    const userMessage: ImageMessage = { id: userMessageId, role: 'user', text: promptText };
    const aiMessage: ImageMessage = { id: newMessageId, role: 'assistant', text: 'Gerando...', imageUrl: '' };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');
    playMessageSent();

    try {
      // 1. Traduzir
      const translateResponse = await fetch('/api/admin/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'translate', 
          prompt: promptText,
          tone
        })
      });

      if (!translateResponse.ok) {
        const errorData = await translateResponse.json().catch(() => ({}));
        // Se a tradução falhar, usar o prompt original
        if (errorData.error && errorData.error.includes('404')) {
          console.warn('AIImageChat: translation-failed, using original prompt');
          const translateData = await translateResponse.json();
          const translatedPrompt = translateData.prompt || promptText;
          setMessages(prev => prev.map(m => m.id === newMessageId ? { ...m, text: translatedPrompt } : m));
          // Continue com a geração da imagem usando o prompt original
          const generateResponse = await fetch('/api/admin/ai-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'generate', 
              prompt: translatedPrompt,
              model
            })
          });
          let generateData;
          try {
            generateData = await generateResponse.json();
          } catch (parseError) {
            console.error('AIImageChat: generate:parse-error', parseError);
            throw new Error('Resposta inválida da API de geração');
          }
          
          console.log('AIImageChat: generate:response', { 
            ok: generateResponse.ok, 
            status: generateResponse.status,
            hasImageUrl: !!generateData?.imageUrl,
            imageUrlLength: generateData?.imageUrl?.length,
            imageUrlPrefix: generateData?.imageUrl?.substring(0, 80)
          });
          
          if (!generateResponse.ok) {
            const errorMsg = generateData?.error || `Erro ${generateResponse.status} na geração`;
            console.error('AIImageChat: generate:not-ok', { errorMsg, generateData });
            throw new Error(errorMsg);
          }
          
          if (!generateData?.imageUrl) {
            console.error('AIImageChat: generate:no-url', { generateData });
            throw new Error('Nenhuma URL de imagem retornada pela API');
          }

          // Validar se a URL é válida
          try {
            new URL(generateData.imageUrl);
          } catch (urlError) {
            console.error('AIImageChat: generate:invalid-url', { url: generateData.imageUrl });
            throw new Error('URL inválida retornada pela API');
          }
          
          console.log('AIImageChat: generate:success', { 
            imageUrl: generateData.imageUrl,
            modelUsed: generateData.modelUsed,
            fallback: generateData.fallback
          });

          // Substituir a mensagem com a imagem gerada
          setMessages(prev => prev.map(m => 
            m.id === newMessageId 
              ? { ...m, imageUrl: generateData.imageUrl } 
              : m
          ));
          
          playAiSuccess();
          setGeneratingProgress(100);
          
        } else {
          throw new Error(errorData.error || `Erro na tradução: ${translateResponse.status}`);
        }
      }

      const translateData = await translateResponse.json();
      const translatedPrompt = translateData.prompt;
      
      console.log('AIImageChat: translate:success', { translatedPrompt });
      // Substituir a mensagem de IA com o prompt traduzido
      setMessages(prev => prev.map(m => m.id === newMessageId ? { ...m, text: translatedPrompt } : m));

      // 2. Gerar Imagem
      console.log('AIImageChat: generate:request', { prompt: translatedPrompt, model });
      const generateResponse = await fetch('/api/admin/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generate', 
          prompt: translatedPrompt,
          model
        })
      });

      let generateData;
      try {
        generateData = await generateResponse.json();
      } catch (parseError) {
        console.error('AIImageChat: generate:parse-error', parseError);
        throw new Error('Resposta inválida da API de geração');
      }
      
      console.log('AIImageChat: generate:response', { 
        ok: generateResponse.ok, 
        status: generateResponse.status,
        hasImageUrl: !!generateData?.imageUrl,
        imageUrlLength: generateData?.imageUrl?.length,
        imageUrlPrefix: generateData?.imageUrl?.substring(0, 80)
      });
      
      if (!generateResponse.ok) {
        const errorMsg = generateData?.error || `Erro ${generateResponse.status} na geração`;
        console.error('AIImageChat: generate:not-ok', { errorMsg, generateData });
        throw new Error(errorMsg);
      }
      
      if (!generateData?.imageUrl) {
        console.error('AIImageChat: generate:no-url', { generateData });
        throw new Error('Nenhuma URL de imagem retornada pela API');
      }

      // Validar se a URL é válida
      try {
        new URL(generateData.imageUrl);
      } catch (urlError) {
        console.error('AIImageChat: generate:invalid-url', { url: generateData.imageUrl });
        throw new Error('URL inválida retornada pela API');
      }
      
      console.log('AIImageChat: generate:success', { 
        imageUrl: generateData.imageUrl,
        modelUsed: generateData.modelUsed,
        fallback: generateData.fallback
      });

      // Substituir a mensagem com a imagem gerada
      setMessages(prev => prev.map(m => 
        m.id === newMessageId 
          ? { ...m, imageUrl: generateData.imageUrl } 
          : m
      ));
      
      playAiSuccess();
      setGeneratingProgress(100);
      
    } catch (error: any) {
      console.error('AIImageChat: generate:error', error);
      
      // Remover a mensagem do usuário e a mensagem de IA, e adicionar apenas a mensagem de erro
      const errorMessageText = error.message || 'Erro ao gerar imagem';
      const errorMessageInChat: ImageMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        text: `⚠️ ${errorMessageText}`,
        imageUrl: ''
      };
      setMessages(prev => [...prev.filter(m => m.id !== userMessageId && m.id !== newMessageId), errorMessageInChat]);
      
      setErrorMessage(errorMessageText);
      playAiError();
    } finally {
      setIsGenerating(false);
      setPendingImageId(null);
      setGeneratingProgress(0);
    }
  };

  const handleSend = () => generateImage(input.trim());

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (message: ImageMessage) => {
    if (!message.imageUrl) return;
    setSavingId(message.id);
    try {
      const response = await fetch('/api/admin/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          imageUrl: message.imageUrl,
          fileName: message.text.slice(0, 40)
        })
      });
      if (!response.ok) throw new Error('Falha ao salvar imagem');
      const data = await response.json();
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, savedUrl: data.url } : m));
      if (data.url && onApplyImage) onApplyImage(data.url);
      playAiSuccess();
    } catch (error: any) {
      setErrorMessage(error.message);
      playAiError();
    } finally {
      setSavingId(null);
    }
  };

  if (!isOpen) return null;

  const ChatContent = (
    <MagicCard
      className="flex flex-col h-full bg-white dark:bg-slate-950 border-none shadow-2xl relative overflow-hidden group/card"
      gradientColor="#10b98120"
    >
      <Particles
        className="absolute inset-0 pointer-events-none"
        quantity={60}
        staticity={50}
        color="#10b981"
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 z-20"
        onMouseDown={!isFloating ? undefined : handleStartDrag}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg ${isGenerating ? 'animate-pulse' : ''}`}>
              <RiRobot3Line size={18} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <AnimatedShinyText className="text-sm font-bold tracking-tight">
            {title}
          </AnimatedShinyText>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleAssistant && (
            <button
              onClick={onToggleAssistant}
              className="p-2 rounded-xl text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
              title="Trocar Assistente"
            >
              {assistantType === 'image' ? <RiRobot3Line size={18} /> : <RiImageAiLine size={18} />}
            </button>
          )}
          <button
            onClick={() => {
              if (onToggleMode) onToggleMode();
              else setDisplayMode(prev => prev === 'floating' ? (variant === 'panel' ? 'panel' : 'modal') : 'floating');
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
          >
            {isFloating ? <RiLayoutRightLine size={18} /> : <RiLayoutRight2Line size={18} />}
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
          <Select.Trigger className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
            {selectedModel?.Icon ? <selectedModel.Icon size={14} /> : <RiImageAiLine size={14} />}
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content 
              className="z-[10002] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95"
              position="popper"
              side="bottom"
              align="start"
              sideOffset={5}
            >
              <Select.Viewport>
                {modelOptions.map(opt => (
                  <Select.Item key={opt.id} value={opt.id} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 outline-none cursor-pointer">
                    {opt.Icon ? <opt.Icon size={14} /> : <RiImageAiLine size={14} />}
                    <Select.ItemText>{opt.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <Select.Root value={tone} onValueChange={setTone}>
          <Select.Trigger className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-500 transition-colors">
            <RiMagicLine size={14} />
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content 
              className="z-[10002] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95"
              position="popper"
              side="bottom"
              align="start"
              sideOffset={5}
            >
              <Select.Viewport>
                {toneOptions.map(opt => (
                  <Select.Item key={opt.id} value={opt.id} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 outline-none cursor-pointer">
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
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shadow-inner">
                <RiFolderImageFill size={40} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Pronto para criar?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Descreva uma imagem magica abaixo.</p>
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'user' ? (
                  <div className="px-4 py-2.5 rounded-2xl text-sm shadow-sm bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-tr-none">
                    {msg.text}
                  </div>
                ) : (
                  <>
                    {pendingImageId === msg.id && isGenerating && !msg.imageUrl ? (
                      <div className="w-full h-[320px] rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center relative p-6">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-[pulse_3s_ease-in-out_infinite]" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
                          {/* Animated icon container */}
                          <div className="relative flex-shrink-0">
                            <motion.div
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                            >
                              <RiImageAiFill size={48} className="text-white" />
                            </motion.div>

                            {/* Orbiting dots */}
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 border-r-cyan-400"
                            />
                          </div>

                          {/* Dynamic Text with Animated Shiny */}
                          <div className="text-center space-y-2 w-full flex-1 flex flex-col items-center justify-center">
                            <AnimatedShinyText className="text-sm font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 line-clamp-2">
                              {currentGeneratingMessage || 'Gerando sua imagem...'}
                            </AnimatedShinyText>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 max-w-xs">
                              {msg.text}
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full max-w-xs space-y-2 flex-shrink-0">
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${generatingProgress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"
                              />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-semibold">
                              {Math.round(generatingProgress)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-2.5 rounded-2xl text-sm shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none">
                          <HyperText 
                            text={msg.text}
                            duration={0.15}
                            className="text-sm leading-relaxed"
                          />
                        </div>

                        {msg.imageUrl && (
                          <div className="group/img relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 w-full max-w-md">
                            <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-900">
                              <Image
                                src={msg.imageUrl}
                                alt="Gerada por IA"
                                className="object-contain cursor-pointer"
                                fill
                                sizes="(max-width: 768px) 100vw, 400px"
                                loading="lazy"
                                unoptimized
                                onClick={() => setExpandedImageUrl(msg.imageUrl!)}
                                onError={() => {
                                  console.error('Erro ao carregar imagem:', msg.imageUrl);
                                }}
                                onLoad={() => {
                                  console.log('Imagem carregada com sucesso:', msg.imageUrl?.substring(0, 50));
                                }}
                              />
                            </div>

                            {/* Shine effect */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                              <motion.div
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                              />
                            </div>

                            {/* Action buttons */}
                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover/img:opacity-100 group-hover/img:translate-y-0 transition-all duration-300">
                              <button
                                onClick={() => handleCopy(msg.imageUrl!, msg.id)}
                                className="p-2 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
                                title="Copiar URL"
                              >
                                {copiedId === msg.id ? <RiCheckLine size={16} className="text-green-500" /> : <RiFileCopyLine size={16} className="text-slate-600 dark:text-slate-300" />}
                              </button>
                              <button
                                onClick={() => handleSave(msg)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg font-bold text-xs uppercase tracking-widest transition-all"
                                title="Usar imagem"
                              >
                                {savingId === msg.id ? <RiLoader3Fill className="animate-spin" size={14} /> : <RiDownloadCloud2Line size={14} />}
                                Usar
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input - Padronizado */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50 z-20">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 group/input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Descreva a sua visão..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 rounded-lg border-2 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none text-sm min-h-[44px] max-h-[120px] dark:text-white shadow-sm"
              disabled={isGenerating}
              rows={1}
            />
          </div>

          <ShinyButton
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-emerald-500 via-emerald-400 to-cyan-500 hover:from-emerald-600 hover:via-emerald-500 hover:to-cyan-600 transition-all"
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
              <RiCloseLine size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {expandedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setExpandedImageUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={expandedImageUrl}
                  alt="Visualização ampliada"
                  className="object-contain"
                  fill
                  sizes="100vw"
                  unoptimized
                />
              </div>
              <button
                onClick={() => setExpandedImageUrl(null)}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MagicCard>
  );

  if (resolvedMode === 'panel') {
    return (
      <div className="relative w-full h-full">
        {ChatContent}
      </div>
    );
  }

  if (resolvedMode === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-[1000] ai-chat-selection pointer-events-auto"
        style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
      >
        <div className="h-full relative">
          {ChatContent}
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 cursor-nwse-resize z-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors"
            onMouseDown={handleStartResize}
          >
            <RiArrowRightDownLine size={18} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      <div className="w-full max-w-2xl h-[640px] z-10">
        {ChatContent}
      </div>
    </div>
  );
};

export default AIImageChat;
