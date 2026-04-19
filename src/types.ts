// types.ts atualizado
export type ViewMode = 'grid' | 'cupons' | 'list' | 'informativo';

export enum BlockType {
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  COUPON = 'coupon',
  HEADING = 'heading',
  PRODUCT = 'product',
  PRODUCT_LIST = 'product_list',
  COUPON_LIST = 'coupon_list',
  HOT_PRODUCT = 'hot_product',
  TABLE = 'table',
  PROS_AND_CONS = 'pros_and_cons',
  IMAGE_SLIDES = 'image_slides',
  ACCORDION = 'accordion',
  RELATED_POSTS = 'related_posts',
}

export interface BaseListItem {
  id: string;
  title: string;
  description?: string;
  storeName?: string;
  affiliateLink?: string;
  affiliateButtonText?: string;
  affiliateLogo?: string;
  showStoreLogo?: boolean;
  category?: string;

  // Propriedades de Origem (Atomic Sync)
  originPostId?: string;
  originPostCategory?: string;
  originPostTitle?: string;
  originPostDate?: string;
  originPostSlug?: string;
}

export interface ProductListItem extends BaseListItem {
  widgetType?: 'ProductListWidget' | 'ProductWidget' | 'HotProductWidget';
  price?: string;
  originalPrice?: string;
  discount?: string;
  rating?: number;
  image?: string;
  images?: string[];
  pros?: string[];
  cons?: string[];
  soldCount?: string;
  ranking?: string;
  tagRanking?: string;
  // Campos que podem ser usados por hot products
  badge?: string;
  // Compatibilidade com código antigo
  productName?: string;
  couponCode?: string;
  couponName?: string;
  hideCode?: boolean;
  isExpired?: boolean;
}

export interface CouponListItem extends BaseListItem {
  widgetType?: 'CouponListWidget' | 'CouponWidget';
  couponCode?: string;
  couponName?: string;
  hideCode?: boolean;
  discount?: string;
  isExpired?: boolean;
  expiryDate?: string;
  expiryTime?: string;
  // Compatibilidade
  name?: string;
}

export type ListItem = ProductListItem | CouponListItem;

export interface TableCell {
  id: string;
  content: string;
  isHeader?: boolean;
  colSpan?: number;
  rowSpan?: number;
  imageSrc?: string;
  imageAlt?: string;
  alignX?: 'left' | 'center' | 'right';
  alignY?: 'top' | 'middle' | 'bottom';
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TextBlock {
  type: 'text' | 'heading' | 'paragraph' | 'list';
  content: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: BlockType.PARAGRAPH;
  content: string;
}

export interface HeadingBlock extends BaseBlock {
  type: BlockType.HEADING;
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageBlock extends BaseBlock {
  type: BlockType.IMAGE;
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  imageRatio?: string;
  imageSize?: string;
}

export interface ImageSlidesBlock extends BaseBlock {
  type: BlockType.IMAGE_SLIDES;
  images: string[];
  allImages?: { id: string; src: string; alt?: string }[];
  slideInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  content?: string;
}

export interface CouponBlock extends BaseBlock {
  type: BlockType.COUPON;
  name?: string;
  discount?: string;
  couponCode?: string;
  hideCode?: boolean;
  affiliateLink?: string;
  affiliateButtonText?: string;
  affiliateLogo?: string;
  showStoreLogo?: boolean;
  isExpired?: boolean;
  expiryDate?: string;
  expiryTime?: string;
  storeName?: string;
  customStoreName?: string;
  description?: string;
  items?: any[];
}

export interface ProductBlock extends BaseBlock {
  type: BlockType.PRODUCT;
  productName?: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
  productLink?: string;
  affiliateLink?: string;
  affiliateButtonText?: string;
  pros?: string[];
  cons?: string[];
  productLayout?: 'default' | 'compact' | 'highlight';
  soldCount?: string;
  ranking?: string;
  tagRanking?: string;
  category?: string;
  description?: string;
  affiliateLogo?: string;
  showStoreLogo?: boolean;
  storeName?: string;
  manualStoreName?: string;
  images?: string[];
  allImages?: { id: string; src: string; alt?: string }[];
  couponCode?: string;
  name?: string;
  isExpired?: boolean;
  hideCode?: boolean;
  discount?: string;
  src?: string;
  badge?: string;
}

export interface HotProductBlock extends BaseBlock {
  type: BlockType.HOT_PRODUCT;
  productName?: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
  productLink?: string;
  affiliateLink?: string;
  affiliateButtonText?: string;
  pros?: string[];
  cons?: string[];
  soldCount?: string;
  ranking?: string;
  tagRanking?: string;
  category?: string;
  description?: string;
  badge?: string;
  src?: string;
  images?: string[];
  allImages?: { id: string; src: string; alt?: string }[];
  affiliateLogo?: string;
  showStoreLogo?: boolean;
  storeName?: string;
  manualStoreName?: string;
  productLayout?: 'default' | 'compact' | 'highlight';
  couponCode?: string;
  name?: string;
  isExpired?: boolean;
  hideCode?: boolean;
  discount?: string;
}

export interface ProductListBlock extends BaseBlock {
  type: BlockType.PRODUCT_LIST;
  items?: ProductListItem[];
  listType?: 'grid' | 'list' | 'carousel' | 'rank' | 'vertical' | 'podium';
  columns?: number;
  rankSize?: 3 | 5;
  showImages?: boolean;
  showPrices?: boolean;
  showCoupons?: boolean;
  // Some lists might have a title/content
  content?: string;
  title?: string;
  description?: string; // Added description
  name?: string; // Compatibilidade
}

export interface CouponListBlock extends BaseBlock {
  type: BlockType.COUPON_LIST;
  items?: CouponListItem[];
  listType?: 'grid' | 'list' | 'carousel' | 'rank' | 'vertical' | 'podium';
  columns?: number;
  showDescriptions?: boolean;
  showStoreInfo?: boolean;
  storeName?: string; // Usado para filtrar ou exibir nome da loja
  customStoreName?: string;
  affiliateButtonText?: string;
  // Some lists might have a title/content
  content?: string;
  title?: string;
}

export interface TableBlock extends BaseBlock {
  type: BlockType.TABLE;
  rows?: TableRow[];
  headers?: string[];
  caption?: string;
  showBorders?: boolean;
  striped?: boolean;
}

export interface ProsAndConsBlock extends BaseBlock {
  type: BlockType.PROS_AND_CONS;
  pros?: string[];
  cons?: string[];
}

export interface AccordionBlock extends BaseBlock {
  type: BlockType.ACCORDION;
  accordionItems?: AccordionItem[];
  accordionColor?: 'blue' | 'green' | 'orange' | 'purple' | 'slate';
  // Common items prop fallback
  items?: any[];
}

// Helper interface for Accordion items
export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  isOpen?: boolean;
}

export interface RelatedPostItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
}

export interface RelatedPostsBlock extends BaseBlock {
  type: BlockType.RELATED_POSTS;
  posts: RelatedPostItem[];
}

// Union Type
export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | ImageSlidesBlock
  | CouponBlock
  | ProductBlock
  | HotProductBlock
  | ProductListBlock
  | CouponListBlock
  | TableBlock
  | ProsAndConsBlock
  | AccordionBlock
  | RelatedPostsBlock;

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  thumbnailAlt?: string; // Novo campo para texto alternativo da imagem
  imageUrl?: string; // Cover image URL
  category: string;
  date: string;
  publishedAt: string;
  blocks: Block[];
  content?: string | object; // HTML Content from new editor
  jsonContent?: any; // JSON Content from new editor
  isCouponPost?: boolean;
  isInformativePost?: boolean; // NOVA PROPRIEDADE
  lastModified?: string;
  itemsSummary?: any[]; // Novo: Resumo de itens para o índice
  slug?: string;
  totalCoupons?: number;
  hasHotProduct?: boolean;
}

export interface DraftPost extends BlogPost {
  lastModified: string;
}

export type Theme = 'light' | 'dark';

export interface PostContextType {
  posts: BlogPost[];
  loading?: boolean;
  getPost?: (id: string) => Promise<BlogPost | undefined>;
  addPost: (post: BlogPost) => void;
  deletePost: (id: string) => void;
  updatePost?: (post: BlogPost) => void;
  theme?: Theme;
  toggleTheme?: () => void;
}
