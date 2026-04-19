import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { BlockType, Block, BlogPost } from '../../types';

// Import Editors
import ProductWidgetEditor from './WidgetEditors/ProductWidgetEditor';
import ProductListWidgetEditor from './WidgetEditors/ProductListWidgetEditor';
import CouponWidgetEditor from './WidgetEditors/CouponWidgetEditor';
import CouponListWidgetEditor from './WidgetEditors/CouponListWidgetEditor';
import HotProductWidgetEditor from './WidgetEditors/HotProductWidgetEditor';
import ImageWidgetEditor from './WidgetEditors/ImageWidgetEditor';
import ImageSlidesEditor from './WidgetEditors/ImageSlidesEditor';
import TableWidgetEditor from './WidgetEditors/TableWidgetEditor';
import ProsAndConsEditor from './WidgetEditors/ProsAndConsEditor';
import AccordionEditor from './WidgetEditors/AccordionEditor';
import TextEditor from './Editors/TextEditor';
import TextView from './Util/TextView';
import AIChat from './AIChat';
import AIImageChat from './Util/AIImageChat';
import AIImageModal from './Util/AIImageModal';
import AIChatModal from './Util/AIChatModal';
import dynamic from 'next/dynamic';

const PostEditor = dynamic(() => import('./Editor/Editor').then(mod => mod.Editor), { ssr: false });
import PostDetailClient from '../../app/post/[id]/PostDetailClient';
import PostCard from '../Post/PostCard';
import PostCardHorizontal from '../Home/PostCardHorizontal';

// Import View Widgets para thumbnails
import ProductWidget from '../../components/Widgets/ProductWidget';
import ProductListWidget from '../../components/Widgets/ProductListWidget';
import CouponWidget from '../../components/Widgets/CouponWidget';
import CouponListWidget from '../../components/Widgets/CouponListWidget';
import HotProductWidget from '../../components/Widgets/HotProductWidget';

// Importando o ícone de expansão vertical do react-icons/bs
import { BsArrowsExpandVertical } from "react-icons/bs";
import { BiSolidSend } from 'react-icons/bi';
import { IoTicketOutline, IoInformationCircleOutline } from 'react-icons/io5';
import { IoMdRocket } from 'react-icons/io';
import { TbShoppingBagPlus, TbShoppingCartPlus } from 'react-icons/tb';
import { TfiLayoutSlider } from 'react-icons/tfi';
import { LuTickets } from 'react-icons/lu';
import { RiRobot3Fill, RiDraftFill, RiImageAiLine, RiImageEditLine, RiRobot3Line, RiFileCopyLine } from 'react-icons/ri';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdOutlineNotificationAdd } from 'react-icons/md';

import {
  Trash2, GripVertical, MoveVertical, Type, Image as ImageIcon,
  Package, Table, Heading, ChevronUp, ChevronDown, Eye, X,
  Columns, Zap, Gift, Box, LayoutGrid,
  Settings,
  Check, PanelLeftClose, PanelLeftOpen, ThumbsUp, List, AlertCircle,
  Smartphone, Monitor, LayoutTemplate
} from 'lucide-react';

import { useAppSounds } from '../../hooks/useAppSounds';
import { useCategoryIcons } from '../../hooks/useCategoryIcons';

interface EditPostViewProps {
  title: string;
  setTitle: (v: string) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  categories: string[];
  thumbnail: string;
  setThumbnail: (v: string) => void;
  thumbnailAlt?: string; // NOVO
  setThumbnailAlt?: (v: string) => void; // NOVO
  isCouponPost: boolean;
  setIsCouponPost: (v: boolean) => void;
  isInformativePost: boolean; // NOVO
  setIsInformativePost: (v: boolean) => void; // NOVO
  sendPush: boolean; // NOVO: Estado para notificação push
  setSendPush: (v: boolean) => void; // NOVO: Setter para notificação push
  blocks: Block[];
  updateBlock: (blockId: string, field: string, value: any) => void;
  updateListItem?: (blockId: string, itemId: string, field: string, value: any) => void;
  handleAddBlock: (type: BlockType) => void;
  addListItem?: (blockId: string) => void;
  removeListItem?: (blockId: string, itemId: string) => void;
  moveBlock: (index: number, direction: 'up' | 'down') => void;
  removeBlock: (blockId: string) => void;
  handleSave: () => void;
  isSaving: boolean;
  editingId: string | null;
  onCancel: () => void;
  handleAddPro?: (blockId: string) => void;
  handleUpdatePro?: (blockId: string, index: number, value: string) => void;
  handleRemovePro?: (blockId: string, index: number) => void;
  handleAddCon?: (blockId: string) => void;
  handleUpdateCon?: (blockId: string, index: number, value: string) => void;
  handleRemoveCon?: (blockId: string, index: number) => void;
  onReorderBlocks?: (startIndex: number, endIndex: number) => void;
  onSaveDraft?: () => void;
  showNotification?: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
  updateCategories?: (categories: string[]) => void;
  isChatOpen?: boolean;
  setIsChatOpen?: (open: boolean) => void;
  useNewEditor?: boolean;
  editorJson?: any;
  setEditorJson?: (value: any) => void;
  editorHtml?: string;
  setEditorHtml?: (value: string) => void;
}


const EditPostView: React.FC<EditPostViewProps> = ({
  title, setTitle, excerpt, setExcerpt, category, setCategory, categories,
  thumbnail, setThumbnail, thumbnailAlt, setThumbnailAlt, isCouponPost, setIsCouponPost,
  isInformativePost, setIsInformativePost, // NOVO
  sendPush, setSendPush, // NOVO: Props para notificação push
  blocks, updateBlock, handleAddBlock, moveBlock, removeBlock,
  handleSave, isSaving, editingId, onCancel,
  updateListItem, addListItem, removeListItem,
  onReorderBlocks,
  onSaveDraft,
  showNotification,
  isChatOpen: propIsChatOpen,
  setIsChatOpen: propSetIsChatOpen,
  useNewEditor,
  editorJson,
  setEditorJson,
  editorHtml,
  setEditorHtml
}) => {
  const { playClick, playAdd, playDelete, playPublishedSuccess } = useAppSounds();
  const { getCategoryIcon } = useCategoryIcons();
  const isNewEditorActive = Boolean(useNewEditor);
  // Estado local para o input Alt para garantir responsividade
  const [localAlt, setLocalAlt] = useState(thumbnailAlt || '');

  // Sincronizar estado local quando a prop muda (ex: carregar rascunho)
  useEffect(() => {
    setLocalAlt(thumbnailAlt || '');
  }, [thumbnailAlt]);

  useEffect(() => {
    setCategoryQuery(category || '');
  }, [category]);

  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [previewWidget, setPreviewWidget] = useState<Block | null>(null);
  const [actionsMinimized, setActionsMinimized] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [generalConfigMinimized, setGeneralConfigMinimized] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'card'>('desktop');
  const [postPreviewOpen, setPostPreviewOpen] = useState(false);
  const [postPreviewMode, setPostPreviewMode] = useState<'desktop' | 'mobile' | 'card' | 'card_horizontal'>('desktop');
  const [categoryQuery, setCategoryQuery] = useState(category || '');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showRocketAnimation, setShowRocketAnimation] = useState(false);

  const blockCategories = [
    {
      id: 'writing',
      label: 'Escrita',
      icon: <Type size={14} />,
      items: [
        { type: BlockType.HEADING, label: 'Título', icon: <Heading size={14} /> },
        { type: BlockType.PARAGRAPH, label: 'Texto', icon: <Type size={14} /> },
      ]
    },
    {
      id: 'media',
      label: 'Mídia',
      icon: <ImageIcon size={14} />,
      items: [
        { type: BlockType.IMAGE, label: 'Imagem', icon: <ImageIcon size={14} /> },
        { type: BlockType.IMAGE_SLIDES, label: 'Slides', icon: <TfiLayoutSlider size={14} /> },
      ]
    },
    {
      id: 'products',
      label: 'Produtos',
      icon: <Package size={14} />,
      items: [
        { type: BlockType.PRODUCT, label: 'Produto', icon: <TbShoppingBagPlus size={14} /> },
        { type: BlockType.PRODUCT_LIST, label: 'Lista Produtos', icon: <TbShoppingCartPlus size={14} /> },
        { type: BlockType.HOT_PRODUCT, label: 'Produto Destaque', icon: <Zap size={14} /> },
      ]
    },
    {
      id: 'coupons',
      label: 'Cupons',
      icon: <Gift size={14} />,
      items: [
        { type: BlockType.COUPON, label: 'Cupom', icon: <IoTicketOutline size={14} /> },
        { type: BlockType.COUPON_LIST, label: 'Lista Cupons', icon: <LuTickets size={14} /> },
      ]
    },
    {
      id: 'utils',
      label: 'Utilitários',
      icon: <Settings size={14} />,
      items: [
        { type: BlockType.TABLE, label: 'Tabela', icon: <Table size={14} /> },
        { type: BlockType.ACCORDION, label: 'Acordions', icon: <List size={14} /> },
        { type: BlockType.PROS_AND_CONS, label: 'Prós e Contras', icon: <ThumbsUp size={14} /> },
      ]
    }
  ];

  // Chat State - Agora controlado via props (AdminLayout)
  const isChatOpen = propIsChatOpen || false;
  const setIsChatOpen = propSetIsChatOpen || (() => { });
  const [chatMode, setChatMode] = useState<'docked' | 'floating'>('docked');
  const [assistantType, setAssistantType] = useState<'text' | 'image'>('text');
  const [isImageChatModalOpen, setIsImageChatModalOpen] = useState(false);
  const [isImageChatPanelOpen, setIsImageChatPanelOpen] = useState(false);
  const [isExcerptChatModalOpen, setIsExcerptChatModalOpen] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
    details?: any;
  } | null>(null);

  // Ref para auto-scroll durante drag
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs para scroll
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const lastSaveRef = useRef<number>(Date.now());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(300);

  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlocks(prev =>
      prev.includes(blockId)
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBlocks.length === blocks.length) {
      setSelectedBlocks([]);
    } else {
      setSelectedBlocks(blocks.map(b => b.id));
    }
  };

  const handleBulkDelete = () => {
    selectedBlocks.forEach(id => removeBlock(id));
    setSelectedBlocks([]);
    playDelete();
  };

  const handleThumbnailFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação do arquivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      if (showNotification) {
        showNotification('error', 'Arquivo muito grande. Máximo: 10MB');
      }
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      if (showNotification) {
        showNotification('error', 'Formato não suportado. Use: JPG, PNG, GIF ou WebP');
      }
      return;
    }

    setIsThumbnailUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, '')); // Remove extensão

      const response = await fetch('/api/admin/imgbb', {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        const errorMsg = data?.error || `Erro ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // A API retorna { url: "...", data: {...} }
      const url = data?.url || '';

      if (!url || typeof url !== 'string') {
        console.error('Resposta da API:', data);
        throw new Error('URL da imagem não foi retornada pela API');
      }

      // Validar se a URL é válida
      try {
        new URL(url);
      } catch {
        throw new Error('URL inválida retornada pela API');
      }

      setThumbnail(url);
      setUploadResult({ success: true, url });

      if (showNotification) {
        showNotification('success', 'Imagem enviada com sucesso!');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      const msg = error instanceof Error ? error.message : 'Erro desconhecido ao enviar imagem';
      setUploadResult({ success: false, error: msg });

      if (showNotification) {
        showNotification('error', msg);
      }
    } finally {
      setIsThumbnailUploading(false);
      if (thumbnailFileInputRef.current) {
        thumbnailFileInputRef.current.value = '';
      }
    }
  };

  const isTitleInvalid = title.trim().length < 5;
  const isCategoryInvalid = category.trim().length === 0;
  const isThumbnailInvalid = Boolean(
    thumbnail &&
    !/^https?:\/\//i.test(thumbnail) &&
    !thumbnail.startsWith('/') &&
    !thumbnail.startsWith('data:')
  );
  const isAltInvalid = Boolean(thumbnail && localAlt.trim().length < 5);
  const isExcerptInvalid = excerpt.trim().length < 20;
  const filteredCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) => cat.toLowerCase().includes(query));
  }, [categoryQuery, categories]);

  // Auto-save de rascunho
  useEffect(() => {
    const autoSave = () => {
      if (title.trim() && onSaveDraft) {
        const now = Date.now();
        if (now - lastSaveRef.current > 120000) {
          try {
            onSaveDraft();
            lastSaveRef.current = now;

            // Mostra notificação
            const time = new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });

            if (showNotification) {
              showNotification('success', `Rascunho salvo automaticamente às ${time}`, 'Auto-save');
            }
          } catch (error) {
            console.error('Erro no auto-save:', error);
            if (showNotification) {
              showNotification('error', 'Erro ao salvar rascunho automaticamente');
            }
          }
        }
      }
    };

    saveTimeoutRef.current = setInterval(autoSave, 60000);

    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
      }
    };
  }, [title, onSaveDraft, showNotification]);

  useEffect(() => {
    if (!isCategoryDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryDropdownOpen]);

  // Marcar atividade do usuário para auto-save
  useEffect(() => {
    const handleUserActivity = () => {
      lastSaveRef.current = Date.now();
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  // Efeito para resize da sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartX.current;
      const newWidth = Math.max(250, Math.min(500, resizeStartWidth.current + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('select-none', 'cursor-col-resize');
    };

    if (isResizing) {
      document.body.classList.add('select-none');
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [isResizing]);

  // Cleanup do auto-scroll ao desmontar
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = sidebarWidth;
    setIsResizing(true);
  };

  const scrollToBlock = (blockId: string) => {
    setActiveBlockId(blockId);
    const element = blockRefs.current[blockId];
    if (element && editorContainerRef.current) {
      const container = editorContainerRef.current;
      const elementTop = element.offsetTop - container.offsetTop;

      container.scrollTo({
        top: elementTop - 100,
        behavior: 'smooth'
      });

      element.classList.add('ring-2', 'ring-blue-500');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500');
      }, 2000);
    }
  };

  // Auto-scroll quando arrastar perto das bordas
  const handleAutoScroll = (e: React.DragEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollSpeed = 8;
    const edgeThreshold = 60;

    const mouseY = e.clientY - rect.top;

    // Limpar intervalo anterior
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    // Scroll para cima
    if (mouseY < edgeThreshold && container.scrollTop > 0) {
      autoScrollIntervalRef.current = setInterval(() => {
        container.scrollTop -= scrollSpeed;
      }, 16);
    }
    // Scroll para baixo
    else if (mouseY > rect.height - edgeThreshold && container.scrollTop < container.scrollHeight - container.clientHeight) {
      autoScrollIntervalRef.current = setInterval(() => {
        container.scrollTop += scrollSpeed;
      }, 16);
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Adicionar classe de cursor ao body
    document.body.classList.add('cursor-grabbing');
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    handleAutoScroll(e);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    setDraggedBlockIndex(null);
    stopAutoScroll();
    document.body.classList.remove('cursor-grabbing');
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = draggedBlockIndex;

    if (dragIndex !== null && dragIndex !== dropIndex && onReorderBlocks) {
      onReorderBlocks(dragIndex, dropIndex);
    }

    setIsDragging(false);
    setDraggedBlockIndex(null);
  };

  const previewWidgetPopup = (block: Block) => {
    setPreviewWidget(block);
  };

  const renderBlockThumbnail = (block: Block) => {
    switch (block.type) {
      case BlockType.PRODUCT:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800/30 p-2">
            <div className="flex items-start h-full">
              <div className="relative w-1/3 h-full bg-white dark:bg-slate-700 rounded overflow-hidden mr-2">
                {block.src ? (
                  <Image
                    src={block.src || ''}
                    alt="Product"
                    fill
                    sizes="(max-width: 768px) 100vw, 120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-blue-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 truncate">
                  PRODUTO
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {block.productName || 'Produto'}
                </div>
                {block.price && (
                  <div className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-1">
                    {block.price}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case BlockType.PRODUCT_LIST:
        const itemCount = block.items?.length || 0;
        return (
          <div className="w-full h-24 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg overflow-hidden border border-purple-200 dark:border-purple-800/30 p-2">
            <div className="flex items-start h-full">
              <div className="w-1/3 h-full bg-white dark:bg-slate-700 rounded overflow-hidden mr-2 flex items-center justify-center">
                <LayoutGrid size={24} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1">
                  LISTA PRODUTOS
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {block.content || 'Lista de Produtos'}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                </div>
              </div>
            </div>
          </div>
        );
      case BlockType.COUPON:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg overflow-hidden border border-green-200 dark:border-green-800/30 p-2">
            <div className="flex items-center h-full">
              <div className="w-1/3 h-full flex items-center justify-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center">
                  <Gift size={20} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-green-600 dark:text-green-400 mb-1">
                  CUPOM
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {block.name || 'Cupom'}
                </div>
                {block.discount && (
                  <div className="text-[11px] font-semibold text-green-700 dark:text-green-300 mt-1">
                    {block.discount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case BlockType.COUPON_LIST:
        const couponCount = block.items?.length || 0;
        return (
          <div className="w-full h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800/30 p-2">
            <div className="flex items-start h-full">
              <div className="w-1/3 h-full bg-white dark:bg-slate-700 rounded overflow-hidden mr-2 flex items-center justify-center">
                <Columns size={24} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  LISTA CUPONS
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {block.content || 'Lista de Cupons'}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {couponCount} {couponCount === 1 ? 'cupom' : 'cupons'}
                </div>
              </div>
            </div>
          </div>
        );
      case BlockType.HOT_PRODUCT:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg overflow-hidden border border-orange-200 dark:border-orange-800/30 p-2">
            <div className="flex items-start h-full">
              <div className="relative w-1/3 h-full bg-white dark:bg-slate-700 rounded overflow-hidden mr-2">
                {block.src ? (
                  <Image
                    src={block.src}
                    alt="Hot Product"
                    fill
                    sizes="(max-width: 768px) 100vw, 120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap size={20} className="text-orange-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-1">
                  PRODUTO DESTAQUE
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {block.productName || 'Produto Destaque'}
                </div>
                {block.badge && (
                  <div className="text-[9px] bg-orange-500 text-white px-1 py-0.5 rounded-full mt-1 inline-block">
                    {block.badge}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case BlockType.IMAGE:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800/30">
            <div className="w-full h-full flex items-center justify-center relative">
              {block.src ? (
                <Image
                  src={block.src}
                  alt="Image"
                  fill
                  sizes="(max-width: 768px) 100vw, 120px"
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon size={24} className="text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500">Imagem</span>
                </div>
              )}
            </div>
          </div>
        );
      case BlockType.PARAGRAPH:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800/30 p-3">
            <div className="flex items-start h-full">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <Type size={14} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  TEXTO
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                  {block.content ? (
                    <div className="text-[10px] leading-tight">
                      {block.content.replace(/<[^>]*>/g, '').substring(0, 80)}
                      {block.content.replace(/<[^>]*>/g, '').length > 80 ? '...' : ''}
                    </div>
                  ) : "Texto vazio..."}
                </div>
              </div>
            </div>
          </div>
        );
      case BlockType.HEADING:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800/30 p-3">
            <div className="flex items-center h-full">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Heading size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  TÍTULO
                </div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2">
                  {block.content?.replace(/<[^>]*>/g, '') || 'Título vazio...'}
                </div>
              </div>
            </div>
          </div>
        );
      case BlockType.TABLE:
        const rowCount = block.rows?.length || 0;
        const colCount = block.headers?.length || 3;
        return (
          <div className="w-full h-24 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-lg overflow-hidden border border-violet-200 dark:border-violet-800/30 p-3">
            <div className="flex items-center h-full">
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-800/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Table size={14} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-violet-600 dark:text-violet-400 mb-1">
                  TABELA
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {block.caption || 'Tabela'}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {rowCount}×{colCount}
                </div>
              </div>
            </div>
          </div>
        );
      case BlockType.PROS_AND_CONS:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800/30 p-3">
            <div className="flex items-center h-full">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <ThumbsUp size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  PRÓS E CONTRAS
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {block.pros?.length || 0} Prós / {block.cons?.length || 0} Contras
                </div>
              </div>
            </div>
          </div>
        );
      case BlockType.ACCORDION:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg overflow-hidden border border-cyan-200 dark:border-cyan-800/30 p-3">
            <div className="flex items-center h-full">
              <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-800/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <List size={14} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                  ACCORDION
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {block.items?.length || 0} Itens
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Widget</div>
          </div>
        );
    }
  };

  const getBlockLabel = (type: BlockType) => {
    switch (type) {
      case BlockType.PARAGRAPH: return 'Texto';
      case BlockType.IMAGE: return 'Imagem';
      case BlockType.PRODUCT: return 'Produto';
      case BlockType.PRODUCT_LIST: return 'Lista Produtos';
      case BlockType.COUPON: return 'Cupom';
      case BlockType.COUPON_LIST: return 'Lista Cupons';
      case BlockType.HEADING: return 'Título';
      case BlockType.HOT_PRODUCT: return 'Produto Destaque';
      case BlockType.TABLE: return 'Tabela';
      case BlockType.PROS_AND_CONS: return 'Prós e Contras';
      case BlockType.IMAGE_SLIDES: return 'Slides de Imagens';
      case BlockType.ACCORDION: return 'Accordion';
      default: return 'Bloco';
    }
  };

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case BlockType.PARAGRAPH: return <Type size={14} />;
      case BlockType.IMAGE: return <ImageIcon size={14} />;
      case BlockType.PRODUCT: return <Package size={14} />;
      case BlockType.PRODUCT_LIST: return <LayoutGrid size={14} />;
      case BlockType.COUPON: return <Gift size={14} />;
      case BlockType.COUPON_LIST: return <Columns size={14} />;
      case BlockType.HEADING: return <Heading size={14} />;
      case BlockType.HOT_PRODUCT: return <Zap size={14} />;
      case BlockType.TABLE: return <Table size={14} />;
      case BlockType.PROS_AND_CONS: return <ThumbsUp size={14} />;
      case BlockType.IMAGE_SLIDES: return <ImageIcon size={14} />;
      case BlockType.ACCORDION: return <List size={14} />;
      default: return <Box size={14} />;
    }
  };

  const getBlockButtonStyles = (type: BlockType) => {
    switch (type) {
      // Produtos - Cyan
      case BlockType.PRODUCT:
      case BlockType.PRODUCT_LIST:
      case BlockType.HOT_PRODUCT:
        return "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200 hover:border-cyan-300 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800";

      // Cupons - Emerald
      case BlockType.COUPON:
      case BlockType.COUPON_LIST:
        return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";

      // Escrita - Slate
      case BlockType.HEADING:
      case BlockType.PARAGRAPH:
        return "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-300 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800";

      // Mídia - Pink
      case BlockType.IMAGE:
      case BlockType.IMAGE_SLIDES:
        return "bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200 hover:border-pink-300 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800";

      // Utilitários - Blue
      case BlockType.TABLE:
      case BlockType.PROS_AND_CONS:
      case BlockType.ACCORDION:
        return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 hover:border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";

      default:
        return "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    }
  };

  const getBlockColorClass = (type: BlockType) => {
    switch (type) {
      case BlockType.PRODUCT:
      case BlockType.PRODUCT_LIST:
      case BlockType.HOT_PRODUCT:
        return "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/30";
      case BlockType.COUPON:
      case BlockType.COUPON_LIST:
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30";
      case BlockType.HEADING:
      case BlockType.PARAGRAPH:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/30";
      case BlockType.IMAGE:
      case BlockType.IMAGE_SLIDES:
        return "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/30";
      case BlockType.TABLE:
      case BlockType.PROS_AND_CONS:
      case BlockType.ACCORDION:
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/30";
    }
  };

  const renderWidgetPreview = (block: Block) => {
    switch (block.type) {
      case BlockType.PRODUCT:
        return <ProductWidget data={block} />;
      case BlockType.PRODUCT_LIST:
        return <ProductListWidget data={block} />;
      case BlockType.COUPON:
        return <CouponWidget data={block} />;
      case BlockType.COUPON_LIST:
        return <CouponListWidget data={block} />;
      case BlockType.HOT_PRODUCT:
        return <HotProductWidget data={block} />;
      case BlockType.IMAGE:
        return (
          <div className="my-6 max-w-4xl mx-auto">
            <div className="relative aspect-video">
              <Image
                src={block.src || ''}
                alt={block.alt || 'Imagem'}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover rounded-lg shadow-md"
              />
            </div>
            {block.alt && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                {block.alt}
              </p>
            )}
          </div>
        );
      case BlockType.PARAGRAPH:
        return (
          <div className="my-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <TextView content={block.content} />
          </div>
        );
      case BlockType.HEADING:
        return (
          <div className="my-4 relative group">
            <h2 className="text-lg md:text-2xl font-semibold text-slate-800 dark:text-white leading-tight uppercase tracking-tighter">
              {block.content?.replace(/<[^>]*>/g, '') || 'Título do Bloco'}
            </h2>
            <div className="mt-1 h-1 w-12 bg-blue-500 rounded-full opacity-30" />
          </div>
        );
      default:
        return (
          <div className="my-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded">
            <p className="text-yellow-800 dark:text-yellow-300">
              Prévia não disponível para este tipo de widget
            </p>
          </div>
        );
    }
  };

  const togglePostType = (type: 'coupon' | 'informative') => {
    if (type === 'coupon') {
      setIsCouponPost(!isCouponPost);
      if (!isCouponPost) setIsInformativePost(false); // Desmarca o outro
    } else {
      setIsInformativePost(!isInformativePost);
      if (!isInformativePost) setIsCouponPost(false); // Desmarca o outro
    }
  };

  const getCategoryTitleColor = (id: string) => {
    switch (id) {
      case 'writing': return "text-slate-500 dark:text-slate-400";
      case 'media': return "text-pink-600 dark:text-pink-400";
      case 'products': return "text-cyan-600 dark:text-cyan-400";
      case 'coupons': return "text-emerald-600 dark:text-emerald-400";
      case 'utils': return "text-blue-600 dark:text-blue-400";
      default: return "text-gray-500 dark:text-gray-400";
    }
  };

  const previewPost: BlogPost = {
    id: editingId || 'preview',
    title: title || 'Prévia do post',
    excerpt: excerpt || 'Resumo indisponível',
    category: category || 'Geral',
    thumbnail: thumbnail || 'https://placehold.co/600x400',
    thumbnailAlt: thumbnailAlt || localAlt,
    date: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    blocks,
    isCouponPost,
    isInformativePost,
    totalCoupons: blocks.filter(block => block.type === BlockType.COUPON || block.type === BlockType.COUPON_LIST).length,
    hasHotProduct: blocks.some(block => block.type === BlockType.HOT_PRODUCT),
    content: editorHtml,
    jsonContent: editorJson,
  };

  return (
    // Container principal que ocupa toda a altura fornecida pelo AdminLayout
    <div className="h-full flex flex-col bg-gray-100 dark:bg-slate-900">
      {/* Modal de Resultado de Upload */}
      {uploadResult && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`p-4 border-b flex items-center gap-3 ${uploadResult.success
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
              }`}>
              <div className={`p-2 rounded-full ${uploadResult.success ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'
                }`}>
                {uploadResult.success ? <Check size={20} /> : <AlertCircle size={20} />}
              </div>
              <h3 className={`font-bold ${uploadResult.success ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'
                }`}>
                {uploadResult.success ? 'Upload Concluído' : 'Falha no Upload'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {uploadResult.success ? (
                <>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    A imagem foi enviada com sucesso para o ImgBB.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL da Imagem</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={uploadResult.url}
                        className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 select-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (uploadResult.url) {
                            navigator.clipboard.writeText(uploadResult.url);
                            if (showNotification) showNotification('success', 'Link copiado!');
                          }
                        }}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                        title="Copiar Link"
                      >
                        <RiFileCopyLine size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                    <button
                      onClick={() => setUploadResult(null)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition shadow-lg shadow-emerald-500/20"
                    >
                      Concluído
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Ocorreu um erro ao tentar enviar a imagem.
                  </p>

                  <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-lg">
                    <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                      {uploadResult.error}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-2">
                    <button
                      onClick={() => setUploadResult(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium rounded-lg transition"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={() => thumbnailFileInputRef.current?.click()}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition shadow-lg shadow-red-500/20"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {postPreviewOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 gap-4 bg-white dark:bg-slate-800 z-10 relative">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Prévia do post
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Visualização completa do conteúdo e do card
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setPostPreviewMode('desktop')}
                    className={`p-2 rounded-md transition-all ${postPreviewMode === 'desktop' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Post completo (desktop)"
                  >
                    <Monitor size={18} />
                  </button>
                  <button
                    onClick={() => setPostPreviewMode('mobile')}
                    className={`p-2 rounded-md transition-all ${postPreviewMode === 'mobile' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Post completo (mobile)"
                  >
                    <Smartphone size={18} />
                  </button>
                  <button
                    onClick={() => setPostPreviewMode('card')}
                    className={`p-2 rounded-md transition-all ${postPreviewMode === 'card' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Card vertical"
                  >
                    <LayoutTemplate size={18} />
                  </button>
                  <button
                    onClick={() => setPostPreviewMode('card_horizontal')}
                    className={`p-2 rounded-md transition-all ${postPreviewMode === 'card_horizontal' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Card horizontal"
                  >
                    <Columns size={18} />
                  </button>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                <button
                  onClick={() => setPostPreviewOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-slate-900/50 flex items-start justify-center relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div className={`
                transition-all duration-200 ease-in-out relative z-10
                ${postPreviewMode === 'desktop' ? 'w-full max-w-5xl' : ''}
                ${postPreviewMode === 'card' ? 'w-full max-w-md my-10' : ''}
                ${postPreviewMode === 'card_horizontal' ? 'w-full max-w-3xl my-10' : ''}
                ${postPreviewMode === 'mobile' ? 'my-4' : ''}
              `}>
                {postPreviewMode === 'card' && (
                  <div className="p-4">
                    <PostCard post={previewPost} />
                  </div>
                )}
                {postPreviewMode === 'card_horizontal' && (
                  <div className="p-4">
                    <PostCardHorizontal post={previewPost} />
                  </div>
                )}
                {postPreviewMode === 'desktop' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden">
                    <PostDetailClient postId={previewPost.id} initialPost={previewPost} />
                  </div>
                )}
                {postPreviewMode === 'mobile' && (
                  <div className="w-[375px] h-[700px] border-[14px] border-gray-900 rounded-[3rem] shadow-2xl overflow-hidden relative mx-auto bg-white dark:bg-slate-900">
                    <div className="absolute top-0 inset-x-0 h-7 bg-gray-900 z-50 flex justify-center">
                      <div className="w-32 h-5 bg-black rounded-b-xl"></div>
                    </div>
                    <div className="h-full overflow-y-auto custom-scrollbar pt-8 pb-8 bg-white dark:bg-slate-900">
                      <PostDetailClient postId={previewPost.id} initialPost={previewPost} />
                    </div>
                    <div className="absolute bottom-1 inset-x-0 h-4 flex justify-center pointer-events-none">
                      <div className="w-32 h-1 bg-gray-900/20 dark:bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setPostPreviewOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition shadow-lg shadow-slate-900/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de pré-visualização */}
      {previewWidget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 gap-4 bg-white dark:bg-slate-800 z-10 relative">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pré-visualização: {getBlockLabel(previewWidget.type)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Visualização do widget como será exibido no site
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Device Toggles */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Desktop (Largura total)"
                  >
                    <Monitor size={18} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('card')}
                    className={`p-2 rounded-md transition-all ${previewMode === 'card' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Card (Container pequeno)"
                  >
                    <LayoutTemplate size={18} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Mobile (375px)"
                  >
                    <Smartphone size={18} />
                  </button>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                <button
                  onClick={() => setPreviewWidget(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-slate-900/50 flex items-start justify-center relative">
              {/* Pattern Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

              <div className={`
                 transition-all duration-500 ease-in-out relative z-10
                 ${previewMode === 'desktop' ? 'w-full max-w-4xl' : ''}
                 ${previewMode === 'card' ? 'w-full max-w-md my-10' : ''}
                 ${previewMode === 'mobile' ? 'my-4' : ''}
               `}>
                <div className={`
                   transition-all duration-500 ease-in-out bg-white dark:bg-slate-900
                   ${previewMode === 'desktop' ? 'bg-transparent dark:bg-transparent' : ''}
                   ${previewMode === 'card' ? 'border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden' : ''}
                   ${previewMode === 'mobile' ? 'w-[375px] h-[700px] border-[14px] border-gray-900 rounded-[3rem] shadow-2xl overflow-hidden relative mx-auto' : ''}
                 `}>
                  {/* Mobile Dynamic Island / Notch */}
                  {previewMode === 'mobile' && (
                    <div className="absolute top-0 inset-x-0 h-7 bg-gray-900 z-50 flex justify-center">
                      <div className="w-32 h-5 bg-black rounded-b-xl"></div>
                    </div>
                  )}

                  {/* Content Area */}
                  <div className={`
                       ${previewMode === 'mobile' ? 'h-full overflow-y-auto custom-scrollbar pt-8 pb-8 bg-white dark:bg-slate-900' : ''}
                       ${previewMode === 'card' ? 'p-6' : ''}
                       ${previewMode === 'desktop' ? '' : ''}
                    `}>
                    {renderWidgetPreview(previewWidget)}
                  </div>

                  {/* Mobile Home Bar */}
                  {previewMode === 'mobile' && (
                    <div className="absolute bottom-1 inset-x-0 h-4 flex justify-center pointer-events-none">
                      <div className="w-32 h-1 bg-gray-900/20 dark:bg-white/20 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setPreviewWidget(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition shadow-lg shadow-slate-900/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        {!isNewEditorActive && (sidebarMinimized ? (
          <div className="flex-shrink-0 w-12 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col items-center py-3">
            <button
              onClick={() => setSidebarMinimized(false)}
              className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105"
              title="Expandir navegação"
            >
              <PanelLeftOpen size={18} />
            </button>
            <div className="mt-3 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-gray-400 writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                {blocks.length}
              </span>
              <span className="text-[8px] text-gray-400 writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                blocos
              </span>
            </div>
          </div>
        ) : (
          <div
            ref={sidebarRef}
            className="flex-shrink-0 relative group flex flex-col transition-all duration-300"
            style={{ width: `${sidebarWidth}px` }}
          >
            {/* Handle de redimensionamento */}
            <div
              className={`
                absolute right-0 top-0 bottom-0 w-2 flex items-center justify-center z-20 
                transition-all duration-200 cursor-col-resize
                ${isResizing ? 'bg-blue-500/20' : 'bg-transparent hover:bg-blue-500/10'}
              `}
              onMouseDown={startResizing}
            >
              <div className={`
                p-1 rounded transition-all duration-200
                ${isResizing
                  ? 'bg-blue-500 text-white scale-110'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}
              `}>
                <BsArrowsExpandVertical
                  size={12}
                  className={`transition-transform duration-200 ${isResizing ? 'rotate-45' : ''}`}
                />
              </div>
            </div>

            {/* Sidebar content */}
            <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-hidden">
              {/* Header fixo da sidebar */}
              <div className="p-3 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSidebarMinimized(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                      title="Minimizar navegação"
                    >
                      <PanelLeftClose size={16} />
                    </button>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Navegação</span>
                  </div>
                  <span className="text-[10px] bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                    {blocks.length} blocos
                  </span>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-700/50">
                  {blocks.length > 0 && (
                    <div
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={handleSelectAll}
                    >
                      <div className={`
                         w-3.5 h-3.5 rounded border transition-all duration-200 flex items-center justify-center
                         ${selectedBlocks.length === blocks.length
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-blue-400'}
                       `}>
                        {selectedBlocks.length === blocks.length && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium select-none group-hover:text-blue-500 transition-colors">
                        {selectedBlocks.length > 0 ? `${selectedBlocks.length} sel.` : 'Todos'}
                      </span>
                    </div>
                  )}

                  {selectedBlocks.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={10} /> Excluir
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de blocos com scroll - esconde scrollbar durante resize */}
              <div
                ref={scrollContainerRef}
                onDragOver={onDragOver}
                onDragLeave={stopAutoScroll}
                className={`flex-1 p-3 ${isResizing ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}
              >
                <div className="space-y-3">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragOver={onDragOver}
                      onDragEnd={onDragEnd}
                      onDrop={(e) => onDrop(e, index)}
                      onClick={() => scrollToBlock(block.id)}
                      className={`
                      group relative flex flex-col gap-1 cursor-pointer transition-all duration-200 select-none
                      ${draggedBlockIndex === index ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5'}
                    `}
                    >
                      {/* Indicador de Ordem */}
                      <div className={`flex items-center justify-between mb-1 px-2 py-1.5 rounded-md border ${getBlockColorClass(block.type)}`}>
                        <div className="flex items-center gap-2">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBlock(block.id);
                            }}
                            className={`
                             w-3.5 h-3.5 rounded border transition-all duration-200 flex items-center justify-center cursor-pointer group hover:border-blue-400
                             ${selectedBlocks.includes(block.id)
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}
                           `}
                          >
                            {selectedBlocks.includes(block.id) && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span className="text-[10px] font-mono opacity-60 w-4">{index + 1}</span>
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            {getBlockIcon(block.type)}
                            {getBlockLabel(block.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              previewWidgetPopup(block);
                            }}
                            className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded opacity-0 group-hover:opacity-100 transition"
                            title="Pré-visualizar widget"
                          >
                            <Eye size={16} />
                          </button>
                          <GripVertical
                            size={16}
                            className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(block.id);
                            }}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition"
                            title="Remover bloco"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Thumbnail Card */}
                      <div className={`
                      relative rounded-lg
                      ${activeBlockId === block.id
                          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md'
                          : 'shadow-sm hover:shadow'}
                    `}>
                        <div className="overflow-hidden rounded-lg">
                          {renderBlockThumbnail(block)}
                        </div>

                        {/* Overlay ao passar o mouse */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors rounded-lg pointer-events-none" />
                      </div>
                    </div>
                  ))}

                  {blocks.length === 0 && (
                    <div className="text-center py-10 px-4 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                      <MoveVertical size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Adicione blocos acima para ver a estrutura aqui.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex-1 flex flex-col overflow-hidden">

          {!isNewEditorActive && (
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-2 shadow-sm z-20 sticky top-0">
              <div className="flex flex-row flex-wrap gap-2 w-full justify-center">
                {blockCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-1 p-1 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50"
                  >
                    <div className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border-r border-gray-200 dark:border-slate-700 ${getCategoryTitleColor(category.id)}`}>
                      {category.label}
                    </div>
                    <div className="flex flex-wrap gap-1 px-1">
                      {category.items.map((item, idx) => (
                        <button
                          key={`${category.id}-${idx}`}
                          onClick={() => {
                            handleAddBlock(item.type);
                            playAdd();
                          }}
                          className={`
                                  flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-colors duration-150
                                  border shadow-sm
                                  ${getBlockButtonStyles(item.type)}
                                `}
                          title={`Adicionar ${item.label}`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Área de conteúdo com scroll interno - OCUPA O ESPAÇO RESTANTE */}
          <div
            ref={editorContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth"
          >
            <div className="max-w-6xl mx-auto px-2 sm:px-4 space-y-4 py-4 pb-20">
              {/* Metadados do Post - Redesenhado (Light Blue Theme) */}
              <div className="mb-8 rounded-2xl border border-blue-100 dark:border-slate-700 bg-blue-50/30 dark:bg-slate-900/50 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-100 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <Settings size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Configurações Gerais</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Informações principais do post</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPostPreviewOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Eye size={16} />
                      Prévia
                    </button>
                    <button
                      onClick={() => { onCancel(); playClick(); }}
                      className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-bold transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        setIsPublishing(true);
                        setShowRocketAnimation(true);
                        handleSave();
                        setTimeout(() => {
                          setIsPublishing(false);
                          setShowRocketAnimation(false);
                        }, 3000);
                      }}
                      disabled={isSaving || !title.trim() || !excerpt.trim()}
                      className={`relative px-4 py-2 text-white text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden ${isSaving || !title.trim() || !excerpt.trim()
                        ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg'
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <IoMdRocket size={16} className={showRocketAnimation ? 'animate-bounce' : ''} />
                          <span>{editingId ? 'Atualizar' : 'Publicar'}</span>
                        </>
                      )}
                      {showRocketAnimation && (
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent animate-pulse pointer-events-none" />
                      )}
                    </button>
                    <button
                      onClick={() => setGeneralConfigMinimized(!generalConfigMinimized)}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {generalConfigMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </button>
                  </div>
                </div>

                {!generalConfigMinimized && (
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-lg px-3 py-2">
                      <IoInformationCircleOutline size={16} className="text-blue-500" />
                      <span>Preenchimento desse campo é necessário para publicação.</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Título - 8 cols */}
                      <div className="md:col-span-8 space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Título do Post</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <Type size={18} />
                          </div>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            aria-invalid={isTitleInvalid}
                            className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-300 placeholder:text-slate-400 ${isTitleInvalid
                              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                              : 'border-slate-200 dark:border-slate-700 focus:ring-blue-400 focus:border-blue-400'
                              }`}
                            placeholder="Digite um título atraente..."
                          />
                          {isTitleInvalid && (
                            <div className="absolute inset-y-0 right-3 flex items-center text-red-500">
                              <AlertCircle size={18} />
                            </div>
                          )}
                        </div>
                        {isTitleInvalid && (
                          <p className="text-[10px] font-semibold text-red-500 ml-1">Mínimo 5 caracteres.</p>
                        )}
                      </div>

                      {/* Categoria - 4 cols */}
                      <div className="md:col-span-4 space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Categoria</label>
                        <div className="relative" ref={categoryDropdownRef}>
                          <div className="group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                              {categoryQuery ? getCategoryIcon(categoryQuery, 18, 'text-blue-500') : <LayoutGrid size={18} />}
                            </div>
                            <input
                              type="text"
                              value={categoryQuery}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCategoryQuery(value);
                                setCategory(value);
                                setIsCategoryDropdownOpen(true);
                              }}
                              onFocus={() => setIsCategoryDropdownOpen(true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setIsCategoryDropdownOpen(false);
                                }
                              }}
                              aria-invalid={isCategoryInvalid}
                              className={`w-full pl-10 pr-14 py-3 rounded-xl border bg-white dark:bg-slate-800 text-left text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-300 group ${isCategoryInvalid
                                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-400 focus:border-blue-400'
                                }`}
                              placeholder="Selecione ou digite..."
                            />
                            {isCategoryInvalid && (
                              <div className="absolute inset-y-0 right-9 flex items-center text-red-500 pointer-events-none">
                                <AlertCircle size={18} />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                              className="absolute inset-y-0 right-3 flex items-center text-slate-400"
                            >
                              <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {isCategoryDropdownOpen && (
                            <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                {filteredCategories.map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setCategory(cat);
                                      setCategoryQuery(cat);
                                      setIsCategoryDropdownOpen(false);
                                      playClick();
                                    }}
                                    className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors flex items-center justify-between group ${cat === category
                                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                      }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      {getCategoryIcon(cat, 16, cat === category ? 'text-blue-600' : 'text-slate-500')}
                                      {cat}
                                    </span>
                                    {cat === category && <Check size={14} className="text-blue-500" />}
                                  </button>
                                ))}
                                {filteredCategories.length === 0 && (
                                  <div className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                                    Nenhuma categoria encontrada
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {isCategoryInvalid && (
                          <p className="text-[10px] font-semibold text-red-500 ml-1">Selecione uma categoria.</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Imagem e Preview - 12 cols */}
                      <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">URL da Imagem de Capa</label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsImageChatModalOpen(true)}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest 
  bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 
  text-slate-900 shadow-lg 
  transition-all duration-300 ease-out
  hover:shadow-2xl hover:shadow-cyan-400/40 
  hover:-translate-y-0.5 hover:scale-[1.02]"
                                >
                                  <RiImageAiLine size={14} />
                                  Gerar Tumbnail com IA
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssistantType('image');
                                    setChatMode('docked');
                                    setIsChatOpen(true);
                                    setIsImageChatPanelOpen(false);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-cyan-400/60 text-cyan-500 dark:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                                >
                                  <RiImageEditLine size={14} />
                                  Lu Image
                                </button>
                                <button
                                  type="button"
                                  onClick={() => thumbnailFileInputRef.current?.click()}
                                  disabled={isThumbnailUploading}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-400/60 text-blue-600 dark:text-blue-300 hover:bg-blue-500/10 transition-all ${isThumbnailUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  <FaCloudUploadAlt size={14} />
                                  {isThumbnailUploading ? 'Enviando...' : 'Upload'}
                                </button>
                              </div>
                            </div>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <ImageIcon size={18} />
                              </div>
                              <input
                                type="text"
                                value={thumbnail}
                                onChange={(e) => setThumbnail(e.target.value)}
                                aria-invalid={isThumbnailInvalid}
                                className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-300 placeholder:text-slate-400 ${isThumbnailInvalid
                                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-400 focus:border-blue-400'
                                  }`}
                                placeholder="https://exemplo.com/imagem.jpg"
                              />
                              {isThumbnailInvalid && (
                                <div className="absolute inset-y-0 right-3 flex items-center text-red-500">
                                  <AlertCircle size={18} />
                                </div>
                              )}
                            </div>
                            {isThumbnailInvalid && (
                              <p className="text-[10px] font-semibold text-red-500 ml-1">URL inválida.</p>
                            )}
                            <input
                              ref={thumbnailFileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleThumbnailFileChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Texto Alternativo (Alt)</label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Eye size={18} />
                              </div>
                              <input
                                type="text"
                                value={localAlt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setLocalAlt(val);
                                  if (setThumbnailAlt) {
                                    setThumbnailAlt(val);
                                  }
                                }}
                                aria-invalid={isAltInvalid}
                                className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-300 placeholder:text-slate-400 ${isAltInvalid
                                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-400 focus:border-blue-400'
                                  }`}
                                placeholder="Descrição para acessibilidade..."
                              />
                              {isAltInvalid && (
                                <div className="absolute inset-y-0 right-3 flex items-center text-red-500">
                                  <AlertCircle size={18} />
                                </div>
                              )}
                            </div>
                            {isAltInvalid && (
                              <p className="text-[10px] font-semibold text-red-500 ml-1">Informe ao menos 5 caracteres.</p>
                            )}
                          </div>
                        </div>

                        {/* Thumbnail Preview */}
                        <div className="md:col-span-4">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 block mb-2">Pré-visualização</label>
                          <div className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden relative flex items-center justify-center group">
                            {thumbnail && (thumbnail.startsWith('http') || thumbnail.startsWith('/')) ? (
                              <>
                                <Image
                                  src={thumbnail}
                                  alt={thumbnailAlt || 'Preview'}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={() => { /* Ignorar erro silenciosamente ou mostrar fallback */ }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <ImageIcon size={32} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium uppercase tracking-wide">{thumbnail ? 'URL Inválida' : 'Sem imagem'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isImageChatPanelOpen && (
                      <div className="md:col-span-12">
                        <AIImageChat
                          isOpen
                          onClose={() => setIsImageChatPanelOpen(false)}
                          onApplyImage={(url) => setThumbnail(url)}
                          variant="panel"
                          title="Lu Image"
                        />
                      </div>
                    )}

                    {/* Resumo - 12 cols */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Resumo / SEO</label>
                        <button
                          onClick={() => setIsExcerptChatModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 transition-all"
                        >
                          <RiRobot3Fill size={14} />
                          Gerar com IA
                        </button>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-3 top-3 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <List size={18} />
                        </div>
                        <textarea
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          rows={3}
                          aria-invalid={isExcerptInvalid}
                          className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 shadow-sm focus:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all duration-300 placeholder:text-slate-400 resize-none ${isExcerptInvalid
                            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-400 focus:border-blue-400'
                            }`}
                          placeholder="Escreva um resumo cativante para o seu post..."
                        />
                        {isExcerptInvalid && (
                          <div className="absolute right-3 top-3 text-red-500">
                            <AlertCircle size={18} />
                          </div>
                        )}
                      </div>
                      {isExcerptInvalid && (
                        <p className="text-[10px] font-semibold text-red-500 ml-1">Mínimo 20 caracteres.</p>
                      )}
                    </div>

                    {/* Tipos de Conteúdo - Cards */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center mb-4 uppercase tracking-widest opacity-70">Tipo de Publicação</label>
                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        <button
                          onClick={() => togglePostType('coupon')}
                          className={`relative overflow-hidden group flex flex-row items-center justify-start p-4 rounded-2xl border-2 transition-all duration-300 ${isCouponPost
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-md'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/30'
                            }`}
                        >
                          <div className={`p-2 rounded-xl mr-3 transition-colors duration-300 flex-shrink-0 ${isCouponPost
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-600'
                            }`}>
                            <IoTicketOutline size={20} />
                          </div>
                          <span className={`text-sm font-bold transition-colors ${isCouponPost
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-600'
                            }`}>
                            Post de Cupom
                          </span>
                          {isCouponPost && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in duration-200">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>

                        <button
                          onClick={() => togglePostType('informative')}
                          className={`relative overflow-hidden group flex flex-row items-center justify-start p-4 rounded-2xl border-2 transition-all duration-300 ${isInformativePost
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30'
                            }`}
                        >
                          <div className={`p-2 rounded-xl mr-3 transition-colors duration-300 flex-shrink-0 ${isInformativePost
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600'
                            }`}>
                            <IoInformationCircleOutline size={20} />
                          </div>
                          <span className={`text-sm font-bold transition-colors ${isInformativePost
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600'
                            }`}>
                            Post Informativo
                          </span>
                          {isInformativePost && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in duration-200">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Notificação Push - Novo Checkbox */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center mb-4 uppercase tracking-widest opacity-70">Notificações</label>
                      <div className="max-w-lg mx-auto">
                        <button
                          onClick={() => setSendPush(!sendPush)}
                          className={`w-full relative overflow-hidden group flex flex-row items-center justify-start p-4 rounded-2xl border-2 transition-all duration-300 ${sendPush
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-md'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/30'
                            }`}
                        >
                          <div className={`p-2 rounded-xl mr-3 transition-colors duration-300 flex-shrink-0 ${sendPush
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 group-hover:text-purple-600'
                            }`}>
                            <MdOutlineNotificationAdd size={20} />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className={`text-sm font-bold transition-colors ${sendPush
                              ? 'text-purple-700 dark:text-purple-400'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-purple-600'
                              }`}>
                              Notificar utilizadores via Push
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              Enviar notificação para todos os inscritos
                            </span>
                          </div>
                          {sendPush && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in duration-200">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isNewEditorActive && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden h-[600px]">
                  <PostEditor
                    initialContent={editorJson || editorHtml || undefined}
                    onChange={(json, html) => {
                      setEditorJson?.(json);
                      setEditorHtml?.(html);
                    }}
                  />
                </div>
              )}


              {!isNewEditorActive && (
                <>
                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        ref={(el: HTMLDivElement | null) => {
                          if (el) {
                            blockRefs.current[block.id] = el;
                          }
                        }}
                        id={`block-${block.id}`}
                        className={`group relative bg-white dark:bg-slate-800 rounded-lg border transition-all duration-300 w-full ${activeBlockId === block.id
                          ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20'
                          : 'border-gray-200 dark:border-slate-700 shadow-sm hover:shadow'
                          }`}
                      >
                        <div className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-5 h-5 rounded bg-gray-200 dark:bg-slate-700 text-xs font-bold text-gray-500">
                              {index + 1}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                              {getBlockIcon(block.type)}
                              {getBlockLabel(block.type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { moveBlock(index, 'up'); playClick(); }}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Mover para cima"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                onClick={() => { moveBlock(index, 'down'); playClick(); }}
                                disabled={index === blocks.length - 1}
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Mover para baixo"
                              >
                                <ChevronDown size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => { removeBlock(block.id); playDelete(); }}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                              title="Remover bloco"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 w-full">
                          {block.type === BlockType.PARAGRAPH || block.type === BlockType.HEADING ? (
                            block.type === BlockType.HEADING ? (
                              <input
                                type="text"
                                value={block.content || ''}
                                onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                placeholder="Digite o título..."
                                className="w-full text-xl md:text-2xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white bg-transparent px-2 py-1 border-0 border-b-2 border-transparent outline-none ring-0 ring-offset-0 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-300 ease-in-out"
                              />
                            ) : (
                              <TextEditor
                                content={block.content || ''}
                                onContentChange={(content) => updateBlock(block.id, 'content', content)}
                                placeholder="Comece a escrever..."
                                postTitle={title}
                              />
                            )
                          ) : block.type === BlockType.PRODUCT ? (
                            <ProductWidgetEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                              categories={categories}
                              defaultCategory={category}
                            />
                          ) : block.type === BlockType.PRODUCT_LIST ? (
                            <ProductListWidgetEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                              onUpdateListItem={(itemId: string, field: string, value: any) => updateListItem?.(block.id, itemId, field, value)}
                              onAddListItem={() => addListItem?.(block.id)}
                              onRemoveListItem={(itemId: string) => removeListItem?.(block.id, itemId)}
                            />
                          ) : block.type === BlockType.COUPON ? (
                            <CouponWidgetEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                            />
                          ) : block.type === BlockType.COUPON_LIST ? (
                            <CouponListWidgetEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                              onUpdateListItem={(itemId: string, field: string, value: any) => updateListItem?.(block.id, itemId, field, value)}
                              onAddListItem={() => addListItem?.(block.id)}
                              onRemoveListItem={(itemId: string) => removeListItem?.(block.id, itemId)}
                            />
                          ) : block.type === BlockType.IMAGE ? (
                            <ImageWidgetEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                            />
                          ) : block.type === BlockType.IMAGE_SLIDES ? (
                            <ImageSlidesEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                            />
                          ) : block.type === BlockType.HOT_PRODUCT ? (
                            <HotProductWidgetEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                              categories={categories}
                              defaultCategory={category}
                            />
                          ) : block.type === BlockType.TABLE ? (
                            <TableWidgetEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                            />
                          ) : block.type === BlockType.PROS_AND_CONS ? (
                            <ProsAndConsEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                            />
                          ) : block.type === BlockType.ACCORDION ? (
                            <AccordionEditor
                              block={block}
                              onUpdate={(field, value) => updateBlock(block.id, field, value)}
                            />
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {blocks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/50">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-full mb-3 shadow-sm">
                        <MoveVertical size={24} className="text-blue-500" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                        Editor Vazio
                      </h3>
                      <p className="text-xs max-w-sm text-center mb-4">
                        Use a barra de ferramentas no topo para adicionar seções ao seu post.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { handleAddBlock(BlockType.HEADING); playAdd(); }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition"
                        >
                          Adicionar Título
                        </button>
                        <button
                          onClick={() => { handleAddBlock(BlockType.PARAGRAPH); playAdd(); }}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition"
                        >
                          Adicionar Texto
                        </button>
                        <button
                          onClick={() => { handleAddBlock(BlockType.PROS_AND_CONS); playAdd(); }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition"
                        >
                          Adicionar Prós e Contras
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {isChatOpen && (
          <>
            {chatMode === 'docked' && (
              <div className="hidden lg:flex w-[400px] h-full flex-shrink-0 border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300">
                {assistantType === 'text' ? (
                  <AIChat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    mode="docked"
                    onToggleMode={() => setChatMode('floating')}
                    onToggleAssistant={() => setAssistantType('image')}
                    assistantType="text"
                  />
                ) : (
                  <AIImageChat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    onToggleAssistant={() => setAssistantType('text')}
                    assistantType="image"
                    variant="panel"
                    title="Lu Image"
                  />
                )}
              </div>
            )}
            <div className={`${chatMode === 'docked' ? 'lg:hidden' : ''}`}>
              {assistantType === 'text' ? (
                <AIChat
                  isOpen={isChatOpen}
                  onClose={() => setIsChatOpen(false)}
                  mode="floating"
                  onToggleMode={() => setChatMode('docked')}
                  onToggleAssistant={() => setAssistantType('image')}
                  assistantType="text"
                />
              ) : (
                <AIImageChat
                  isOpen={isChatOpen}
                  onClose={() => setIsChatOpen(false)}
                  onToggleAssistant={() => setAssistantType('text')}
                  assistantType="image"
                  variant="modal"
                  title="Lu Image"
                />
              )}
            </div>
          </>
        )}
        <AIImageModal
          isOpen={isImageChatModalOpen}
          onClose={() => setIsImageChatModalOpen(false)}
          onApplyImage={(url) => setThumbnail(url)}
          title="Lu Image"
        />
        <AIChatModal
          isOpen={isExcerptChatModalOpen}
          onClose={() => setIsExcerptChatModalOpen(false)}
          onInsert={(text) => {
            setExcerpt(text);
            setIsExcerptChatModalOpen(false);
          }}
          initialPrompt="Crie um resumo SEO para este post."
          postTitle={title}
        />
      </div>



      {/* Barra de Ações Flutuante Removida */}
    </div >
  );
};

export default EditPostView;
