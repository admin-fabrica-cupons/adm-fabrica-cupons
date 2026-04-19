// Interface dos dados retornados
export interface ScrapedData {
  title: string;
  price: string;
  originalPrice: string;
  image: string;
  description: string;
  discount: string;
  rating: number;
  storeName?: string;
  sellerType?: string;        // Novo: Tipo de vendedor (Loja Oficial, etc)
  soldCount?: string;          // Vendas (+1000 vendidos)
  ranking?: string;            // Ranking (7º em Cadeiras)
  tagRanking?: string;         // Tag de ranking (MAIS VENDIDO)
  shortDescription?: string;   // Descrição curta
  fullDescription?: string;    // Descrição completa (HTML)
  specifications?: Array<{     // Especificações técnicas
    categoria?: string;
    propriedade?: string;
    valor: string;
  }>;
  allImages?: string[];        // Todas as imagens do produto
}

// Chave para localStorage (Controle de UX apenas)
const STORAGE_KEY = 'api_daily_usage';
const DAILY_LIMIT = 32;

const upgradeMercadoLivreImage = (url: string): string => {
  if (!url) return url;
  if (!/(mlstatic|mercadolivre)/i.test(url)) return url;
  const [base, query] = url.split('?');
  const upgradedBase = base.replace(/-(I|V|S|W|F|B|C|D|R|T|Q)(\.(?:jpg|jpeg|png|webp))$/i, '-O$2');
  return query ? `${upgradedBase}?${query}` : upgradedBase;
};

/**
 * Verifica se o usuário pode fazer requisições hoje (Controle local)
 */
export const checkDailyLimit = (): { allowed: boolean; remaining: number } => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toDateString();

  if (!stored) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const data = JSON.parse(stored);

  if (data.date !== today) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const remaining = DAILY_LIMIT - data.count;
  return { allowed: remaining > 0, remaining };
};

const incrementUsage = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(STORAGE_KEY);
  let count = 0;

  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      count = data.count;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: count + 1 }));
};

/**
 * Função principal para buscar dados via Serverless Proxy
 */
export const fetchProductData = async (productUrl: string): Promise<ScrapedData> => {
  const status = checkDailyLimit();
  if (!status.allowed) {
    throw new Error('Limite diário atingido.');
  }

  try {
    const encodedUrl = encodeURIComponent(productUrl);
    const apiUrl = `/api/scrape?url=${encodedUrl}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) errorMessage = errorJson.error;
      } catch (e) {
        // Se não for JSON, usa o texto puro se for curto
        if (errorText.length < 200) errorMessage = errorText;
      }
      throw new Error(`Erro na API: ${errorMessage}`);
    }

    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // 1. Título e Avaliação (Mantidos)
    const title = doc.querySelector('h1.ui-pdp-title')?.textContent?.trim() || '';
    const ratingText = doc.querySelector('span.ui-pdp-review__rating')?.textContent?.trim();
    const rating = ratingText ? parseFloat(ratingText.replace(',', '.')) : 0;

    // 2. Preços (Mantidos)
    const po = doc.querySelector('s.ui-pdp-price__original-value span.andes-money-amount__fraction')?.textContent;
    const poc = doc.querySelector('s.ui-pdp-price__original-value span.andes-money-amount__cents')?.textContent;
    const originalPrice = (po && poc) ? `R$ ${po},${poc}` : (doc.querySelector('s.ui-pdp-price__original-value')?.textContent?.trim() || '');

    const p = doc.querySelector('div.ui-pdp-price__second-line span.andes-money-amount__fraction')?.textContent;
    const pc = doc.querySelector('div.ui-pdp-price__second-line span.andes-money-amount__cents')?.textContent;
    let price = (p && pc) ? `R$ ${p},${pc}` : '';

    // 4. Novos Campos: Vendidos, Ranking e Tag de Ranking
    // Extrair "+1000 vendidos" ou "+5mil vendidos"
    const soldElement = doc.querySelector('.ui-pdp-subtitle');
    let soldCount = '';
    if (soldElement) {
      const text = soldElement.getAttribute('aria-label') || soldElement.textContent || '';
      const match = text.match(/(\+?\d+(?:\.\d+)?(?:\s?(?:mil|milhão|milhões)?))\s+vendidos/i);
      if (match) {
        soldCount = match[1].trim();
        if (!soldCount.startsWith('+') && /^\d/.test(soldCount)) {
          soldCount = `+${soldCount}`;
        }
      }
    }

    // Extrair Ranking e Tag de Ranking separadamente
    let ranking = '';
    let tagRanking = '';
    const rankingElements = doc.querySelectorAll('.ui-pdp-promotions-pill-label__target');
    rankingElements.forEach(element => {
      const text = element.textContent?.trim() || '';
      // Verificar se é um ranking (contém "º")
      if (text.includes('º')) {
        ranking = text;
      } 
      // Verificar se é uma tag (MAIS VENDIDO, OFERTA, etc)
      else if (text.includes('MAIS VENDIDO') || text.includes('OFERTA') || 
               text.includes('DESTAQUE') || text.includes('MAIS COMPRADO')) {
        tagRanking = text;
      }
      // Se não se encaixar nos padrões, pode ser tag genérica
      else if (text && text.length < 30) {
        tagRanking = text;
      }
    });

    // Fallback: se não encontrou com o seletor específico
    if (!ranking && !tagRanking) {
      const possibleElements = doc.querySelectorAll('.ui-pdp-promotions-pill-label, ' +
        '.best_seller_position, ' +
        '.ui-pdp-promotions-pill_description, ' +
        '[class*="promotions"]');
      possibleElements.forEach(element => {
        const text = element.textContent?.trim() || '';
        if (text.includes('º')) {
          ranking = text;
        } else if (text.includes('MAIS VENDIDO') || text.length < 20) {
          tagRanking = text;
        }
      });
    }

    // 3. LÓGICA DE IMAGEM BLINDADA (Anti-Lazy Load)
    let image = '';
    const imgElement = doc.querySelector('img.ui-pdp-image, img.ui-pdp-gallery__figure__image');

    if (imgElement) {
      // Prioridade 1: data-zoom (Imagem de alta resolução para zoom)
      const dataZoom = imgElement.getAttribute('data-zoom');

      // Prioridade 2: srcset (Lista de imagens, pegamos a última que costuma ser a maior)
      const srcset = imgElement.getAttribute('srcset');
      let highResFromSrcset = '';
      if (srcset) {
        const sources = srcset.split(',').map(s => s.trim().split(' ')[0]);
        highResFromSrcset = sources[sources.length - 1]; // Pega a última da lista
      }

      // Prioridade 3: src (Apenas se NÃO for um base64/placeholder)
      const src = imgElement.getAttribute('src');
      const isValidSrc = src && !src.startsWith('data:image');

      image = dataZoom || highResFromSrcset || (isValidSrc ? src : '');
    }

    // Fallback Final: Meta Tag (Muito confiável para a imagem principal)
    if (!image || image.startsWith('data:image')) {
      image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    }

    if (image) {
      image = upgradeMercadoLivreImage(image);
    }

    // 4. Extras
    const discount = doc.querySelector('span.ui-pdp-price__discount--with-bg-color')?.textContent?.trim() || '';
    
    // Descrição curta (meta tag)
    const shortDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Descrição completa (HTML)
    let fullDescription = '';
    const descriptionSelectors = [
      '.ui-pdp-description__content',
      '.ui-pdp-description',
      '[data-testid="description"]',
      '.andes-document__content'
    ];
    for (const selector of descriptionSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        fullDescription = element.innerHTML.trim();
        break;
      }
    }
    if (!fullDescription) {
      fullDescription = shortDescription;
    }
    
    // Informações do vendedor (corrigido)
    let storeName = '';
    let sellerType = '';
    
    // Buscar pelo span com texto "Vendido por"
    const soldBySpan = Array.from(doc.querySelectorAll('span')).find(span => 
      span.textContent?.includes('Vendido por')
    );
    
    if (soldBySpan) {
      const parent = soldBySpan.parentElement;
      if (parent) {
        const sellerLink = parent.querySelector('.ui-pdp-seller__link, .ui-pdp-seller__link-trigger-button a, a[class*="seller"]');
        if (sellerLink) {
          storeName = sellerLink.textContent?.trim() || '';
        }
        // Verificar se é loja oficial ou eshop
        if (parent.querySelector('[class*="official"]') || 
            parent.querySelector('[class*="eshop"]') ||
            parent.textContent?.includes('Loja oficial')) {
          sellerType = 'Loja Oficial';
        }
      }
    }
    
    // Fallback: seletores tradicionais
    if (!storeName) {
      const storeSelectors = [
        'button.ui-pdp-seller__link-trigger-button a',
        '.ui-pdp-seller__link',
        'a.ui-pdp-media__action',
        'a[class*="seller"]'
      ];
      for (const selector of storeSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          storeName = element.textContent?.trim() || '';
          break;
        }
      }
    }
    
    // Limpar "Loja oficial" do nome da loja
    storeName = storeName.replace(/^Loja oficial /i, '').replace(/ Loja oficial$/i, '').replace(/Loja oficial/i, '').trim();
    
    // Especificações técnicas
    const specifications: Array<{categoria?: string; propriedade?: string; valor: string}> = [];
    const tableSelectors = [
      '.ui-vpp-striped-specs',
      '.andes-table',
      '.ui-pdp-specs',
      'table.andes-table'
    ];
    
    let table = null;
    for (const selector of tableSelectors) {
      table = doc.querySelector(selector);
      if (table) break;
    }
    
    if (table) {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const headers = row.querySelectorAll('.ui-vpp-striped-specs__header, .andes-table__header__container');
        const cells = row.querySelectorAll('.andes-table__column--value, td');
        
        if (headers.length > 0) {
          headers.forEach((header, index) => {
            const headerText = header.textContent?.trim();
            const cellText = cells[index]?.textContent?.trim();
            if (headerText && cellText && headerText !== '' && cellText !== '') {
              specifications.push({
                categoria: headerText,
                valor: cellText
              });
            }
          });
        } else {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const firstCell = cells[0]?.textContent?.trim();
            const secondCell = cells[1]?.textContent?.trim();
            if (firstCell && secondCell) {
              specifications.push({
                propriedade: firstCell,
                valor: secondCell
              });
            }
          }
        }
      });
    }
    
    // Fallback para especificações
    if (specifications.length === 0) {
      const specItems = doc.querySelectorAll('.ui-pdp-specs__list-item, .andes-list__item');
      specItems.forEach(item => {
        const label = item.querySelector('.ui-pdp-specs__label, .andes-list__item-first-column')?.textContent?.trim();
        const value = item.querySelector('.ui-pdp-specs__value, .andes-list__item-second-column')?.textContent?.trim();
        if (label && value) {
          specifications.push({
            propriedade: label,
            valor: value
          });
        }
      });
    }

    // 5. Extrair Todas as Imagens (Galeria)
    const allImagesSet = new Set<string>();
    
    // Adiciona a imagem principal encontrada
    if (image && !image.startsWith('data:')) allImagesSet.add(image);

    // Tenta encontrar outras imagens na galeria
    const galleryImages = doc.querySelectorAll('img.ui-pdp-gallery__figure__image, img.ui-pdp-image, img.ui-pdp-thumbnail__image, .ui-pdp-gallery__wrapper img, .ui-pdp-gallery__thumbnails img, [data-testid="ui-pdp-gallery__figure__image"] img, .ui-pdp-gallery__figure img');
    galleryImages.forEach(img => {
      // Tentar diferentes atributos de imagem
      const dataZoom = img.getAttribute('data-zoom');
      const srcset = img.getAttribute('srcset');
      const src = img.getAttribute('src');
      const dataSrc = img.getAttribute('data-src');
      
      // Processar srcset (pegar maior resolução)
      if (srcset) {
        const sources = srcset.split(',').map(s => s.trim().split(' ')[0]);
        const highRes = sources[sources.length - 1];
        if (highRes && !highRes.startsWith('data:image')) {
          allImagesSet.add(upgradeMercadoLivreImage(highRes));
        }
      }
      
      // data-zoom (alta resolução)
      if (dataZoom && !dataZoom.startsWith('data:image')) {
        allImagesSet.add(upgradeMercadoLivreImage(dataZoom));
      }
      
      // data-src (lazy loading)
      if (dataSrc && !dataSrc.startsWith('data:image')) {
        allImagesSet.add(upgradeMercadoLivreImage(dataSrc));
      }
      
      // src normal
      if (src && !src.startsWith('data:image') && !src.includes('thumbnail')) {
        allImagesSet.add(upgradeMercadoLivreImage(src));
      }
    });
    
    // Se não encontrou imagens, tentar meta tags
    if (allImagesSet.size === 0) {
      const metaImages = doc.querySelectorAll('meta[property="og:image"]');
      metaImages.forEach(meta => {
        const content = meta.getAttribute('content');
        if (content) allImagesSet.add(upgradeMercadoLivreImage(content));
      });
    }

    const allImages = Array.from(allImagesSet);

    incrementUsage();

    return {
      title,
      price,
      originalPrice,
      image,
      description: shortDescription,
      shortDescription,
      fullDescription,
      specifications,
      discount,
      rating,
      storeName,
      sellerType,
      soldCount,
      ranking,
      tagRanking,
      allImages
    };

  } catch (error) {
    console.error("Erro no scraper:", error);
    throw error;
  }
};
