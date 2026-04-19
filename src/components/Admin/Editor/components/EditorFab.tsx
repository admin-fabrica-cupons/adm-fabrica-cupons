import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Plus,
  Image as ImageIcon,
  Package,
  Gift,
  Settings,
  Table as TableIcon,
  List,
  ThumbsUp,
  Info,
  Quote,
  Zap,
  BookOpen,
} from 'lucide-react';
import { IoTicketOutline } from 'react-icons/io5';
import { TbShoppingBagPlus, TbShoppingCartPlus } from 'react-icons/tb';
import { TfiLayoutSlider } from 'react-icons/tfi';
import { LuTickets } from 'react-icons/lu';

interface EditorFabProps {
  editor: Editor;
}

type WidgetType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'image_slides'
  | 'product'
  | 'product_list'
  | 'hot_product'
  | 'coupon'
  | 'coupon_list'
  | 'table'
  | 'accordion'
  | 'pros_and_cons'
  | 'note_of_editor'
  | 'citation'
  | 'related_posts';

const widgetDescriptions: Record<WidgetType, string> = {
  heading: 'Adicionar um titulo H2',
  paragraph: 'Adicionar um paragrafo de texto',
  image: 'Inserir uma imagem',
  image_slides: 'Carrossel de imagens',
  product: 'Widget de produto com detalhes',
  product_list: 'Lista de produtos em grade',
  hot_product: 'Produto em destaque',
  coupon: 'Widget de cupom de desconto',
  coupon_list: 'Lista de cupons',
  table: 'Tabela comparativa',
  accordion: 'Seções colapsáveis (FAQ)',
  pros_and_cons: 'Lista de prós e contras',
  note_of_editor: 'Nota informativa do editor',
  citation: 'Bloco de citação',
  related_posts: 'Posts relacionados (Leia também)',
};

export const EditorFab: React.FC<EditorFabProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const safeInsert = (node: any) => {
    (editor as any).chain().focus().insertContentAt((editor.state.selection.$to.pos), { type: 'paragraph' }).insertContent(node).run();
  };

  const createCouponAttrs = () => ({
    id: generateId(),
    name: '',
    discount: '',
    couponCode: '',
    hideCode: false,
    affiliateLink: '',
    affiliateButtonText: '',
    affiliateLogo: '',
    showStoreLogo: true,
    isExpired: false,
    expiryDate: '',
    expiryTime: '',
    storeName: '',
    customStoreName: '',
    description: '',
    items: [],
  });

  const createProductAttrs = () => ({
    id: generateId(),
    productName: '',
    price: '',
    originalPrice: '',
    rating: 0,
    productLink: '',
    affiliateLink: '',
    affiliateButtonText: '',
    pros: [],
    cons: [],
    productLayout: 'default',
    soldCount: '',
    ranking: '',
    category: '',
    description: '',
    affiliateLogo: '',
    showStoreLogo: true,
    storeName: '',
    manualStoreName: '',
    images: [],
    allImages: [],
    couponCode: '',
    name: '',
    isExpired: false,
    hideCode: false,
    discount: '',
    badge: '',
  });

  const createHotProductAttrs = () => ({
    id: generateId(),
    productName: '',
    price: '',
    originalPrice: '',
    rating: 0,
    productLink: '',
    affiliateLink: '',
    affiliateButtonText: '',
    pros: [],
    cons: [],
    soldCount: '',
    ranking: '',
    category: '',
    description: '',
    badge: '',
    src: '',
    images: [],
    allImages: [],
    affiliateLogo: '',
    showStoreLogo: true,
    storeName: '',
    manualStoreName: '',
    productLayout: 'default',
    couponCode: '',
    name: '',
    isExpired: false,
    hideCode: false,
    discount: '',
  });

  const createAccordionAttrs = () => ({
    id: generateId(),
    accordionItems: [
      { id: generateId(), title: 'Item 1', content: '', isOpen: true },
    ],
    accordionColor: 'blue',
  });

  const createProductListAttrs = () => ({
    id: generateId(),
    items: [
      {
        id: generateId(),
        title: 'Produto 1',
        price: '',
        originalPrice: '',
        rating: 0,
        image: '',
        affiliateLink: '',
        affiliateButtonText: '',
        storeName: '',
      },
    ],
    listType: 'grid',
    columns: 3,
    rankSize: 3,
    showImages: true,
    showPrices: true,
    showCoupons: true,
    title: '',
    description: '',
  });

  const createCouponListAttrs = () => ({
    id: generateId(),
    items: [
      {
        id: generateId(),
        title: 'Cupom 1',
        couponCode: '',
        discount: '',
        storeName: '',
        affiliateLink: '',
        affiliateButtonText: '',
      },
    ],
    listType: 'list',
    columns: 2,
    showDescriptions: true,
    showStoreInfo: true,
    storeName: '',
    customStoreName: '',
    affiliateButtonText: '',
    title: '',
  });

  const createImageSlidesAttrs = () => ({
    id: generateId(),
    images: [],
    allImages: [],
    slideInterval: 5000,
    showNavigation: true,
    showIndicators: true,
  });

  const createTableAttrs = () => ({
    id: generateId(),
    headers: ['Coluna 1', 'Coluna 2'],
    rows: [
      {
        id: generateId(),
        cells: [
          { id: generateId(), content: 'A1', isHeader: false, imageSrc: '', imageAlt: '', alignX: 'left', alignY: 'middle' },
          { id: generateId(), content: 'B1', isHeader: false, imageSrc: '', imageAlt: '', alignX: 'left', alignY: 'middle' },
        ],
      },
    ],
    caption: '',
    showBorders: true,
    striped: true,
  });

  const createProsConsAttrs = () => ({
    id: generateId(),
    pros: ['Ponto positivo'],
    cons: ['Ponto negativo'],
  });
  const createNoteOfEditorAttrs = () => ({
    id: generateId(),
    variant: 'info',
    title: 'Info',
    content: 'Digite a nota do editor aqui.',
  });
  const createCitationAttrs = () => ({
    id: generateId(),
    text: 'Digite a citação aqui.',
    source: '',
  });
  const createRelatedPostsAttrs = () => ({
    id: generateId(),
    posts: [],
  });

  const handleWidgetAction = (type: WidgetType) => {
    switch (type) {
      case 'heading':
        (editor as any).chain().focus().setNode('heading', { level: 2 }).run();
        break;
      case 'paragraph':
        (editor as any).chain().focus().setParagraph().run();
        break;
      case 'image':
        window.dispatchEvent(new CustomEvent('tiptap-open-image-dialog', { detail: { src: '', alt: '' } }));
        break;
      case 'image_slides':
        safeInsert({ type: 'image_slides', attrs: createImageSlidesAttrs() });
        break;
      case 'product':
        safeInsert({ type: 'product', attrs: createProductAttrs() });
        break;
      case 'product_list':
        safeInsert({ type: 'product_list', attrs: createProductListAttrs() });
        break;
      case 'hot_product':
        safeInsert({ type: 'hot_product', attrs: createHotProductAttrs() });
        break;
      case 'coupon':
        safeInsert({ type: 'coupon', attrs: createCouponAttrs() });
        break;
      case 'coupon_list':
        safeInsert({ type: 'coupon_list', attrs: createCouponListAttrs() });
        break;
      case 'table':
        safeInsert({ type: 'table', attrs: createTableAttrs() });
        break;
      case 'accordion':
        safeInsert({ type: 'accordion', attrs: createAccordionAttrs() });
        break;
      case 'pros_and_cons':
        safeInsert({ type: 'pros_and_cons', attrs: createProsConsAttrs() });
        break;
      case 'note_of_editor':
        safeInsert({ type: 'note_of_editor', attrs: createNoteOfEditorAttrs() });
        break;
      case 'citation':
        safeInsert({ type: 'citation', attrs: createCitationAttrs() });
        break;
      case 'related_posts':
        safeInsert({ type: 'related_posts', attrs: createRelatedPostsAttrs() });
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const blockCategories = [
    {
      id: 'media',
      label: 'Midia',
      icon: <ImageIcon size={14} />,
      items: [
        { type: 'image', label: 'Imagem', icon: <ImageIcon size={14} /> },
        { type: 'image_slides', label: 'Slides', icon: <TfiLayoutSlider size={14} /> },
      ],
    },
    {
      id: 'products',
      label: 'Produtos',
      icon: <Package size={14} />,
      items: [
        { type: 'product', label: 'Produto', icon: <TbShoppingBagPlus size={14} /> },
        { type: 'product_list', label: 'Lista Produtos', icon: <TbShoppingCartPlus size={14} /> },
        { type: 'hot_product', label: 'Produto Destaque', icon: <Zap size={14} /> },
      ],
    },
    {
      id: 'coupons',
      label: 'Cupons',
      icon: <Gift size={14} />,
      items: [
        { type: 'coupon', label: 'Cupom', icon: <IoTicketOutline size={14} /> },
        { type: 'coupon_list', label: 'Lista Cupons', icon: <LuTickets size={14} /> },
      ],
    },
    {
      id: 'utils',
      label: 'Utilitarios',
      icon: <Settings size={14} />,
      items: [
        { type: 'table', label: 'Tabela', icon: <TableIcon size={14} /> },
        { type: 'accordion', label: 'Acordions', icon: <List size={14} /> },
        { type: 'pros_and_cons', label: 'Pros e Contras', icon: <ThumbsUp size={14} /> },
        { type: 'note_of_editor', label: 'Nota do Editor', icon: <Info size={14} /> },
        { type: 'citation', label: 'Citacao', icon: <Quote size={14} /> },
        { type: 'related_posts', label: 'Leia tambem', icon: <BookOpen size={14} /> },
      ],
    },
  ] as const;

  const getBlockButtonStyles = (type: WidgetType) => {
    switch (type) {
      case 'product':
      case 'product_list':
      case 'hot_product':
        return 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200 hover:border-cyan-300 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800';
      case 'coupon':
      case 'coupon_list':
        return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'heading':
      case 'paragraph':
        return 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-300 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800';
      case 'image':
      case 'image_slides':
        return 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200 hover:border-pink-300 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800';
      case 'table':
      case 'pros_and_cons':
      case 'accordion':
      case 'note_of_editor':
      case 'citation':
      case 'related_posts':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 hover:border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const getCategoryTitleColor = (id: string) => {
    switch (id) {
      case 'writing':
        return 'text-slate-500 dark:text-slate-400';
      case 'media':
        return 'text-pink-600 dark:text-pink-400';
      case 'products':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'coupons':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'utils':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="absolute right-6 bottom-6 z-[100002]">
      <Tooltip.Provider delayDuration={200}>
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="h-14 w-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                  <Plus size={24} className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
              </Popover.Trigger>
            </Tooltip.Trigger>
            {!isOpen && (
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-[100003] rounded-lg bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-lg animate-in fade-in zoom-in-95 duration-150"
                  side="left"
                  sideOffset={8}
                >
                  Adicionar Widget
                  <Tooltip.Arrow className="fill-slate-900 dark:fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </Tooltip.Root>
          <Popover.Portal>
            <Popover.Content
              className="z-[100001] w-[min(90vw,360px)] max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-4 animate-in slide-in-from-bottom-2 fade-in duration-200 custom-scrollbar mb-3"
              side="top"
              align="end"
              sideOffset={10}
              collisionPadding={10}
            >
              <div className="space-y-3">
                {blockCategories.map(category => (
                  <div key={category.id} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2">
                    <div className={`text-[10px] font-semibold uppercase tracking-wider ${getCategoryTitleColor(category.id)} mb-2`}>
                      {category.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map(item => (
                        <Tooltip.Root key={`${category.id}-${item.type}`}>
                          <Tooltip.Trigger asChild>
                            <button
                              type="button"
                              onClick={() => handleWidgetAction(item.type as WidgetType)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 border shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${getBlockButtonStyles(item.type as WidgetType)}`}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="z-[100003] max-w-[200px] rounded-lg bg-slate-900 dark:bg-white px-3 py-2 text-[11px] text-white dark:text-slate-900 shadow-lg animate-in fade-in zoom-in-95 duration-150"
                              side="bottom"
                              sideOffset={6}
                            >
                              {widgetDescriptions[item.type as WidgetType]}
                              <Tooltip.Arrow className="fill-slate-900 dark:fill-white" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Popover.Arrow className="fill-white dark:fill-slate-900" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </Tooltip.Provider>
    </div>
  );
};
