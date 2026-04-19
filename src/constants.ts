import { BlogPost, BlockType } from './types';

// Helper function to calculate expiry status
export const calculateExpiryStatus = (expiryDate?: string, expiryTime?: string) => {
  if (!expiryDate) {
    return {
      expired: false,
      text: 'Sem expiração',
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50',
      dot: 'bg-emerald-500',
      urgent: false,
      icon: 'calendar'
    };
  }

  const now = new Date();
  const dateStr = expiryTime ? `${expiryDate}T${expiryTime}` : `${expiryDate}T23:59:59`;
  const expiry = new Date(dateStr);
  const remainingTime = expiry.getTime() - now.getTime();

  if (remainingTime <= 0) {
    return {
      expired: true,
      remainingTime,
      text: 'Expirado',
      className: 'bg-gray-100 text-gray-600 dark:bg-slate-900/80 dark:text-slate-200 border border-gray-200 dark:border-slate-700',
      dot: 'bg-gray-400',
      urgent: false,
      icon: 'calendar'
    };
  }

  const minutes = Math.floor(remainingTime / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryDateOnly = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const isToday = nowDate.getTime() === expiryDateOnly.getTime();

  let text = 'Válido';
  let urgent = false;
  let icon = 'calendar';

  if (remainingTime < 60 * 60 * 1000) {
    text = 'O cupom está acabando!';
    urgent = true;
    icon = 'clock';
  } else if (isToday) {
    const safeHours = Math.max(1, Math.ceil(remainingTime / (60 * 60 * 1000)));
    text = `Expira em ${safeHours} ${safeHours === 1 ? 'hora' : 'horas'}`;
    icon = 'clock';
  } else if (remainingTime <= 7 * 24 * 60 * 60 * 1000) {
    const safeDays = Math.max(1, Math.ceil(remainingTime / (24 * 60 * 60 * 1000)));
    text = `Expira em ${safeDays} ${safeDays === 1 ? 'dia' : 'dias'}`;
  } else {
    text = `Expira em ${expiry.toLocaleDateString('pt-BR')}`;
  }

  return {
    expired: false,
    remainingTime,
    text,
    className: urgent
      ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 border border-red-200 dark:border-red-800/50'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50',
    dot: urgent ? 'bg-red-500' : 'bg-emerald-500',
    urgent,
    icon
  };
};

// Lojas parceiras padrão com suas configurações de cores e gradientes
export const PARTNER_STORES = {
  'Mercado Livre': {
    badgeBackground: 'bg-gradient-to-r from-yellow-300 to-yellow-500',
    badgeTextColor: 'text-gray-900',
    couponBackground: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-200',
    shadowColor: 'shadow-yellow-500/10',
    logoUrl: 'https://vetores.org/d/mercado-livre.svg'
  },
  'Amazon': {
    badgeBackground: 'bg-gradient-to-r from-orange-400 to-yellow-500',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-orange-50 to-amber-100',
    borderColor: 'border-orange-200',
    shadowColor: 'shadow-orange-500/10',
    logoUrl: 'https://vetores.org/d/amazon.svg'
  },
  'Shopee': {
    badgeBackground: 'bg-gradient-to-r from-orange-500 to-red-500',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-orange-50 to-red-50',
    borderColor: 'border-orange-200',
    shadowColor: 'shadow-orange-500/10',
    logoUrl: 'https://vetores.org/d/shopee.svg'
  },
  'Magalu': {
    badgeBackground: 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-blue-50 to-purple-50',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-500/10',
    logoUrl: 'https://logodownload.org/wp-content/uploads/2014/06/magalu-logo-1.png'
  },
  'Americanas': {
    badgeBackground: 'bg-gradient-to-r from-red-500 to-pink-500',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-red-50 to-pink-50',
    borderColor: 'border-red-200',
    shadowColor: 'shadow-red-500/10',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Lojas_Americanas_Logo.svg/3840px-Lojas_Americanas_Logo.svg.png'
  },
  'Submarino': {
    badgeBackground: 'bg-gradient-to-r from-blue-400 to-cyan-500',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-500/10',
    logoUrl: 'https://logodownload.org/wp-content/uploads/2014/06/submarino-logo-1-1.png'
  },
  'AliExpress': {
    badgeBackground: 'bg-gradient-to-r from-red-500 to-orange-500',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-red-50 to-orange-50',
    borderColor: 'border-red-200',
    shadowColor: 'shadow-red-500/10',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Aliexpress_logo.svg/1280px-Aliexpress_logo.svg.png'
  },
  'Netshoes': {
    badgeBackground: 'bg-gradient-to-r from-green-500 to-emerald-600',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    shadowColor: 'shadow-green-500/10',
    logoUrl: 'https://d3a0dcqzwu0eh0.cloudfront.net/images/350_extfrtem0iztgipxdusc.png'
  },
  'Centauro': {
    badgeBackground: 'bg-gradient-to-r from-green-600 to-teal-600',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-green-50 to-teal-50',
    borderColor: 'border-green-200',
    shadowColor: 'shadow-green-500/10',
    logoUrl: 'https://images-service.weare365.io/h:0/w:1920/f:webp/plain/gs://agentgoat-prod-strapi-images/centauro_Custom_53c19b3952.png'
  },
  'Casas Bahia': {
    badgeBackground: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-500/10',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Casas_Bahia_logo_2020.svg/3840px-Casas_Bahia_logo_2020.svg.png'
  },
  'Fast Shop': {
    badgeBackground: 'bg-gradient-to-r from-purple-500 to-pink-600',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    shadowColor: 'shadow-purple-500/10',
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/11/fast-shop-logo-1.png'
  },
  'Kabum': {
    badgeBackground: 'bg-gradient-to-r from-green-500 to-lime-500',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-green-50 to-lime-50',
    borderColor: 'border-green-200',
    shadowColor: 'shadow-green-500/10',
    logoUrl: 'https://logodownload.org/wp-content/uploads/2017/11/kabum-logo-1.png'
  },
  'Dell': {
    badgeBackground: 'bg-gradient-to-r from-blue-600 to-blue-800',
    badgeTextColor: 'text-white',
    couponBackground: 'bg-gradient-to-br from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-500/10',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dell_logo.svg/1280px-Dell_logo.svg.png'
  }
};

// Loja padrão fallback
export const DEFAULT_STORE = {
  badgeBackground: 'bg-gradient-to-r from-gray-400 to-gray-600',
  badgeTextColor: 'text-white',
  couponBackground: 'bg-gradient-to-br from-gray-50 to-gray-100',
  borderColor: 'border-gray-200',
  shadowColor: 'shadow-gray-500/10'
};

export const CATEGORIES = [
  'Tecnologia',
  'Eletrônicos',
  'Moda',
  'Beleza',
  'Casa',
  'Viagem',
  'Games',
  'Automóveis',
  'Livros',
  'Saúde'
];

export const STORE_THEMES: Record<string, any> = {
  'Mercado Livre': {
    container: 'from-[#FFE600] to-[#FFF176] text-[#333333]',
    text: 'text-[#3483FA]',
    brand: 'text-[#3483FA]',
    badge: 'bg-[#3483FA] text-white',
    button: 'bg-[#3483FA] hover:bg-[#2968C8] text-white',
    code: 'bg-white border-[#3483FA] text-[#3483FA]',
    storeBadge: 'bg-[#FFE600] text-[#3483FA] border-[#FFF176]'
  },
  'Amazon': {
    container: 'from-[#ffff] via-[#FFFF] to-white text-black dark:from-[#131A22] dark:to-[#131A22] dark:text-white',
    text: 'text-black dark:text-[#FF9900]',
    brand: 'text-black',
    badge: 'bg-[#FF9900] text-black',
    button: 'bg-[#FF9900] hover:bg-[#e68a00] text-black font-bold',
    code: 'bg-white border-orange-500 text-black dark:bg-black dark:border-orange-400 dark:text-white',
    storeBadge: 'bg-[#FF9900] text-black border-[#FF9900]'
  },
  'Shopee': {
    container: 'from-[#EE4D2D] to-[#EE4D2D] text-white',
    text: 'text-white',
    brand: 'text-[#EE4D2D]',
    badge: 'bg-white/20 text-white border-white/30',
    button: 'bg-white text-[#EE4D2D] hover:bg-gray-100',
    code: 'bg-black/10 border-white/20 text-white',
    storeBadge: 'bg-[#EE4D2D] text-white border-[#D73211]'
  },
  'Magalu': {
    container: 'from-[#0086FF] to-[#0086FF] text-white',
    text: 'text-white',
    brand: 'text-[#0086FF]',
    badge: 'bg-white text-[#0086FF]',
    button: 'bg-white text-[#0086FF] hover:bg-gray-100 font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    rainbowBorder: true,
    storeBadge: 'bg-[#0086FF] text-white border-[#0075E0]'
  },
  'Casas Bahia': {
    container: 'from-[#0033A0] to-[#0033A0] text-white',
    text: 'text-white',
    brand: 'text-[#0033A0]',
    badge: 'bg-white text-[#0033A0]',
    button: 'bg-[#E30613] hover:bg-[#c70510] text-white font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    storeBadge: 'bg-gradient-to-br from-[#0033A0] via-[#0033A0] to-[#E30613] text-[#fff] border-transparent'
  },
  'Americanas': {
    container: 'from-[#E30613] to-[#E30613] text-white',
    text: 'text-white',
    brand: 'text-[#E30613]',
    badge: 'bg-white text-[#E30613]',
    button: 'bg-white hover:bg-gray-100 text-[#E30613] font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    storeBadge: 'bg-[#E30613] text-white border-[#C20510]'
  },
  'Submarino': {
    container: 'from-white to-[#E6F2FB] text-[#0071C5]',
    text: 'text-[#0071C5]',
    brand: 'text-[#0071C5]',
    badge: 'bg-[#0071C5] text-white',
    button: 'bg-[#0071C5] hover:bg-[#005fa3] text-white font-bold',
    code: 'bg-white border-blue-400 text-[#0071C5]',
    storeBadge: 'bg-[#00ADEF] text-white border-[#0092C9]'
  },
  'Centauro': {
    container: 'from-white to-[#FFF0F0] text-[#D32F2F]',
    text: 'text-[#D32F2F]',
    brand: 'text-[#D32F2F]',
    badge: 'bg-[#D32F2F] text-white',
    button: 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-bold',
    code: 'bg-white border-red-400 text-[#D32F2F]',
    storeBadge: 'bg-[#D32F2F] text-white border-[#B71C1C]'
  },
  'AliExpress': {
    container: 'from-[#e6330b] to-[#e6330b] text-white',
    text: 'text-white',
    brand: 'text-[#e6330b]',
    badge: 'bg-[#fc9c0a] text-[#ffffff]',
    button: 'bg-[#fc9c0a] text-[#ffff] font-bold',
    code: 'bg-[#e6330b] border-[#fc9c0a] text-[#ffffff]',
    storeBadge: 'bg-gradient-to-br from-[#e6330b] via-[#fc9c0a] to-[#fc9c0a] text-white border-[#E63333]'
  },
  'Netshoes': {
    container: 'from-[#5E2B97] to-[#7E57C2] text-white',
    text: 'text-white',
    brand: 'text-[#5E2B97]',
    badge: 'bg-white text-[#5E2B97]',
    button: 'bg-white hover:bg-gray-100 text-[#5E2B97] font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    storeBadge: 'bg-[#5E2B97] text-white border-[#4A2277]'
  },
  'Fast Shop': {
    container: 'from-white to-gray-100 text-black',
    text: 'text-black',
    brand: 'text-[#E30613]',
    badge: 'bg-black text-white',
    button: 'bg-black hover:bg-gray-900 text-white font-bold',
    code: 'bg-white border-black text-black',
    storeBadge: 'bg-black text-white border-gray-800'
  },
  'Kabum': {
    container: 'from-[#0384fc] to-[#0384fc] text-[#FFFFFF]',
    text: 'text-[#FFFFFF]',
    brand: 'text-[#FF6500]',
    badge: 'bg-[#FF6500] text-[#FFFF]',
    button: 'bg-[#FF6500] hover:bg-[#0384fc] text-[#FFFF] font-bold',
    code: 'bg-[#FF6500] border-[#0384fc] text-[#FFFF]',
    storeBadge: 'bg-gradient-to-br from-[#0384fc] via-[#0384fc] to-[#FF6500] text-[#fff] border-[#E65C00]'
  },
  'Dell': {
    container: 'from-[#0078D7] to-[#005A9E] text-white',
    text: 'text-white',
    brand: 'text-[#0078D7]',
    badge: 'bg-white text-[#0078D7]',
    button: 'bg-white text-[#0078D7] hover:bg-gray-100 font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    storeBadge: 'bg-[#0078D7] text-white border-[#006BBF]'
  },
  'Nike': {
    container: 'from-black to-gray-800 text-white',
    text: 'text-white',
    brand: 'text-black dark:text-white',
    badge: 'bg-white text-black',
    button: 'bg-white text-black hover:bg-gray-200 font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    storeBadge: 'bg-black text-white border-gray-800'
  },
  'Adidas': {
    container: 'from-white to-gray-100 text-black',
    text: 'text-black',
    brand: 'text-black dark:text-white',
    badge: 'bg-black text-white',
    button: 'bg-black text-white hover:bg-gray-800 font-bold',
    code: 'bg-white border-black text-black',
    storeBadge: 'bg-black text-white border-gray-800'
  },
  'Samsung': {
    container: 'from-[#1428A0] to-[#1428A0] text-white',
    text: 'text-white',
    brand: 'text-[#1428A0]',
    badge: 'bg-white text-[#1428A0]',
    button: 'bg-white text-[#1428A0] hover:bg-gray-100 font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    storeBadge: 'bg-[#1428A0] text-white border-[#112188]'
  },
  'Apple': {
    container: 'from-black to-gray-900 text-white',
    text: 'text-white',
    brand: 'text-black dark:text-white',
    badge: 'bg-white text-black',
    button: 'bg-white text-black hover:bg-gray-200 font-bold',
    code: 'bg-white/10 border-white/30 text-white',
    storeBadge: 'bg-black text-white border-gray-800'
  },
  'Default': {
    container: 'from-gray-100 to-gray-200 text-gray-800 dark:from-slate-800 dark:to-slate-900 dark:text-white',
    text: 'text-gray-800 dark:text-white',
    brand: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-600 text-white',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    code: 'bg-white border-blue-600 text-blue-600 dark:bg-slate-800',
    storeBadge: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-white dark:border-slate-700'
  }
};

export const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 5 Smartphones Premium de 2024: O Guia Definitivo',
    excerpt: 'Analisamos os lançamentos mais aguardados do ano. Confira nossa seleção dos melhores smartphones premium com câmeras incríveis e desempenho de ponta.',
    thumbnail: 'https://placehold.co/600x400/2563eb/ffffff?text=Smartphones+Premium',
    category: 'Tecnologia',
    date: '2024-06-20',
    publishedAt: new Date('2024-06-20').toISOString(),
    isCouponPost: false,
    blocks: [
      { id: 'h1', type: BlockType.HEADING, content: 'A Escolha do Editor', level: 2 },
      { id: 'p1', type: BlockType.PARAGRAPH, content: 'Após semanas de testes intensivos, elegemos o campeão indiscutível em produtividade e fotografia.' },
      
      { 
        id: 'hp1', 
        type: BlockType.HOT_PRODUCT, 
        productName: 'Samsung Galaxy S24 Ultra 512GB Titanium',
        price: 'R$ 8.999,00',
        originalPrice: 'R$ 10.999,00',
        badge: 'Melhor Câmera',
        rating: 5.0,
        src: 'https://placehold.co/600x400/1e293b/ffffff?text=Galaxy+S24+Ultra',
        description: 'O smartphone definitivo com IA integrada, estrutura em titânio e a versátil S-Pen. Câmera de 200MP para fotos espaciais.',
        couponCode: 'GALAXY1000',
        name: 'R$ 1000 OFF',
        storeName: 'Fast Shop',
        affiliateLink: 'https://fastshop.com.br',
        affiliateButtonText: 'Ver Oferta Oficial',
        pros: ['Tela mais brilhante da categoria (2600 nits)', '7 anos de atualizações garantidas', 'Zoom óptico de 5x e 10x'],
        cons: ['Preço elevado no lançamento', 'Carregamento de 45W poderia ser mais rápido'],
        ranking: '1'
      },

      { id: 'h2', type: BlockType.HEADING, content: 'Ranking: Melhores Alternativas', level: 2 },
      {
        id: 'list_rank',
        type: BlockType.PRODUCT_LIST,
        listType: 'rank',
        rankSize: 3,
        items: [
          {
            id: 'p2',
            title: 'iPhone 15 Pro Max',
            price: 'R$ 9.299,00',
            originalPrice: 'R$ 10.999,00',
            image: 'https://placehold.co/400x400/334155/ffffff?text=iPhone+15+Pro',
            storeName: 'Amazon',
            rating: 4.9,
            ranking: '2',
            description: 'Acabamento em titânio aeroespacial e o poderoso chip A17 Pro para jogos de console.',
            affiliateButtonText: 'Ver na Amazon'
          },
          {
            id: 'p3',
            title: 'Xiaomi 14 Ultra',
            price: 'R$ 7.999,00',
            image: 'https://placehold.co/400x400/ff6b00/ffffff?text=Xiaomi+14',
            storeName: 'AliExpress',
            rating: 4.8,
            ranking: '3',
            description: 'Lentes Leica de última geração e carregamento ultrarrápido de 90W.',
            affiliateButtonText: 'Ver no AliExpress'
          },
          {
            id: 'p4',
            title: 'Google Pixel 8 Pro',
            price: 'R$ 6.500,00',
            image: 'https://placehold.co/400x400/4285f4/ffffff?text=Pixel+8+Pro',
            storeName: 'Mercado Livre',
            rating: 4.7,
            ranking: '4',
            description: 'A melhor experiência Android pura com recursos exclusivos de IA do Google.',
            affiliateButtonText: 'Ver Oferta'
          }
        ]
      },
      
      { id: 'h3', type: BlockType.HEADING, content: 'Comparativo de Especificações', level: 2 },
      {
        id: 'tab1',
        type: BlockType.TABLE,
        headers: ['Modelo', 'Processador', 'Câmera Principal', 'Bateria'],
        rows: [
          {
            id: 'r1',
            cells: [
              { id: 'c1_1', content: 'S24 Ultra' },
              { id: 'c1_2', content: 'Snapdragon 8 Gen 3' },
              { id: 'c1_3', content: '200MP' },
              { id: 'c1_4', content: '5000mAh' }
            ]
          },
          {
            id: 'r2',
            cells: [
              { id: 'c2_1', content: 'iPhone 15 Pro Max' },
              { id: 'c2_2', content: 'A17 Pro' },
              { id: 'c2_3', content: '48MP' },
              { id: 'c2_4', content: '4422mAh' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Festival Gamer: Os Melhores Periféricos para seu Setup',
    excerpt: 'Montar um setup gamer de respeito exige os equipamentos certos. Separamos teclados, mouses e headsets que vão elevar seu nível de jogo.',
    thumbnail: 'https://placehold.co/600x400/7c3aed/ffffff?text=Setup+Gamer',
    category: 'Games',
    date: '2024-06-22',
    publishedAt: new Date('2024-06-22').toISOString(),
    isCouponPost: false,
    blocks: [
      { id: 'h1', type: BlockType.HEADING, content: 'O Pódio dos Teclados Mecânicos', level: 2 },
      { id: 'p1', type: BlockType.PARAGRAPH, content: 'Velocidade, precisão e durabilidade. Estes são os três melhores teclados que testamos este ano.' },
      
      {
        id: 'podium_list',
        type: BlockType.PRODUCT_LIST,
        listType: 'podium',
        items: [
          {
            id: 'k1',
            title: 'Logitech G915 TKL',
            price: 'R$ 1.199,00',
            originalPrice: 'R$ 1.499,00',
            image: 'https://placehold.co/400x400/22c55e/ffffff?text=Logitech+G915',
            storeName: 'Kabum',
            rating: 4.9,
            ranking: '1',
            badge: 'Ouro',
            description: 'Wireless Lightspeed, switches low profile e bateria para 40h.',
            affiliateButtonText: 'Comprar'
          },
          {
            id: 'k2',
            title: 'Razer Huntsman Mini',
            price: 'R$ 799,00',
            image: 'https://placehold.co/400x400/10b981/ffffff?text=Razer+Huntsman',
            storeName: 'Amazon',
            rating: 4.7,
            ranking: '2',
            badge: 'Prata',
            description: 'Switches ópticos lineares, formato 60% e cabo removível.',
            affiliateButtonText: 'Comprar'
          },
          {
            id: 'k3',
            title: 'HyperX Alloy Origins',
            price: 'R$ 499,00',
            image: 'https://placehold.co/400x400/ef4444/ffffff?text=HyperX+Alloy',
            storeName: 'Magalu',
            rating: 4.6,
            ranking: '3',
            badge: 'Bronze',
            description: 'Corpo em alumínio aeronáutico e iluminação RGB vibrante.',
            affiliateButtonText: 'Comprar'
          }
        ]
      },

      { id: 'h2', type: BlockType.HEADING, content: 'Mouses para FPS e MOBA', level: 2 },
      {
        id: 'grid_list',
        type: BlockType.PRODUCT_LIST,
        listType: 'grid',
        columns: 3,
        items: [
          {
            id: 'm1',
            title: 'Logitech G Pro X Superlight 2',
            price: 'R$ 949,00',
            originalPrice: 'R$ 1.100,00',
            image: 'https://placehold.co/300x300/black/white?text=G+Pro+X',
            storeName: 'Kabum',
            rating: 4.9,
            soldCount: '5k+'
          },
          {
            id: 'm2',
            title: 'Razer DeathAdder V3',
            price: 'R$ 449,00',
            image: 'https://placehold.co/300x300/green/white?text=DeathAdder',
            storeName: 'Amazon',
            rating: 4.8,
            soldCount: '10k+'
          },
          {
            id: 'm3',
            title: 'Viper V3 Hyperspeed',
            price: 'R$ 399,00',
            image: 'https://placehold.co/300x300/black/green?text=Viper',
            storeName: 'Mercado Livre',
            rating: 4.7,
            soldCount: '2k+'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Eletrodomésticos Essenciais para Cozinha Moderna',
    excerpt: 'Facilite sua vida na cozinha com estes eletrodomésticos que são verdadeiros assistentes culinários. Air Fryers, Panelas de Pressão e mais.',
    thumbnail: 'https://placehold.co/600x400/ea580c/ffffff?text=Cozinha+Moderna',
    category: 'Casa',
    date: '2024-06-21',
    publishedAt: new Date('2024-06-21').toISOString(),
    isCouponPost: false,
    blocks: [
      { id: 'h1', type: BlockType.HEADING, content: 'As Melhores Air Fryers', level: 2 },
      {
        id: 'list_vertical',
        type: BlockType.PRODUCT_LIST,
        listType: 'list',
        items: [
          {
            id: 'af1',
            title: 'Air Fryer Philips Walita Conectada',
            price: 'R$ 1.299,00',
            originalPrice: 'R$ 1.699,00',
            image: 'https://placehold.co/300x300/blue/white?text=Philips+Walita',
            storeName: 'Magalu',
            rating: 4.8,
            description: 'Controle pelo celular, tecnologia RapidAir que não precisa virar o alimento.',
            pros: ['App NutriU com receitas', 'Cesto fácil de limpar'],
            cons: ['Preço acima da média']
          },
          {
            id: 'af2',
            title: 'Mondial Grand Family 4L',
            price: 'R$ 359,00',
            originalPrice: 'R$ 499,00',
            image: 'https://placehold.co/300x300/red/white?text=Mondial+4L',
            storeName: 'Amazon',
            rating: 4.7,
            description: 'O melhor custo-benefício do mercado, robusta e eficiente.',
            pros: ['Preço acessível', 'Peças de reposição fáceis'],
            cons: ['Design simples']
          },
          {
            id: 'af3',
            title: 'Oster Digital 3.2L',
            price: 'R$ 449,00',
            image: 'https://placehold.co/300x300/gray/white?text=Oster+Digital',
            storeName: 'Americanas',
            rating: 4.6,
            description: 'Painel touch digital e acabamento em inox.',
            pros: ['Design moderno', 'Funções pré-programadas'],
            cons: ['Capacidade menor']
          }
        ]
      },
      { id: 'h2', type: BlockType.HEADING, content: 'Dica da Fábrica', level: 2 },
      {
        id: 'promo_spot',
        type: BlockType.PRODUCT,
        productName: 'Kit Panelas RedSilver',
        price: 'R$ 399,90',
        originalPrice: 'R$ 599,90',
        src: 'https://placehold.co/600x400/red/white?text=RedSilver',
        storeName: 'Site Oficial',
        rating: 4.9,
        badge: 'Sucesso de Vendas',
        description: 'Revestimento cerâmico antiaderente que não gruda nada e não solta resíduos.',
        affiliateButtonText: 'Ver Oferta'
      }
    ]
  },
  {
    id: '4',
    title: 'Maratona de Descontos: Cupons Ativos da Semana',
    excerpt: 'Reunimos os cupons mais quentes que ainda estão valendo. Economize em moda, eletrônicos e muito mais.',
    thumbnail: 'https://placehold.co/600x400/db2777/ffffff?text=Cupons+da+Semana',
    category: 'Cupons',
    date: '2024-06-23',
    publishedAt: new Date('2024-06-23').toISOString(),
    isCouponPost: true,
    blocks: [
      { id: 'h1', type: BlockType.HEADING, content: 'Moda e Acessórios', level: 2 },
      {
        id: 'cp_list_1',
        type: BlockType.COUPON_LIST,
        listType: 'grid',
        columns: 2,
        items: [
          {
            id: 'c1',
            title: 'Nike Store',
            description: '20% OFF em itens selecionados da coleção de inverno',
            couponCode: 'INVERNO20',
            discount: '20%',
            storeName: 'Netshoes',
            expiryDate: '2024-08-30'
          },
          {
            id: 'c2',
            title: 'Adidas',
            description: '15% OFF na primeira compra pelo app',
            couponCode: 'APP15',
            discount: '15%',
            storeName: 'Centauro',
            expiryDate: '2024-09-15'
          }
        ]
      },
      { id: 'h2', type: BlockType.HEADING, content: 'Cupom Especial Shopee', level: 2 },
      {
        id: 'cp_shopee',
        type: BlockType.COUPON,
        name: 'Shopee Oficial',
        description: 'Frete Grátis acima de R$ 19,00 + R$ 10,00 OFF',
        couponCode: 'FRETE10OFF',
        storeName: 'Shopee',
        expiryDate: '2024-07-31'
      }
    ]
  },
  {
    id: '5',
    title: 'Escolhas da Fábrica: O Melhor da Semana',
    excerpt: 'Nossa curadoria semanal com os produtos que mais valeram a pena comprar nos últimos dias.',
    thumbnail: 'https://placehold.co/600x400/059669/ffffff?text=Escolhas+da+Fábrica',
    category: 'Escolha da Fábrica',
    date: '2024-06-24',
    publishedAt: new Date('2024-06-24').toISOString(),
    isCouponPost: false,
    blocks: [
      { id: 'h1', type: BlockType.HEADING, content: 'Destaques Imperdíveis', level: 2 },
      {
        id: 'factory_grid',
        type: BlockType.PRODUCT_LIST,
        listType: 'grid',
        columns: 4,
        items: [
          {
            id: 'fp1',
            title: 'Fone Bluetooth QCY T13',
            price: 'R$ 99,00',
            originalPrice: 'R$ 159,00',
            image: 'https://placehold.co/300x300/white/black?text=QCY+T13',
            storeName: 'AliExpress',
            rating: 4.8,
            badge: 'Custo-Benefício'
          },
          {
            id: 'fp2',
            title: 'Power Bank Samsung 10000mAh',
            price: 'R$ 149,00',
            image: 'https://placehold.co/300x300/blue/white?text=Power+Bank',
            storeName: 'Samsung',
            rating: 4.9,
            badge: 'Essencial'
          },
          {
            id: 'fp3',
            title: 'Kindle 11ª Geração',
            price: 'R$ 449,00',
            originalPrice: 'R$ 499,00',
            image: 'https://placehold.co/300x300/black/white?text=Kindle',
            storeName: 'Amazon',
            rating: 4.9,
            badge: 'Leitura'
          },
          {
            id: 'fp4',
            title: 'Fire TV Stick Lite',
            price: 'R$ 229,00',
            originalPrice: 'R$ 299,00',
            image: 'https://placehold.co/300x300/black/orange?text=Fire+TV',
            storeName: 'Amazon',
            rating: 4.8,
            badge: 'Streaming'
          }
        ]
      }
    ]
  },
  {
    id: 'test-all-stores',
    title: 'Teste de Lojas: Vitrine Completa',
    excerpt: 'Um post de teste para validar a exibição de produtos de todas as lojas parceiras.',
    thumbnail: 'https://placehold.co/600x400/000000/ffffff?text=Teste+Lojas',
    category: 'Teste',
    date: '2024-06-25',
    publishedAt: new Date('2024-06-25').toISOString(),
    isCouponPost: false,
    blocks: [
      { id: 'h1', type: BlockType.HEADING, content: 'Todas as Lojas Parceiras', level: 2 },
      {
        id: 'all_stores_grid',
        type: BlockType.PRODUCT_LIST,
        listType: 'grid',
        columns: 4,
        items: [
          {
            id: 'ts1',
            title: 'Produto Mercado Livre',
            price: 'R$ 100,00',
            image: 'https://placehold.co/300x300/yellow/black?text=ML',
            storeName: 'Mercado Livre',
            rating: 4.5
          },
          {
            id: 'ts2',
            title: 'Produto Amazon',
            price: 'R$ 200,00',
            image: 'https://placehold.co/300x300/orange/black?text=Amazon',
            storeName: 'Amazon',
            rating: 4.8
          },
          {
            id: 'ts3',
            title: 'Produto Shopee',
            price: 'R$ 50,00',
            image: 'https://placehold.co/300x300/orange/white?text=Shopee',
            storeName: 'Shopee',
            rating: 4.2
          },
          {
            id: 'ts4',
            title: 'Produto Magalu',
            price: 'R$ 300,00',
            image: 'https://placehold.co/300x300/blue/white?text=Magalu',
            storeName: 'Magalu',
            rating: 4.7
          },
          {
            id: 'ts5',
            title: 'Produto Americanas',
            price: 'R$ 150,00',
            image: 'https://placehold.co/300x300/red/white?text=Americanas',
            storeName: 'Americanas',
            rating: 4.0
          },
          {
            id: 'ts6',
            title: 'Produto Submarino',
            price: 'R$ 250,00',
            image: 'https://placehold.co/300x300/blue/white?text=Submarino',
            storeName: 'Submarino',
            rating: 4.6
          },
          {
            id: 'ts7',
            title: 'Produto AliExpress',
            price: 'R$ 80,00',
            image: 'https://placehold.co/300x300/red/white?text=AliExpress',
            storeName: 'AliExpress',
            rating: 4.3
          },
          {
            id: 'ts8',
            title: 'Produto Netshoes',
            price: 'R$ 180,00',
            image: 'https://placehold.co/300x300/purple/white?text=Netshoes',
            storeName: 'Netshoes',
            rating: 4.5
          },
          {
            id: 'ts9',
            title: 'Produto Centauro',
            price: 'R$ 190,00',
            image: 'https://placehold.co/300x300/red/white?text=Centauro',
            storeName: 'Centauro',
            rating: 4.4
          },
          {
            id: 'ts10',
            title: 'Produto Casas Bahia',
            price: 'R$ 400,00',
            image: 'https://placehold.co/300x300/blue/white?text=Casas+Bahia',
            storeName: 'Casas Bahia',
            rating: 4.1
          },
          {
            id: 'ts11',
            title: 'Produto Fast Shop',
            price: 'R$ 500,00',
            image: 'https://placehold.co/300x300/white/red?text=Fast+Shop',
            storeName: 'Fast Shop',
            rating: 4.9
          },
          {
            id: 'ts12',
            title: 'Produto Kabum',
            price: 'R$ 600,00',
            image: 'https://placehold.co/300x300/orange/white?text=Kabum',
            storeName: 'Kabum',
            rating: 4.8
          },
          {
            id: 'ts13',
            title: 'Produto Dell',
            price: 'R$ 3000,00',
            image: 'https://placehold.co/300x300/blue/white?text=Dell',
            storeName: 'Dell',
            rating: 4.7
          },
          {
            id: 'ts14',
            title: 'Produto Nike',
            price: 'R$ 350,00',
            image: 'https://placehold.co/300x300/black/white?text=Nike',
            storeName: 'Nike',
            rating: 4.9
          },
          {
            id: 'ts15',
            title: 'Produto Adidas',
            price: 'R$ 320,00',
            image: 'https://placehold.co/300x300/black/white?text=Adidas',
            storeName: 'Adidas',
            rating: 4.8
          },
          {
            id: 'ts16',
            title: 'Produto Samsung',
            price: 'R$ 1500,00',
            image: 'https://placehold.co/300x300/blue/white?text=Samsung',
            storeName: 'Samsung',
            rating: 4.6
          },
          {
            id: 'ts17',
            title: 'Produto Apple',
            price: 'R$ 5000,00',
            image: 'https://placehold.co/300x300/black/white?text=Apple',
            storeName: 'Apple',
            rating: 5.0
          }
        ]
      }
    ]
  },
  {
    id: 'test-all-stores-coupons',
    title: 'Teste de Cupons: Todas as Lojas Parceiras',
    excerpt: 'Lista completa de cupons para validar todas as lojas com data de expiração futura.',
    thumbnail: 'https://placehold.co/600x400/111827/ffffff?text=Teste+Cupons',
    category: 'Cupons',
    date: '2026-03-01',
    publishedAt: new Date('2026-03-01').toISOString(),
    isCouponPost: true,
    blocks: [
      { id: 'h1_coupons_all', type: BlockType.HEADING, content: 'Cupons ativos de todas as lojas', level: 2 },
      {
        id: 'coupon_list_all_stores',
        type: BlockType.COUPON_LIST,
        listType: 'grid',
        columns: 3,
        items: [
          {
            id: 'c_ts1',
            title: 'Mercado Livre',
            description: 'Desconto direto em produtos selecionados',
            couponCode: 'ML10OFF',
            discount: '10%',
            storeName: 'Mercado Livre',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts2',
            title: 'Amazon',
            description: 'Oferta especial em eletrônicos',
            couponCode: 'AMZ12',
            discount: '12%',
            storeName: 'Amazon',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts3',
            title: 'Shopee',
            description: 'Cupom exclusivo para novos pedidos',
            couponCode: 'SHP15',
            discount: '15%',
            storeName: 'Shopee',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts4',
            title: 'Magalu',
            description: 'Desconto em linha branca e eletro',
            couponCode: 'MGL8',
            discount: '8%',
            storeName: 'Magalu',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts5',
            title: 'Americanas',
            description: 'Economize em utilidades e casa',
            couponCode: 'AMER10',
            discount: '10%',
            storeName: 'Americanas',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts6',
            title: 'Submarino',
            description: 'Desconto em tecnologia e games',
            couponCode: 'SUB12',
            discount: '12%',
            storeName: 'Submarino',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts7',
            title: 'AliExpress',
            description: 'Oferta global em importados',
            couponCode: 'ALI18',
            discount: '18%',
            storeName: 'AliExpress',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts8',
            title: 'Netshoes',
            description: 'Desconto em esportes e fitness',
            couponCode: 'NET15',
            discount: '15%',
            storeName: 'Netshoes',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts9',
            title: 'Centauro',
            description: 'Oferta em moda esportiva',
            couponCode: 'CENT12',
            discount: '12%',
            storeName: 'Centauro',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts10',
            title: 'Casas Bahia',
            description: 'Desconto em móveis e eletro',
            couponCode: 'CB10',
            discount: '10%',
            storeName: 'Casas Bahia',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts11',
            title: 'Fast Shop',
            description: 'Cupom para eletro premium',
            couponCode: 'FAST8',
            discount: '8%',
            storeName: 'Fast Shop',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts12',
            title: 'Kabum',
            description: 'Desconto gamer selecionado',
            couponCode: 'KABUM12',
            discount: '12%',
            storeName: 'Kabum',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts13',
            title: 'Dell',
            description: 'Oferta em notebooks e periféricos',
            couponCode: 'DELL10',
            discount: '10%',
            storeName: 'Dell',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts14',
            title: 'Nike',
            description: 'Desconto em calçados e roupas',
            couponCode: 'NIKE12',
            discount: '12%',
            storeName: 'Nike',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts15',
            title: 'Adidas',
            description: 'Cupom para coleção atual',
            couponCode: 'ADID10',
            discount: '10%',
            storeName: 'Adidas',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts16',
            title: 'Samsung',
            description: 'Desconto em smartphones e TVs',
            couponCode: 'SAMS8',
            discount: '8%',
            storeName: 'Samsung',
            expiryDate: '2026-03-15'
          },
          {
            id: 'c_ts17',
            title: 'Apple',
            description: 'Oferta especial em acessórios',
            couponCode: 'APPLE5',
            discount: '5%',
            storeName: 'Apple',
            expiryDate: '2026-03-15'
          }
        ]
      }
    ]
  },
  {
    id: 'test-productwidget-layouts',
    title: 'Teste de Layouts do ProductWidget',
    excerpt: 'Post com variações de layout e preenchimento para validar o ProductWidget.',
    thumbnail: 'https://placehold.co/600x400/1e40af/ffffff?text=Teste+ProductWidget',
    category: 'Teste',
    date: '2026-03-02',
    publishedAt: new Date('2026-03-02').toISOString(),
    isCouponPost: false,
    blocks: [
      {
        id: 'pw1',
        type: BlockType.PRODUCT,
        productName: 'Notebook Gamer Ultra XYZ com RTX 4060 e 16GB RAM',
        price: 'R$ 6.499,00',
        originalPrice: 'R$ 7.299,00',
        rating: 4.8,
        description: 'Tela 165Hz, SSD NVMe 1TB e refrigeração avançada.',
        badge: 'Oferta Relâmpago',
        storeName: 'Amazon',
        showStoreLogo: true,
        couponCode: 'NOTE300',
        name: 'Notebook Gamer Ultra XYZ',
        affiliateLink: 'https://amazon.com.br',
        affiliateButtonText: 'Ver na Amazon',
        soldCount: '1,2k vendidos',
        ranking: 'Top 1',
        pros: ['GPU potente para jogos AAA', 'Tela com alta taxa de atualização', 'SSD rápido'],
        cons: ['Peso elevado', 'Ventoinhas audíveis em carga máxima'],
        images: [
          'https://placehold.co/600x400/0f172a/ffffff?text=Notebook+01',
          'https://placehold.co/600x400/1f2937/ffffff?text=Notebook+02',
          'https://placehold.co/600x400/111827/ffffff?text=Notebook+03'
        ]
      },
      {
        id: 'pw2',
        type: BlockType.PRODUCT,
        productName: 'Smartphone Galaxy Z Flip 6 256GB',
        price: 'R$ 4.999,00',
        originalPrice: 'R$ 5.799,00',
        rating: 4.7,
        description: 'Dobrável premium com câmeras aprimoradas e dobradiça reforçada.',
        storeName: 'Samsung',
        showStoreLogo: true,
        affiliateLink: 'https://samsung.com.br',
        affiliateButtonText: 'Ver Oferta',
        images: [
          'https://placehold.co/600x400/0f172a/ffffff?text=Flip+01',
          'https://placehold.co/600x400/1e293b/ffffff?text=Flip+02'
        ]
      },
      {
        id: 'pw3',
        type: BlockType.PRODUCT,
        productName: 'Fone Bluetooth Lite',
        price: 'R$ 129,90',
        rating: 4.3,
        src: 'https://placehold.co/600x400/334155/ffffff?text=Fone+Lite',
        storeName: 'Mercado Livre',
        showStoreLogo: true,
        affiliateLink: 'https://mercadolivre.com.br',
        affiliateButtonText: 'Ver no Mercado Livre'
      },
      {
        id: 'pw4',
        type: BlockType.PRODUCT,
        productLayout: 'compact',
        productName: 'Mouse Gamer Pro',
        price: 'R$ 199,90',
        originalPrice: 'R$ 259,90',
        rating: 4.6,
        storeName: 'Kabum',
        showStoreLogo: true,
        couponCode: 'MOUSE10',
        name: 'Mouse Gamer Pro',
        hideCode: true,
        affiliateLink: 'https://kabum.com.br',
        affiliateButtonText: 'Comprar',
        images: [
          'https://placehold.co/600x400/111827/ffffff?text=Mouse+01',
          'https://placehold.co/600x400/1f2937/ffffff?text=Mouse+02'
        ]
      },
      {
        id: 'pw5',
        type: BlockType.PRODUCT,
        productLayout: 'compact',
        productName: 'Tênis Corrida AirFlow',
        price: 'R$ 299,90',
        rating: 4.4,
        storeName: 'Netshoes',
        showStoreLogo: true,
        soldCount: '8k vendidos',
        affiliateLink: 'https://netshoes.com.br',
        affiliateButtonText: 'Ver na Netshoes',
        src: 'https://placehold.co/600x400/16a34a/ffffff?text=Tenis+AirFlow'
      },
      {
        id: 'pw6',
        type: BlockType.PRODUCT,
        productName: 'Air Fryer Family 5L',
        price: 'R$ 389,00',
        originalPrice: 'R$ 499,00',
        rating: 4.5,
        description: 'Cesto antiaderente com 8 funções pré-programadas.',
        storeName: 'Magalu',
        showStoreLogo: true,
        couponCode: 'AIR50',
        name: 'Air Fryer Family 5L',
        isExpired: true,
        affiliateLink: 'https://magalu.com',
        affiliateButtonText: 'Ver Oferta',
        src: 'https://placehold.co/600x400/3b82f6/ffffff?text=Air+Fryer'
      },
      {
        id: 'pw7',
        type: BlockType.PRODUCT,
        productName: 'Cafeteira Premium 19 Bar',
        price: 'R$ 799,00',
        originalPrice: 'R$ 999,00',
        rating: 4.6,
        description: 'Espresso cremoso com vaporizador integrado.',
        storeName: 'Loja Oficial',
        manualStoreName: 'Barista Pro',
        affiliateLogo: 'https://placehold.co/120x40/0f172a/ffffff?text=Barista',
        affiliateLink: 'https://example.com',
        affiliateButtonText: 'Comprar Agora',
        badge: 'Top Escolha',
        src: 'https://placehold.co/600x400/111827/ffffff?text=Cafeteira'
      },
      {
        id: 'pw8',
        type: BlockType.PRODUCT,
        productName: 'Cadeira Ergonômica Flex',
        price: 'R$ 1.199,00',
        rating: 4.9,
        description: 'Apoio lombar ajustável e encosto em mesh.',
        manualStoreName: 'Loja Local',
        affiliateLogo: 'https://placehold.co/120x40/1f2937/ffffff?text=Local',
        affiliateLink: 'https://example.com',
        affiliateButtonText: 'Ver Oferta',
        images: [
          'https://placehold.co/600x400/0f172a/ffffff?text=Cadeira+01',
          'https://placehold.co/600x400/1e293b/ffffff?text=Cadeira+02'
        ]
      },
      {
        id: 'pw9',
        type: BlockType.PRODUCT,
        productName: 'Smart TV 65" QLED 4K',
        price: 'R$ 3.899,00',
        originalPrice: 'R$ 4.499,00',
        rating: 4.8,
        badge: 'Top Escolha',
        storeName: 'Casas Bahia',
        showStoreLogo: true,
        soldCount: '3,4k vendidos',
        ranking: 'Top 3',
        affiliateLink: 'https://casasbahia.com.br',
        affiliateButtonText: 'Ver Oferta',
        src: 'https://placehold.co/600x400/1d4ed8/ffffff?text=Smart+TV'
      },
      {
        id: 'pw10',
        type: BlockType.PRODUCT,
        productName: 'Kit Teclado Mecânico + Mouse RGB',
        price: 'R$ 279,00',
        originalPrice: 'R$ 349,00',
        rating: 4.5,
        description: 'Switch blue e iluminação personalizável.',
        storeName: 'AliExpress',
        showStoreLogo: true,
        couponCode: 'ALI20',
        name: 'Kit Teclado + Mouse',
        affiliateLink: 'https://aliexpress.com',
        affiliateButtonText: 'Ver Oferta',
        images: [
          'https://placehold.co/600x400/ef4444/ffffff?text=Kit+RGB+01',
          'https://placehold.co/600x400/f97316/ffffff?text=Kit+RGB+02'
        ]
      },
      {
        id: 'pw11',
        type: BlockType.PRODUCT,
        productName: 'Soundbar Atmos 3.1',
        price: 'R$ 1.699,00',
        originalPrice: 'R$ 2.099,00',
        rating: 4.7,
        description: 'Som imersivo com subwoofer sem fio.',
        storeName: 'Fast Shop',
        showStoreLogo: true,
        pros: ['Graves potentes', 'Conexão HDMI eARC'],
        cons: ['Sem suporte a DTS:X'],
        affiliateLink: 'https://fastshop.com.br',
        affiliateButtonText: 'Comprar',
        src: 'https://placehold.co/600x400/111827/ffffff?text=Soundbar'
      },
      {
        id: 'pw12',
        type: BlockType.PRODUCT,
        productLayout: 'compact',
        productName: 'Bicicleta Speed Carbon',
        price: 'R$ 7.499,00',
        originalPrice: 'R$ 8.299,00',
        rating: 4.9,
        storeName: 'Centauro',
        showStoreLogo: true,
        couponCode: 'BIKE200',
        name: 'Bicicleta Speed Carbon',
        hideCode: true,
        affiliateLink: 'https://centauro.com.br',
        affiliateButtonText: 'Ver na Centauro',
        images: [
          'https://placehold.co/600x400/ef4444/ffffff?text=Bike+01',
          'https://placehold.co/600x400/dc2626/ffffff?text=Bike+02'
        ]
      }
    ]
  }
];
