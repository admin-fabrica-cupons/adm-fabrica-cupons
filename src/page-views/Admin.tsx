import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePost } from '../contexts/PostContext';
import { AccordionBlock, Block, BlockType, BlogPost, CouponBlock, CouponListBlock, CouponListItem, HeadingBlock, HotProductBlock, ImageBlock, ParagraphBlock, ProductBlock, ProductListBlock, ProductListItem, ProsAndConsBlock, TableBlock, TableRow } from '../types';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../components/Common/NotificationContext';
import ErrorBoundary from '../components/Common/ErrorBoundary';
import AdminLayout from '../components/Admin/AdminLayout';
import PostsListView from '../components/Admin/Util/PostsListView';
import CategoriesManager from '../components/Admin/CategoriesManager';
import DraftsManager from '../components/Admin/DraftsManager';
import PostPreview from '../components/Admin/Util/PostPreview';
import EditPostView from '../components/Admin/EditPostView';
import ProductWidgetEditor from '../components/Admin/WidgetEditors/ProductWidgetEditor';
import HotProductWidgetEditor from '../components/Admin/WidgetEditors/HotProductWidgetEditor';
import CouponWidgetEditor from '../components/Admin/WidgetEditors/CouponWidgetEditor';
import AIChat from '../components/Admin/AIChat';
import ConfirmDialog from '../components/Admin/ConfirmDialog';
import RobotModal from '../components/Admin/Util/RobotModal';
import { useAppSounds } from '../hooks/useAppSounds';
import { CATEGORIES } from '../constants';
import { getPendingPosts } from '../utils/storage';
import { HiOutlineSun, HiOutlineMoon, HiOutlineInformationCircle } from 'react-icons/hi';
import { RiSettings4Line, RiToolsLine, RiShoppingCart2Fill } from 'react-icons/ri';
import { Flame, Search, RefreshCw, Plus, Edit, Trash2, Check } from 'lucide-react';
import Image from 'next/image';
import { BsFillHandbagFill } from 'react-icons/bs';
import { IoTicketOutline } from 'react-icons/io5';
import ProductWidget from '../components/Widgets/ProductWidget';
import HotProductWidget from '../components/Widgets/HotProductWidget';
import CouponWidget from '../components/Widgets/CouponWidget';

const getLocalDateISO = (date = new Date()) => {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const getBrazilDateTimeISO = (date = new Date()) => {
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
  const [datePart, timePart] = formatted.split(' ');
  return `${datePart}T${timePart || '00:00:00'}-03:00`;
};

const AUTO_SAVE_DELAY = 120000;

const normalizeCategories = (items: string[]) =>
  Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));

const Admin: React.FC = () => {
  const postContext = usePost();
  if (!postContext) {
    throw new Error('usePost must be used within a PostProvider');
  }
  const { posts, loading, addPost, deletePost, updatePost, getPost, reloadPosts, categories: contextCategories, updateCategories: contextUpdateCategories, categoryIcons, updateCategoryIcon, theme, toggleTheme } = postContext;
  const { addNotification, updateNotification } = useNotifications();
  const { playClick, playAdd, playDelete, playSuccess, playError, playWarning, playWelcomeAdmin, playNewPost, playImLu, playGoodBye, playPublishedSuccess, playDraftSave, playExitConfirmedRest, playExitCanceled, playBacking, playCategoriesSound, playRefreshSound, playSectionInitial } = useAppSounds();

  const [activeSection, setActiveSection] = useState<'posts' | 'offers' | 'categories' | 'drafts' | 'preview' | 'settings'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDate, setPreviewDate] = useState('');
  const [previewPublishedAt, setPreviewPublishedAt] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Cupons');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailAlt, setThumbnailAlt] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isCouponPost, setIsCouponPost] = useState(false);
  const [isInformativePost, setIsInformativePost] = useState(false);
  const [sendPush, setSendPush] = useState(false);
  const [editorJson, setEditorJson] = useState<any>(null);
  const [editorHtml, setEditorHtml] = useState('');
  const [useNewEditor, setUseNewEditor] = useState(false);
  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [offerBlock, setOfferBlock] = useState<Block | null>(null);
  const [isPublishingOffer, setIsPublishingOffer] = useState(false);
  const [offerSearch, setOfferSearch] = useState('');
  const [standaloneOffers, setStandaloneOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

  const [isChatOpen, setIsChatOpenState] = useState(false);

  const [categories, setCategories] = useState<string[]>(normalizeCategories(CATEGORIES));

  useEffect(() => {
    const saved = localStorage.getItem('fabrica-cupons-categories');
    if (saved) {
      const initial = JSON.parse(saved);
      setCategories(normalizeCategories(initial));
    }
  }, []);

  useEffect(() => {
    if (!showPreview) {
      setPreviewDate('');
      setPreviewPublishedAt('');
      return;
    }
    const existingPost = editingId ? posts.find(p => p.id === editingId) : null;
    setPreviewDate(existingPost?.date || getLocalDateISO());
    setPreviewPublishedAt(existingPost?.publishedAt || getBrazilDateTimeISO());
  }, [showPreview, editingId, posts]);

  const router = useRouter();

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  const welcomeShownRef = useRef(false);
  const lastNotificationSectionRef = useRef<'posts' | 'offers' | 'categories' | 'drafts' | 'preview' | 'settings'>('posts');
  const notificationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (contextCategories && contextCategories.length > 0) {
      const normalized = normalizeCategories(contextCategories);
      setCategories(normalized);
      setCategory(normalized[0] || 'Cupons');
    }
  }, [contextCategories]);

  useEffect(() => {
    if (loading || welcomeShownRef.current) return;

    const showInitialNotifications = () => {
      playWelcomeAdmin();
      addNotification({
        type: 'info',
        message: 'Bem-vindo administrador, sinta-se a vontade!',
        duration: 3500
      });

      const pendingPosts = getPendingPosts();
      if (pendingPosts.length > 0) {
        addNotification({
          type: 'warning',
          message: `${pendingPosts.length} posts aguardando sincronização`,
          duration: 4000
        });
      }

      addNotification({
        type: 'info',
        message: `Carregados ${posts.length} posts ativos`,
        duration: 3000
      });

      welcomeShownRef.current = true;
    };

    if (notificationDebounceRef.current) {
      clearTimeout(notificationDebounceRef.current);
    }

    notificationDebounceRef.current = setTimeout(showInitialNotifications, 500);

    return () => {
      if (notificationDebounceRef.current) {
        clearTimeout(notificationDebounceRef.current);
      }
    };
  }, [addNotification, loading, posts.length, playWelcomeAdmin]);

  useEffect(() => {
    if (isEditing || showPreview || isEditingOffer) return;

    if (activeSection !== lastNotificationSectionRef.current) {
      if (notificationDebounceRef.current) {
        clearTimeout(notificationDebounceRef.current);
      }

      notificationDebounceRef.current = setTimeout(() => {
        let message = '';

        switch (activeSection) {
          case 'posts':
            message = `Gerenciando ${posts.length} posts`;
            break;
          case 'drafts':
            message = 'Gerenciando rascunhos';
            break;
          case 'categories':
            message = `Gerenciando ${categories.length} categorias`;
            break;
          case 'settings':
            message = `Configurações do sistema`;
            break;
          case 'offers':
            message = `Criando ofertas independentes`;
            break;
        }

        if (message) {
          addNotification({
            type: 'info',
            message,
            duration: 3000
          });
        }

        lastNotificationSectionRef.current = activeSection;
      }, 300);
    }

    return () => {
      if (notificationDebounceRef.current) {
        clearTimeout(notificationDebounceRef.current);
      }
    };
  }, [activeSection, posts.length, categories.length, addNotification, isEditing, showPreview, isEditingOffer]);

  const handleUpdateCategories = useCallback((newCategories: string[]) => {
    const normalized = normalizeCategories(newCategories);
    setCategories(normalized);
    localStorage.setItem('fabrica-cupons-categories', JSON.stringify(normalized));
    if (contextUpdateCategories) {
      contextUpdateCategories(normalized);
    }
  }, [contextUpdateCategories]);

  const resetForm = useCallback(() => {
    setTitle('');
    setExcerpt('');
    setCategory(categories[0] || 'Cupons');
    setThumbnail('');
    setThumbnailAlt('');
    setBlocks([]);
    setIsCouponPost(false);
    setIsInformativePost(false);
    setSendPush(false);
    setEditorJson(null);
    setEditorHtml('');
    setUseNewEditor(false);
    setEditingId(null);
    setIsEditing(false);
    setIsSaving(false);
    setActiveSection('posts');
    setShowPreview(false);

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
      autoSaveTimeout.current = null;
    }
    lastSavedRef.current = '';
  }, [categories]);

  const resetOfferForm = useCallback(() => {
    setOfferBlock(null);
    setIsEditingOffer(false);
    setIsPublishingOffer(false);
    setActiveSection('offers');
  }, []);

  const showNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info' | 'sync' | 'loading', message: string) => {
    addNotification({ type, message });
  }, [addNotification]);

  const handleEdit = useCallback(async (postMetadata: BlogPost) => {
    const notificationId = addNotification({
      type: 'loading',
      message: `Carregando conteúdo de "${postMetadata.title}"...`,
      duration: 0
    });

    try {
      let fullPost = postMetadata;
      if (getPost) {
        const loaded = await getPost(postMetadata.id);
        if (loaded) fullPost = loaded;
      }

      setTitle(fullPost.title);
      setExcerpt(fullPost.excerpt);
      setCategory(fullPost.category || categories[0] || 'Cupons');
      setThumbnail(fullPost.thumbnail);
      setBlocks(fullPost.blocks ? JSON.parse(JSON.stringify(fullPost.blocks)) : []);
      setIsCouponPost(fullPost.isCouponPost || false);
      setIsInformativePost(fullPost.isInformativePost || false);
      const loadedJson = (fullPost as any)?.json || null;
      const loadedHtml = (fullPost as any)?.html || '';
      setEditorJson(loadedJson);
      setEditorHtml(loadedHtml);
      setUseNewEditor(Boolean(loadedJson || loadedHtml));
      setEditingId(fullPost.id);
      setIsEditing(true);
      setActiveSection('posts');
      setShowPreview(false);

      updateNotification(notificationId, {
        type: 'info',
        message: `✏️ Editando: "${fullPost.title}"`,
        duration: 3000
      });

      addNotification({
        type: 'info',
        message: `📊 ${fullPost.blocks?.length || 0} blocos carregados`,
        duration: 3000
      });

    } catch (error) {
      console.error('Erro ao carregar post:', error);
      updateNotification(notificationId, {
        type: 'error',
        message: 'Erro ao carregar conteúdo do post',
        duration: 4000
      });
    }
  }, [categories, addNotification, updateNotification, getPost]);

  const generateId = useCallback(() => Math.random().toString(36).substr(2, 9), []);

  const handleAddBlock = useCallback((type: BlockType) => {
    const baseBlock: any = {
      id: generateId(),
      type,
    };

    switch (type) {
      case BlockType.COUPON: {
        const block = baseBlock as CouponBlock;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        block.name = 'Cupom Exclusivo';
        block.discount = '10% OFF';
        block.couponCode = 'CUPOM10';
        block.affiliateLink = '#';
        block.affiliateButtonText = 'Usar Cupom';
        block.affiliateLogo = '';
        block.storeName = 'Mercado Livre';
        block.description = 'Use este cupom na finalização da compra';
        block.expiryDate = getLocalDateISO(tomorrow);
        block.expiryTime = '';
        block.isExpired = false;
        break;
      }

      case BlockType.PRODUCT: {
        const block = baseBlock as ProductBlock;
        block.productName = 'Produto Exemplo';
        block.price = '299,90';
        block.originalPrice = '399,90';
        block.rating = 4.5;
        block.affiliateLink = '#';
        block.affiliateButtonText = 'Comprar Agora';
        block.affiliateLogo = '';
        block.src = 'https://placehold.co/400x300';
        block.description = 'Descrição detalhada do produto';
        block.pros = ['Alta qualidade', 'Bom custo-benefício', 'Garantia extendida'];
        block.cons = ['Entrega demorada', 'Pode esgotar rápido'];
        block.productLayout = 'default';
        break;
      }

      case BlockType.PRODUCT_LIST: {
        const block = baseBlock as ProductListBlock;
        const productListItems: ProductListItem[] = [
          {
            id: generateId(),
            title: 'Produto 1',
            description: 'Descrição do produto 1',
            price: '199,90',
            image: 'https://placehold.co/300x200',
            couponCode: 'CUPOM1',
            affiliateLink: '#',
            affiliateButtonText: 'VER OFERTA',
            affiliateLogo: '',
            storeName: ''
          },
        ];

        block.content = 'Lista de Produtos';
        block.listType = 'grid';
        block.columns = 3;
        block.showImages = true;
        block.showPrices = true;
        block.showCoupons = true;
        block.items = productListItems;
        break;
      }

      case BlockType.COUPON_LIST: {
        const block = baseBlock as CouponListBlock;
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const couponListItems: CouponListItem[] = [
          {
            id: generateId(),
            title: 'Cupom 10% OFF',
            description: 'Válido para todas as categorias',
            discount: '10% OFF',
            couponCode: 'CUPOM10',
            storeName: 'Mercado Livre',
            expiryDate: getLocalDateISO(nextWeek),
            expiryTime: '',
            affiliateLink: '#',
            affiliateLogo: ''
          },
        ];

        block.content = 'Lista de Cupons';
        block.storeName = 'Mercado Livre';
        block.affiliateButtonText = 'Usar Cupom';
        block.showDescriptions = true;
        block.showStoreInfo = true;
        block.items = couponListItems;
        break;
      }

      case BlockType.IMAGE: {
        const block = baseBlock as ImageBlock;
        block.src = 'https://placehold.co/800x400';
        block.alt = 'Descrição da imagem';
        block.imageRatio = '16:9';
        block.imageSize = 'medium';
        break;
      }

      case BlockType.HOT_PRODUCT: {
        const block = baseBlock as HotProductBlock;
        block.productName = 'Produto Imperdível';
        block.price = '299,90';
        block.originalPrice = '399,90';
        block.badge = 'Melhor da Categoria';
        block.affiliateLink = '#';
        block.affiliateButtonText = 'Comprar Agora';
        block.affiliateLogo = '';
        block.storeName = '';
        block.name = '';
        block.src = 'https://placehold.co/400x300';
        block.description = 'Descrição detalhada do produto imperdível';
        block.rating = 4.5;
        break;
      }

      case BlockType.TABLE: {
        const block = baseBlock as TableBlock;
        const headers = ['Característica', 'Detalhe', 'Observação'];
        const rows: TableRow[] = [
          {
            id: generateId(),
            cells: [
              { id: generateId(), content: 'Peso', isHeader: true },
              { id: generateId(), content: '1.2kg' },
              { id: generateId(), content: 'Muito leve' }
            ]
          },
          {
            id: generateId(),
            cells: [
              { id: generateId(), content: 'Material', isHeader: true },
              { id: generateId(), content: 'Alumínio' },
              { id: generateId(), content: 'Alta durabilidade' }
            ]
          }
        ];
        block.headers = headers;
        block.rows = rows;
        break;
      }

      case BlockType.ACCORDION: {
        const block = baseBlock as AccordionBlock;
        block.items = [
          { id: generateId(), title: 'Item 1', description: 'Descrição do item 1' },
          { id: generateId(), title: 'Item 2', description: 'Descrição do item 2' }
        ];
        break;
      }

      case BlockType.HEADING: {
        const block = baseBlock as HeadingBlock;
        block.content = 'Novo Título';
        break;
      }

      case BlockType.PARAGRAPH: {
        const block = baseBlock as ParagraphBlock;
        block.content = 'Digite seu texto aqui...';
        break;
      }

      case BlockType.PROS_AND_CONS: {
        const block = baseBlock as ProsAndConsBlock;
        block.pros = ['Vantagem 1', 'Vantagem 2'];
        block.cons = ['Ponto de atenção 1'];
        break;
      }
    }

    setBlocks(prev => [...prev, baseBlock]);
    playAdd();
    showNotification('success', `Bloco ${type} adicionado`);
  }, [generateId, showNotification, playAdd]);

  const createOfferBlock = useCallback((type: BlockType) => {
    const baseBlock: any = {
      id: generateId(),
      type,
    };

    if (type === BlockType.PRODUCT) {
      const block = baseBlock as ProductBlock;
      block.productName = 'Produto Exemplo';
      block.price = '299,90';
      block.originalPrice = '399,90';
      block.rating = 4.5;
      block.affiliateLink = '#';
      block.affiliateButtonText = 'Comprar Agora';
      block.affiliateLogo = '';
      block.src = 'https://placehold.co/400x300';
      block.description = 'Descrição detalhada do produto';
      block.pros = ['Alta qualidade', 'Bom custo-benefício', 'Garantia extendida'];
      block.cons = ['Entrega demorada', 'Pode esgotar rápido'];
      block.productLayout = 'default';
      return block;
    }

    if (type === BlockType.HOT_PRODUCT) {
      const block = baseBlock as HotProductBlock;
      block.productName = 'Produto Imperdível';
      block.price = '299,90';
      block.originalPrice = '399,90';
      block.badge = 'Melhor da Categoria';
      block.affiliateLink = '#';
      block.affiliateButtonText = 'Comprar Agora';
      block.affiliateLogo = '';
      block.storeName = '';
      block.name = '';
      block.src = 'https://placehold.co/400x300';
      block.description = 'Descrição detalhada do produto imperdível';
      block.rating = 4.5;
      return block;
    }

    if (type === BlockType.COUPON) {
      const block = baseBlock as CouponBlock;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      block.name = 'Cupom Exclusivo';
      block.discount = '10% OFF';
      block.couponCode = 'CUPOM10';
      block.affiliateLink = '#';
      block.affiliateButtonText = 'Usar Cupom';
      block.affiliateLogo = '';
      block.storeName = 'Mercado Livre';
      block.description = 'Use este cupom na finalização da compra';
      block.expiryDate = getLocalDateISO(tomorrow);
      block.expiryTime = '';
      block.isExpired = false;
      return block;
    }

    return baseBlock as Block;
  }, [generateId]);

  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) {
      showNotification('warning', 'Adicione um título para salvar o rascunho');
      return;
    }

    const draft: BlogPost = {
      id: editingId || generateId(),
      title: title || 'Rascunho sem título',
      excerpt: excerpt || '',
      category: category || categories[0] || 'Cupons',
      thumbnail: thumbnail || 'https://placehold.co/600x400',
      thumbnailAlt,
      date: getLocalDateISO(),
      publishedAt: editingId
        ? (posts.find(p => p.id === editingId)?.publishedAt || getBrazilDateTimeISO())
        : getBrazilDateTimeISO(),
      blocks,
      isCouponPost,
      isInformativePost,
      lastModified: getBrazilDateTimeISO()
    };
    const draftPayload = useNewEditor
      ? ({
        ...draft,
        json: editorJson,
        html: editorHtml,
        content: editorHtml,
        jsonContent: editorJson
      } as BlogPost)
      : draft;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: draftPayload, action: 'draft' }),
      });
      const result = await response.json();
      if (result.success) {
        showNotification('success', '✅ Rascunho salvo com sucesso!');
        playDraftSave();
        lastSavedRef.current = JSON.stringify({ title, excerpt, category, thumbnail, thumbnailAlt, blocks, isCouponPost, isInformativePost });
      } else {
        showNotification('error', result.error || 'Erro ao salvar rascunho');
      }
    } catch {
      showNotification('error', 'Erro ao salvar rascunho');
    }
  }, [title, excerpt, category, thumbnail, thumbnailAlt, blocks, isCouponPost, isInformativePost, editingId, categories, posts, showNotification, generateId, playDraftSave, useNewEditor, editorJson, editorHtml]);

  const updateFieldWithAutoSave = useCallback((field: string, value: any) => {
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'excerpt':
        setExcerpt(value);
        break;
      case 'category':
        setCategory(value);
        break;
      case 'thumbnail':
        setThumbnail(value);
        break;
      case 'thumbnailAlt':
        setThumbnailAlt(value);
        break;
      case 'isCouponPost':
        setIsCouponPost(value);
        playClick();
        break;
      case 'isInformativePost':
        setIsInformativePost(value);
        playClick();
        break;
    }

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(() => {
      if (isEditing) {
        handleSaveDraft();
      }
    }, AUTO_SAVE_DELAY);
  }, [playClick, handleSaveDraft, isEditing]);

  const updateBlock = useCallback((id: string, field: string, value: any) => {
    let processedValue = value;
    const numericFields = ['rating', 'price', 'originalPrice', 'discountPercentage', 'installments', 'installmentValue'];

    if (numericFields.includes(field) && typeof value === 'string') {
      processedValue = value.replace(/[^\d.,]/g, '');
    }

    setBlocks(prev =>
      prev.map(b => b.id === id ? { ...b, [field]: processedValue } : b)
    );

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(() => {
      if (isEditing) {
        handleSaveDraft();
      }
    }, AUTO_SAVE_DELAY);
  }, [handleSaveDraft, isEditing]);

  const updateListItem = useCallback((blockId: string, itemId: string, field: string, value: any) => {
    let processedValue = value;
    const numericFields = ['rating', 'price', 'originalPrice', 'discountPercentage', 'installments', 'installmentValue'];

    if (numericFields.includes(field) && typeof value === 'string') {
      processedValue = value.replace(/[^\d.,]/g, '');
    }

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === BlockType.PRODUCT_LIST) {
          const items = (b as ProductListBlock).items || [];
          return {
            ...b,
            items: items.map((item: ProductListItem) =>
              item.id === itemId ? { ...item, [field]: processedValue } : item
            ),
          };
        }
        if (b.id === blockId && b.type === BlockType.COUPON_LIST) {
          const items = (b as CouponListBlock).items || [];
          return {
            ...b,
            items: items.map((item: CouponListItem) =>
              item.id === itemId ? { ...item, [field]: processedValue } : item
            ),
          };
        }
        return b;
      })
    );

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(() => {
      if (isEditing) {
        handleSaveDraft();
      }
    }, AUTO_SAVE_DELAY);
  }, [handleSaveDraft, isEditing]);

  const addListItem = useCallback((blockId: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === BlockType.PRODUCT_LIST) {
          const newItem: ProductListItem = {
            id: generateId(),
            title: 'Novo Produto',
            description: '',
            price: '',
            image: '',
            couponCode: '',
            affiliateLink: '#',
            affiliateButtonText: 'VER OFERTA',
            affiliateLogo: '',
            storeName: ''
          };
          const items = (b as ProductListBlock).items || [];
          return {
            ...b,
            items: [...items, newItem],
          };
        }
        if (b.id === blockId && b.type === BlockType.COUPON_LIST) {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const newItem: CouponListItem = {
            id: generateId(),
            title: 'Novo Cupom',
            description: '',
            discount: '10% OFF',
            couponCode: 'CUPOM10',
            affiliateLink: '#',
            expiryDate: getLocalDateISO(nextWeek),
            expiryTime: '',
            affiliateLogo: '',
            storeName: ''
          };
          const items = (b as CouponListBlock).items || [];
          return {
            ...b,
            items: [...items, newItem],
          };
        }
        return b;
      })
    );
    const block = blocks.find(b => b.id === blockId);
    const label = block?.type === BlockType.PRODUCT_LIST ? 'Produto' : 'Cupom';
    playAdd();
    showNotification('success', `${label} adicionado à lista`);
  }, [blocks, generateId, showNotification, playAdd]);

  const removeListItem = useCallback((blockId: string, itemId: string) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId && b.type === BlockType.PRODUCT_LIST) {
          const items = (b as ProductListBlock).items || [];
          return {
            ...b,
            items: items.filter((item: ProductListItem) => item.id !== itemId),
          };
        }
        if (b.id === blockId && b.type === BlockType.COUPON_LIST) {
          const items = (b as CouponListBlock).items || [];
          return {
            ...b,
            items: items.filter((item: CouponListItem) => item.id !== itemId),
          };
        }
        return b;
      })
    );
    const block = blocks.find(b => b.id === blockId);
    const label = block?.type === BlockType.PRODUCT_LIST ? 'Produto' : 'Cupom';
    playDelete();
    showNotification('warning', `${label} removido da lista`);
  }, [blocks, showNotification, playDelete]);

  const handleAddPro = useCallback((blockId: string) => {
    setBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && 'pros' in block) {
          const currentPros = (block as ProductBlock | HotProductBlock | ProsAndConsBlock).pros || [];
          return { ...block, pros: [...currentPros, ''] };
        }
        return block;
      })
    );
    playAdd();
  }, [playAdd]);

  const handleUpdatePro = useCallback((blockId: string, index: number, value: string) => {
    setBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && 'pros' in block) {
          const currentPros = (block as ProductBlock | HotProductBlock | ProsAndConsBlock).pros || [];
          const newPros = [...currentPros];
          newPros[index] = value;
          return { ...block, pros: newPros };
        }
        return block;
      })
    );
  }, []);

  const handleRemovePro = useCallback((blockId: string, index: number) => {
    setBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && 'pros' in block) {
          const currentPros = (block as ProductBlock | HotProductBlock | ProsAndConsBlock).pros || [];
          const newPros = [...currentPros];
          newPros.splice(index, 1);
          return { ...block, pros: newPros };
        }
        return block;
      })
    );
    playDelete();
  }, [playDelete]);

  const handleAddCon = useCallback((blockId: string) => {
    setBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && 'cons' in block) {
          const currentCons = (block as ProductBlock | HotProductBlock | ProsAndConsBlock).cons || [];
          return { ...block, cons: [...currentCons, ''] };
        }
        return block;
      })
    );
    playAdd();
  }, [playAdd]);

  const handleUpdateCon = useCallback((blockId: string, index: number, value: string) => {
    setBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && 'cons' in block) {
          const currentCons = (block as ProductBlock | HotProductBlock | ProsAndConsBlock).cons || [];
          const newCons = [...currentCons];
          newCons[index] = value;
          return { ...block, cons: newCons };
        }
        return block;
      })
    );
  }, []);

  const handleRemoveCon = useCallback((blockId: string, index: number) => {
    setBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && 'cons' in block) {
          const currentCons = (block as ProductBlock | HotProductBlock | ProsAndConsBlock).cons || [];
          const newCons = [...currentCons];
          newCons.splice(index, 1);
          return { ...block, cons: newCons };
        }
        return block;
      })
    );
    playDelete();
  }, [playDelete]);

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    playClick();
    setBlocks(prev => {
      const newBlocks = [...prev];
      if (direction === 'up' && index > 0) {
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      } else if (direction === 'down' && index < newBlocks.length - 1) {
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      }
      return newBlocks;
    });
  }, [playClick]);

  const handleReorderBlocks = useCallback((startIndex: number, endIndex: number) => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      const [removed] = newBlocks.splice(startIndex, 1);
      newBlocks.splice(endIndex, 0, removed);
      return newBlocks;
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    playDelete();
    showNotification('warning', 'Bloco removido');
  }, [showNotification, playDelete]);

  const handleSave = useCallback(async () => {
    if (!title || !excerpt) {
      showNotification('warning', 'Preencha os campos obrigatórios: Título e Resumo');
      return;
    }

    const postData: BlogPost = {
      id: editingId || generateId(),
      title,
      excerpt,
      category,
      thumbnail: thumbnail || 'https://placehold.co/600x400',
      date: getLocalDateISO(),
      publishedAt: editingId
        ? (posts.find(p => p.id === editingId)?.publishedAt || getBrazilDateTimeISO())
        : getBrazilDateTimeISO(),
      blocks,
      isCouponPost,
      isInformativePost,
    };
    const payload = useNewEditor
      ? ({
        ...postData,
        json: editorJson,
        html: editorHtml,
        content: editorHtml,
        jsonContent: editorJson
      } as BlogPost)
      : postData;

    setIsSaving(true);
    showNotification('loading', 'Publicando post...');

    try {
      await addPost(payload, sendPush);

      if (sendPush) {
        showNotification('success', editingId 
          ? 'Post atualizado! Notificação enviada aos inscritos.' 
          : 'Post publicado! Notificação enviada aos inscritos.'
        );
      } else {
        showNotification('success', editingId ? 'Post atualizado com sucesso!' : 'Post publicado com sucesso!');
      }
      playPublishedSuccess();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      showNotification('error', 'Erro ao salvar o post. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [title, excerpt, category, thumbnail, blocks, isCouponPost, isInformativePost, sendPush, editingId, posts, showNotification, addPost, resetForm, generateId, playPublishedSuccess, useNewEditor, editorJson, editorHtml]);

  const handleSetChatOpen = useCallback((open: boolean) => {
    if (open) {
      playImLu();
    } else {
      playGoodBye();
    }
    setIsChatOpenState(open);
  }, [playImLu, playGoodBye]);

  const handleAddPost = useCallback(() => {
    playNewPost();
    resetForm();
    setUseNewEditor(true);
    setIsEditing(true);
  }, [playNewPost, resetForm]);

  const handleAddOffer = useCallback((type: BlockType) => {
    const block = createOfferBlock(type);
    setOfferBlock(block);
    setIsEditingOffer(true);
    setActiveSection('offers');
    playAdd();
  }, [createOfferBlock, playAdd]);

  const fetchStandaloneOffers = useCallback(async () => {
    setOffersLoading(true);
    try {
      const [productsResponse, cuponsResponse] = await Promise.all([
        fetch('/api/get-posts?type=products', { cache: 'no-store' }),
        fetch('/api/get-posts?type=cupons', { cache: 'no-store' })
      ]);

      const productsData = productsResponse.ok ? await productsResponse.json() : [];
      const cuponsData = cuponsResponse.ok ? await cuponsResponse.json() : [];
      const normalizeIndex = (data: any, type: 'products' | 'cupons') => {
        const items = Array.isArray(data) ? data : data?.posts || [];
        if (!Array.isArray(items)) {
          console.error(`Formato inesperado em /api/get-posts?type=${type}`, data);
          return [];
        }
        return items;
      };
      const products = normalizeIndex(productsData, 'products');
      const cupons = normalizeIndex(cuponsData, 'cupons');

      const offers = [...products, ...cupons].filter((item: any) => item?.standaloneOffer);
      offers.sort((a: any, b: any) => {
        const dateA = new Date(a?.publishedAt || a?.date || 0).getTime();
        const dateB = new Date(b?.publishedAt || b?.date || 0).getTime();
        return dateB - dateA;
      });

      setStandaloneOffers(offers);
    } catch {
      showNotification('error', 'Erro ao carregar ofertas independentes');
    } finally {
      setOffersLoading(false);
    }
  }, [showNotification]);

  const handleEditOffer = useCallback((offer: any) => {
    const normalizedType =
      offer.type === 'coupon'
        ? BlockType.COUPON
        : offer.type === 'hot_product'
          ? BlockType.HOT_PRODUCT
          : BlockType.PRODUCT;
    setOfferBlock({ ...offer, type: normalizedType } as Block);
    setIsEditingOffer(true);
    setActiveSection('offers');
  }, []);

  const handleDeleteOffer = useCallback((offer: any) => {
    const title = offer.productName || offer.name || offer.title || 'Oferta';
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir oferta',
      message: `Deseja excluir "${title}"?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        showNotification('loading', 'Excluindo oferta...');
        try {
          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: { id: offer.id, type: offer.type }, action: 'delete_offer' })
          });
          const result = await response.json();
          if (result.success) {
            showNotification('success', 'Oferta excluída com sucesso!');
            fetchStandaloneOffers();
          } else {
            showNotification('error', result.error || 'Erro ao excluir oferta');
          }
        } catch {
          showNotification('error', 'Erro ao excluir oferta');
        }
      }
    });
  }, [fetchStandaloneOffers, showNotification]);

  const handleUpdateOffer = useCallback((field: string, value: any) => {
    setOfferBlock(prev => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const handlePublishOffer = useCallback(async () => {
    if (!offerBlock) return;
    const offerType = offerBlock.type;
    if (![BlockType.PRODUCT, BlockType.HOT_PRODUCT, BlockType.COUPON].includes(offerType)) {
      showNotification('warning', 'Tipo de oferta inválido');
      return;
    }

    const offerCategory = (offerBlock as any).category || categories[0] || 'Geral';
    const now = getBrazilDateTimeISO();
    const payload = {
      ...offerBlock,
      category: offerCategory,
      date: (offerBlock as any).date || now,
      publishedAt: (offerBlock as any).publishedAt || now
    };

    setIsPublishingOffer(true);
    showNotification('loading', 'Publicando oferta...');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: payload, action: 'publish_offer' }),
      });
      const result = await response.json();
      if (result.success) {
        showNotification('success', 'Oferta publicada com sucesso!');
        resetOfferForm();
      } else {
        showNotification('error', result.error || 'Erro ao publicar oferta');
      }
    } catch (error) {
      showNotification('error', 'Erro ao publicar oferta');
    } finally {
      setIsPublishingOffer(false);
    }
  }, [offerBlock, categories, showNotification, resetOfferForm]);

  useEffect(() => {
    if (activeSection === 'offers' && !isEditingOffer) {
      fetchStandaloneOffers();
    }
  }, [activeSection, isEditingOffer, fetchStandaloneOffers]);

  const handleLoadDraft = useCallback((draft: BlogPost) => {
    setTitle(draft.title);
    setExcerpt(draft.excerpt);
    setCategory(draft.category || categories[0] || 'Cupons');
    setThumbnail(draft.thumbnail);
    setThumbnailAlt(draft.thumbnailAlt || '');
    setBlocks(JSON.parse(JSON.stringify(draft.blocks)));
    setIsCouponPost(draft.isCouponPost || false);
    setIsInformativePost(draft.isInformativePost || false);
    setEditorJson((draft as any)?.json || (draft as any)?.jsonContent || null);
    setEditorHtml((draft as any)?.html || (draft as any)?.content || '');
    setUseNewEditor(Boolean((draft as any)?.json || (draft as any)?.jsonContent || (draft as any)?.html || (draft as any)?.content));
    setEditingId(draft.id);
    setIsEditing(true);
    setActiveSection('posts');
    showNotification('info', '📄 Rascunho carregado');

    lastSavedRef.current = JSON.stringify({
      title: draft.title,
      excerpt: draft.excerpt,
      category: draft.category,
      thumbnail: draft.thumbnail,
      thumbnailAlt: draft.thumbnailAlt,
      blocks: draft.blocks,
      isCouponPost: draft.isCouponPost,
      isInformativePost: draft.isInformativePost
    });
  }, [categories, showNotification]);

  const handleDeleteDraft = useCallback(async (id: string) => {
    showNotification('loading', 'Excluindo rascunho...');
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: { id }, action: 'delete_draft' })
      });
      const result = await response.json();
      if (result.success) {
        showNotification('warning', '🗑️ Rascunho excluído');
      } else {
        showNotification('error', result.error || 'Erro ao excluir rascunho');
      }
    } catch {
      showNotification('error', 'Erro ao excluir rascunho');
    }
  }, [showNotification]);

  const handleDeletePost = useCallback((id: string) => {
    const post = posts.find(p => p.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Post',
      message: `Tem certeza que deseja excluir o post "${post?.title}"? Esta ação não pode ser desfeita.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);

        const notificationId = addNotification({
          type: 'loading',
          message: 'Excluindo post...',
          duration: 0
        });

        try {
          await deletePost(id);

          updateNotification(notificationId, {
            type: 'success',
            message: '✅ Post excluído com sucesso!',
            duration: 4000
          });
        } catch (error) {
          console.error('Erro ao excluir post:', error);

          updateNotification(notificationId, {
            type: 'error',
            message: '❌ Erro ao excluir o post. Tente novamente.',
            duration: 5000
          });
        }
      },
    });
  }, [posts, deletePost, addNotification, updateNotification]);

  const handleRefreshPosts = useCallback(async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Recarregar Posts',
      message: 'Recarregar posts do servidor?\nIsso descartará quaisquer alterações não salvas.',
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(null);
        playRefreshSound();
        try {
          const notificationId = addNotification({
            type: 'loading',
            message: '📡 Conectando ao servidor...',
            duration: 0
          });

          setTimeout(() => {
            updateNotification(notificationId, {
              message: '🔍 Buscando posts atualizados...',
              duration: 0
            });
          }, 1000);

          await reloadPosts?.();

          updateNotification(notificationId, {
            type: 'success',
            message: `✅ ${posts.length} posts carregados do servidor`,
            duration: 5000
          });
          playSuccess();

          setTimeout(() => {
            addNotification({
              type: 'info',
              message: `📂 ${categories.length} categorias disponíveis`,
              duration: 3000
            });
          }, 1500);

        } catch (error) {
          console.error('Erro ao recarregar posts:', error);
          addNotification({
            type: 'error',
            message: '❌ Falha na conexão com o servidor',
            duration: 5000
          });
          playError();

          setTimeout(() => {
            addNotification({
              type: 'warning',
              message: '📦 Usando dados locais salvos anteriormente',
              duration: 4000
            });
          }, 1000);
        }
      },
    });
  }, [addNotification, updateNotification, reloadPosts, posts.length, categories.length, playRefreshSound, playSuccess, playError]);

  const handleLogout = useCallback(() => {
    playClick();
    setShowExitModal(true);
  }, [playClick]);

  const handleRepairIndexes = useCallback(async () => {
    const notificationId = addNotification({
      type: 'loading',
      message: 'Reparando índices de posts... Isso pode levar alguns segundos.',
      duration: 0
    });

    try {
      const response = await fetch('/api/admin/repair-index', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        updateNotification(notificationId, {
          type: 'success',
          message: `Índices reparados com sucesso! ${data.count} posts processados.`,
          duration: 5000
        });
        playSuccess();
        if (handleRefreshPosts) handleRefreshPosts();
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao reparar índices:', error);
      updateNotification(notificationId, {
        type: 'error',
        message: `Erro ao reparar índices: ${error.message}`,
        duration: 5000
      });
      playError();
    }
  }, [addNotification, updateNotification, playSuccess, playError, handleRefreshPosts]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      if (notificationDebounceRef.current) {
        clearTimeout(notificationDebounceRef.current);
      }
    };
  }, []);

  const renderContent = useCallback(() => {
    return (
      <ErrorBoundary>
        {(() => {
          if (showPreview) {
            return (
              <PostPreview
                post={{
                  id: editingId || 'preview',
                  title,
                  excerpt,
                  category,
                  thumbnail: thumbnail || 'https://placehold.co/600x400',
                  date: previewDate,
                  publishedAt: previewPublishedAt,
                  blocks,
                  isCouponPost,
                  isInformativePost
                }}
                onBack={() => {
                  setShowPreview(false);
                  setActiveSection('posts');
                }}
              />
            );
          }

          if (isEditing) {
            return (
              <EditPostView
                title={title}
                setTitle={(value) => updateFieldWithAutoSave('title', value)}
                excerpt={excerpt}
                setExcerpt={(value) => updateFieldWithAutoSave('excerpt', value)}
                category={category}
                setCategory={(value) => updateFieldWithAutoSave('category', value)}
                categories={categories}
                thumbnail={thumbnail}
                setThumbnail={(value) => updateFieldWithAutoSave('thumbnail', value)}
                thumbnailAlt={thumbnailAlt}
                setThumbnailAlt={(value) => updateFieldWithAutoSave('thumbnailAlt', value)}
                isCouponPost={isCouponPost}
                setIsCouponPost={(value) => updateFieldWithAutoSave('isCouponPost', value)}
                isInformativePost={isInformativePost}
                setIsInformativePost={(value) => updateFieldWithAutoSave('isInformativePost', value)}
                sendPush={sendPush}
                setSendPush={setSendPush}
                blocks={blocks}
                updateBlock={updateBlock}
                updateListItem={updateListItem}
                handleAddBlock={handleAddBlock}
                addListItem={addListItem}
                removeListItem={removeListItem}
                handleAddPro={handleAddPro}
                handleUpdatePro={handleUpdatePro}
                handleRemovePro={handleRemovePro}
                handleAddCon={handleAddCon}
                handleUpdateCon={handleUpdateCon}
                handleRemoveCon={handleRemoveCon}
                moveBlock={moveBlock}
                removeBlock={removeBlock}
                handleSave={handleSave}
                isSaving={isSaving}
                editingId={editingId}
                onCancel={resetForm}
                onReorderBlocks={handleReorderBlocks}
                updateCategories={handleUpdateCategories}
                isChatOpen={isChatOpen}
                setIsChatOpen={handleSetChatOpen}
                useNewEditor={useNewEditor}
                editorJson={editorJson}
                setEditorJson={setEditorJson}
                editorHtml={editorHtml}
                setEditorHtml={setEditorHtml}
              />
            );
          }

          switch (activeSection) {
            case 'offers': {
              if (!isEditingOffer || !offerBlock) {
                const filteredOffers = standaloneOffers.filter(offer => {
                  const query = offerSearch.toLowerCase();
                  const name = (offer.productName || offer.name || offer.title || '').toLowerCase();
                  return name.includes(query);
                });

                const productOffers = filteredOffers.filter(o => o.type !== 'coupon');
                const couponOffers = filteredOffers.filter(o => o.type === 'coupon');

                return (
                  <div className="space-y-8 max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-lg mb-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <RiShoppingCart2Fill className="text-blue-500" />
                            Ofertas Independentes
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gerencie produtos e cupons que aparecem fora de posts</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              type="text"
                              placeholder="Buscar ofertas..."
                              value={offerSearch}
                              onChange={(e) => setOfferSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                          </div>
                          <button
                            onClick={fetchStandaloneOffers}
                            disabled={offersLoading}
                            className="p-2.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                          >
                            <RefreshCw size={18} className={offersLoading ? "animate-spin" : ""} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl group">
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />

                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Plus size={32} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Criar Nova Oferta</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Escolha o tipo de oferta para começar</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            {
                              type: BlockType.PRODUCT,
                              icon: BsFillHandbagFill,
                              label: 'Produto Simples',
                              desc: 'Link de afiliado e preço',
                              gradient: 'from-blue-500 to-indigo-600',
                              bg: 'bg-blue-50 dark:bg-blue-900/10',
                              border: 'border-blue-100 dark:border-blue-800/50'
                            },
                            {
                              type: BlockType.HOT_PRODUCT,
                              icon: Flame,
                              label: 'Produto Destaque',
                              desc: 'Layout premium carrossel',
                              gradient: 'from-orange-500 to-red-600',
                              bg: 'bg-orange-50 dark:bg-orange-900/10',
                              border: 'border-orange-100 dark:border-orange-800/50'
                            },
                            {
                              type: BlockType.COUPON,
                              icon: IoTicketOutline,
                              label: 'Cupom de Desconto',
                              desc: 'Código e botão copiar',
                              gradient: 'from-emerald-500 to-teal-600',
                              bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                              border: 'border-emerald-100 dark:border-emerald-800/50'
                            }
                          ].map((item) => (
                            <button
                              key={item.type}
                              onClick={() => handleAddOffer(item.type)}
                              className={`p-6 rounded-3xl border ${item.border} ${item.bg} hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left group/btn`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center mb-4 shadow-lg group-hover/btn:scale-110 transition-transform`}>
                                <item.icon size={24} />
                              </div>
                              <h4 className="font-bold text-slate-800 dark:text-white mb-1">{item.label}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BsFillHandbagFill className="text-blue-500" />
                            Produtos ({productOffers.length})
                          </h3>
                        </div>

                        {offersLoading ? (
                          <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-slate-500 font-medium">Carregando produtos...</p>
                          </div>
                        ) : productOffers.length === 0 ? (
                          <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-400 font-medium">Nenhum produto encontrado</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {productOffers.map((offer) => (
                              <div key={offer.id} className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                                    {offer.image || offer.src || offer.thumbnail ? (
                                      <Image
                                        src={offer.image || offer.src || offer.thumbnail}
                                        alt="" width={64} height={64}
                                        className="w-full h-full object-contain p-1"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <BsFillHandbagFill size={20} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                      {offer.productName || offer.name || offer.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${offer.type === 'hot_product'
                                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30'
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30'
                                        }`}>
                                        {offer.type === 'hot_product' ? 'Destaque' : 'Normal'}
                                      </span>
                                      {offer.category && (
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase truncate">
                                          • {offer.category}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">{offer.price || 'Sem preço'}</p>
                                  </div>
                                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditOffer(offer)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                      <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteOffer(offer)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <IoTicketOutline className="text-emerald-500" />
                            Cupons ({couponOffers.length})
                          </h3>
                        </div>

                        {offersLoading ? (
                          <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-slate-500 font-medium">Carregando cupons...</p>
                          </div>
                        ) : couponOffers.length === 0 ? (
                          <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-400 font-medium">Nenhum cupom encontrado</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {couponOffers.map((offer) => (
                              <div key={offer.id} className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30">
                                    <IoTicketOutline size={32} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                      {offer.couponName || offer.name || offer.title || 'Cupom'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                                        {offer.couponCode}
                                      </span>
                                      {offer.category && (
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase truncate">
                                          • {offer.category}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{offer.couponDescription || 'Sem descrição'}</p>
                                  </div>
                                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditOffer(offer)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                      <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteOffer(offer)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Editar Oferta</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Configure os dados e publique</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={resetOfferForm}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handlePublishOffer}
                        disabled={isPublishingOffer}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
                      >
                        {isPublishingOffer ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Publicando...</span>
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            <span>Publicar Oferta</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-lg">
                    {offerBlock.type === BlockType.PRODUCT && (
                      <ProductWidgetEditor
                        block={offerBlock as ProductBlock}
                        onUpdate={handleUpdateOffer}
                        categories={categories}
                        defaultCategory={categories[0]}
                      />
                    )}
                    {offerBlock.type === BlockType.HOT_PRODUCT && (
                      <HotProductWidgetEditor
                        block={offerBlock as HotProductBlock}
                        onUpdate={handleUpdateOffer}
                        categories={categories}
                        defaultCategory={categories[0]}
                      />
                    )}
                    {offerBlock.type === BlockType.COUPON && (
                      <CouponWidgetEditor
                        block={offerBlock as CouponBlock}
                        onUpdate={handleUpdateOffer}
                      />
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-lg">
                    {offerBlock.type === BlockType.PRODUCT && (
                      <ProductWidget data={offerBlock as ProductBlock} layout="horizontal" />
                    )}
                    {offerBlock.type === BlockType.HOT_PRODUCT && (
                      <HotProductWidget data={offerBlock as HotProductBlock} layout="horizontal" />
                    )}
                    {offerBlock.type === BlockType.COUPON && (
                      <CouponWidget data={offerBlock as CouponBlock} />
                    )}
                  </div>
                </div>
              );
            }
            case 'categories':
              return (
                <CategoriesManager
                  categories={categories}
                  updateCategories={handleUpdateCategories}
                  categoryIcons={categoryIcons}
                  updateCategoryIcon={updateCategoryIcon}
                  posts={posts}
                  onNotification={showNotification}
                />
              );
            case 'drafts':
              return (
                <DraftsManager
                  onLoadDraft={handleLoadDraft}
                  onDeleteDraft={handleDeleteDraft}
                />
              );
            case 'settings':
              return (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
                        <RiSettings4Line size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white uppercase tracking-tighter">Configurações</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Personalize sua experiência no painel</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
                              {theme === 'dark' ? <HiOutlineMoon size={24} /> : <HiOutlineSun size={24} />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 dark:text-white">Tema Visual</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Alterne entre os modos claro e escuro</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { toggleTheme(); playClick(); }}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-xl">
                            <RiToolsLine size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">Manutenção</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ferramentas de reparo e diagnóstico</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <button
                            onClick={handleRepairIndexes}
                            className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Reparar Índices de Posts</span>
                              <RiToolsLine className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Reconstrói o arquivo de índice (posts-index.json) recalculando metadados (cupons, produtos, etc.) para todos os posts. Use se os cards estiverem com estilos incorretos.
                            </p>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                            <HiOutlineInformationCircle size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">Informações do Sistema</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Detalhes da versão e ambiente</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Versão</p>
                            <p className="text-sm font-semibold dark:text-white">1.2.0-beta</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Ambiente</p>
                            <p className="text-sm font-semibold dark:text-white">Produção (Vercel)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            case 'posts':
            default:
              return (
                <PostsListView
                  posts={posts}
                  loading={loading}
                  categories={categories}
                  onEditPost={handleEdit}
                  onDeletePost={handleDeletePost}
                  onAddPost={handleAddPost}
                  onRefreshPosts={handleRefreshPosts}
                />
              );
          }
        })()}
      </ErrorBoundary>
    );
  }, [
    showPreview, editingId, title, excerpt, category, thumbnail, thumbnailAlt, blocks, isCouponPost, isInformativePost, sendPush, posts, loading,
    previewDate, previewPublishedAt,
    isEditing, isEditingOffer, offerBlock, isPublishingOffer, activeSection, categories, categoryIcons, updateCategoryIcon, updateFieldWithAutoSave, updateBlock, updateListItem,
    handleAddBlock, addListItem, removeListItem, handleAddPro, handleUpdatePro, handleRemovePro,
    handleAddCon, handleUpdateCon, handleRemoveCon, moveBlock, removeBlock, handleSave,
    isSaving, resetForm, resetOfferForm, handleReorderBlocks, handleUpdateCategories, showNotification,
    handleLoadDraft, handleDeleteDraft, handleEdit, handleDeletePost, handleRefreshPosts, handleAddPost, handleAddOffer, handleUpdateOffer, handlePublishOffer, handleRepairIndexes, theme, toggleTheme, playClick, isChatOpen, handleSetChatOpen, useNewEditor, editorJson, editorHtml, standaloneOffers, offersLoading, fetchStandaloneOffers, handleEditOffer, handleDeleteOffer, offerSearch
  ]);

  const getTitle = useCallback(() => {
    if (showPreview) return 'Prévia do Post';
    if (isEditing) return editingId ? 'Editar Post' : 'Criar Novo Post';
    if (isEditingOffer) return 'Criar Oferta';
    return activeSection === 'posts' ? 'Posts' :
      activeSection === 'offers' ? 'Adicionar Ofertas' :
        activeSection === 'drafts' ? 'Rascunhos' :
          activeSection === 'categories' ? 'Categorias' : 'Configurações';
  }, [showPreview, isEditing, editingId, activeSection, isEditingOffer]);

  return (
    <>
      <AdminLayout
        title={getTitle()}
        onBack={isEditing || showPreview || isEditingOffer ? () => {
          playBacking();
          if (showPreview) {
            setShowPreview(false);
            setActiveSection('posts');
            addNotification({
              type: 'info',
              message: '← Retornado à lista de posts',
              duration: 3000
            });
          } else if (isEditingOffer) {
            resetOfferForm();
            addNotification({
              type: 'info',
              message: '← Retornado às ofertas',
              duration: 3000
            });
          } else {
            addNotification({
              type: 'warning',
              message: '📝 Edição cancelada - Alterações descartadas',
              duration: 4000
            });
            resetForm();
          }
        } : undefined}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={(section: string) => {
          if (!isEditing && !showPreview && !isEditingOffer) {
            if (section === 'posts') {
              playSectionInitial();
            } else if (section === 'categories') {
              playCategoriesSound();
            } else {
              playClick();
            }
            setActiveSection(section as any);
          }
        }}
        onLogout={handleLogout}
        onSaveDraft={isEditing ? handleSaveDraft : undefined}
        showSaveButton={isEditing}
        saveDraftDisabled={!title?.trim()}
        theme={theme}
        toggleTheme={toggleTheme}
        rightSidebarOpen={isChatOpen}
        onRightSidebarClose={() => handleSetChatOpen(false)}
        onRightSidebarToggle={() => handleSetChatOpen(!isChatOpen)}
        rightSidebar={
          <AIChat
            isOpen={isChatOpen}
            onClose={() => handleSetChatOpen(false)}
            mode="docked"
          />
        }
      >
        {renderContent()}
      </AdminLayout>

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          type={confirmDialog.type}
        />
      )}
      <RobotModal
        isOpen={showExitModal}
        title="Confirmar saída"
        message="Deseja sair da área Administrativa?"
        confirmText="Sair"
        cancelText="Ficar"
        showCancel={true}
        onCancel={() => {
          setShowExitModal(false);
          playExitCanceled();
        }}
        onConfirm={() => {
          setShowExitModal(false);
          playExitConfirmedRest();
          setTimeout(() => {
            window.location.href = '/';
          }, 300);
        }}
      />

    </>
  );
};

export default Admin;