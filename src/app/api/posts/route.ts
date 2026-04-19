import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { uploadPost } from '@/utils/postStorage';

export const dynamic = 'force-dynamic';

// Helper para gerar slug
const generateSlug = (title: string) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

const bucketName = 'portal-posts';

const createJsonBlob = (payload: unknown) => {
  return new Blob([JSON.stringify(payload)], { type: 'application/json' });
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const extractBlocksFromEditor = (source: any) => {
  const blocks: any[] = [];
  const blockTypes = new Set(['product', 'hot_product', 'product_list', 'coupon', 'coupon_list']);
  const walk = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (blockTypes.has(node.type)) {
      const attrs = node.attrs || {};
      blocks.push({
        id: attrs.id || generateId(),
        type: node.type,
        ...attrs
      });
    }
    if (node.content) walk(node.content);
  };
  walk(source?.content ?? source);
  return blocks;
};

// ============================================================================
// FUNÇÃO: Enviar Notificação Push via OneSignal (Disparo Inteligente)
// ============================================================================
async function sendOneSignalNotification(
  title: string,
  message: string,
  imageUrl: string | undefined,
  slug: string
): Promise<{ success: boolean; error?: string; recipients?: number }> {
  try {
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seu-site.com';

    if (!restApiKey || !appId) {
      console.error('❌ OneSignal não configurado: ONESIGNAL_REST_API_KEY ou NEXT_PUBLIC_ONESIGNAL_APP_ID ausentes');
      return { success: false, error: 'OneSignal não configurado' };
    }

    if (restApiKey === 'SEU_REST_API_KEY_AQUI' || appId === 'SEU_APP_ID_AQUI') {
      console.warn('⚠️ OneSignal não configurado corretamente. Configure as chaves no .env');
      return { success: false, error: 'OneSignal não configurado corretamente' };
    }

    const postUrl = `${siteUrl}/post/${slug}`;

    const payload: any = {
      app_id: appId,
      // Enviar apenas para usuários inscritos (Subscribed Users)
      included_segments: ['Subscribed Users'],
      contents: { 
        pt: message,
        en: message // Fallback para inglês
      },
      headings: { 
        pt: title,
        en: title
      },
      url: postUrl,
    };

    // Adicionar imagem se disponível
    if (imageUrl) {
      payload.chrome_web_image = imageUrl; // Chrome/Edge
      payload.firefox_icon = imageUrl; // Firefox
      payload.chrome_web_icon = imageUrl; // Ícone pequeno
      payload.big_picture = imageUrl; // Android
      payload.ios_attachments = { id: imageUrl }; // iOS
      payload.huawei_big_picture = imageUrl; // Huawei
    }

    // Configurações adicionais para melhor experiência
    payload.android_channel_id = process.env.ONESIGNAL_ANDROID_CHANNEL_ID || undefined;
    payload.priority = 10; // Alta prioridade
    payload.ttl = 86400; // Time to live: 24 horas

    console.log('🚀 Enviando notificação push via OneSignal:', {
      title,
      message: message.substring(0, 50) + '...',
      url: postUrl,
      hasImage: !!imageUrl,
      segment: 'Subscribed Users'
    });

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${restApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      // Verificar se o erro é por falta de usuários inscritos
      if (result.errors && Array.isArray(result.errors)) {
        const noSubscribersError = result.errors.some((err: string) => 
          err.includes('All included players are not subscribed') ||
          err.includes('No recipients') ||
          err.includes('No subscribed users')
        );

        if (noSubscribersError) {
          console.warn('⚠️ Nenhum usuário inscrito para receber notificações ainda');
          return { 
            success: true, // Não é um erro crítico
            error: 'Nenhum usuário inscrito ainda',
            recipients: 0
          };
        }
      }

      console.error('❌ Erro ao enviar notificação OneSignal:', result);
      return { 
        success: false, 
        error: result.errors?.join(', ') || 'Erro desconhecido',
        recipients: 0
      };
    }

    const recipients = result.recipients || 0;
    console.log('✅ Notificação push enviada com sucesso:', {
      id: result.id,
      recipients: recipients,
      external_id: result.external_id
    });

    return { 
      success: true, 
      recipients: recipients 
    };
  } catch (error: any) {
    console.error('💥 Exceção ao enviar notificação OneSignal:', error);
    // Não retornar erro crítico para não bloquear a publicação do post
    return { 
      success: false, 
      error: error.message,
      recipients: 0
    };
  }
}

// Helper genérico para atualizar índices globais
async function updateGlobalIndex(
  indexFileName: string,
  newItems: any[],
  originPostId: string,
  supabase: ReturnType<typeof getSupabaseServerClient>
) {
  let index: any[] = [];
  const { data, error } = await supabase.storage.from(bucketName).download(indexFileName);
  if (error && (error as any)?.statusCode !== 404) {
    throw error;
  }
  if (!error && data) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      index = Array.isArray(parsed) ? parsed : [];
    } catch {
      index = [];
    }
  }

  if (originPostId) {
    index = index.filter((item: any) => {
      const isFromPost = item.originPostId === originPostId;
      const isThePost = item.id === originPostId;
      return !isFromPost && !isThePost;
    });
  }

  const safeItems = Array.isArray(newItems) ? newItems : (newItems ? [newItems] : []);
  if (safeItems.length > 0) {
    const merged = [...safeItems, ...index];
    const seen = new Set<string>();
    index = merged.filter((item: any) => {
      const itemId = item?.id;
      if (!itemId) return true;
      if (seen.has(itemId)) return false;
      seen.add(itemId);
      return true;
    });
  }

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(indexFileName, createJsonBlob(index), {
      contentType: 'application/json',
      upsert: true
    });

  if (uploadError) {
    throw uploadError;
  }

  return indexFileName;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    if (action !== 'drafts') {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const draftsDir = 'admin/drafts';

    let offset = 0;
    let allFiles: any[] = [];
    while (true) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(draftsDir, { limit: 1000, offset });
      if (error || !data || data.length === 0) break;
      allFiles = [...allFiles, ...data.filter(item => item.name.endsWith('.json'))];
      if (data.length < 1000) break;
      offset += data.length;
    }

    const drafts = (
      await Promise.all(
        allFiles.map(async file => {
          const { data } = await supabase.storage
            .from(bucketName)
            .download(`${draftsDir}/${file.name}`);
          if (!data) return null;
          try {
            const text = await data.text();
            return JSON.parse(text);
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean);

    drafts.sort((a: any, b: any) => {
      const dateA = new Date(a?.lastModified || a?.publishedAt || a?.date || 0).getTime();
      const dateB = new Date(b?.lastModified || b?.publishedAt || b?.date || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ drafts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar rascunhos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { post, action = 'publish', sendPush = false } = body;

    if (!post || !post.id) {
      return NextResponse.json({ error: 'Dados do post inválidos' }, { status: 400 });
    }

    // Validação de segurança para evitar publicações acidentais sem título
    if (action === 'publish' && !post.title) {
       console.warn('Tentativa de publicação sem título bloqueada. Payload:', JSON.stringify(body));
       return NextResponse.json({ error: 'Título é obrigatório para publicação' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const postId = post.id;
    const postsDir = 'fabrica-cupons/posts';
    const draftsDir = 'admin/drafts';
    const productsDir = 'fabrica-cupons/products';
    const cuponsDir = 'fabrica-cupons/cupons';
    const indexesDir = 'fabrica-cupons/indexes';

    // =================================================================================
    // AÇÃO: DELETE
    // =================================================================================
    if (action === 'delete') {
      const baseRemovals = [
        `${postsDir}/${postId}.json`,
        `${draftsDir}/${postId}.json`,
        `admin/posts/${postId}.json`,
        `public/posts/${postId}.json`
      ];

      await supabase.storage.from(bucketName).remove(baseRemovals);

      const listFilesByPrefix = async (folder: string, prefix: string) => {
        let offset = 0;
        const collected: any[] = [];
        while (true) {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .list(folder, { limit: 1000, offset, search: prefix });
          if (error || !data || data.length === 0) break;
          collected.push(...data.filter(item => item.name.startsWith(prefix)));
          if (data.length < 1000) break;
          offset += data.length;
        }
        return collected;
      };

      const [productsList, cuponsList] = await Promise.all([
        listFilesByPrefix(productsDir, `${postId}_`),
        listFilesByPrefix(cuponsDir, `${postId}_`)
      ]);

      const filesToDelete = [
        ...productsList.map(item => `${productsDir}/${item.name}`),
        ...cuponsList.map(item => `${cuponsDir}/${item.name}`)
      ];

      if (filesToDelete.length > 0) {
        await supabase.storage.from(bucketName).remove(filesToDelete);
      }

      await updateGlobalIndex(`${indexesDir}/products-index.json`, [], postId, supabase);
      await updateGlobalIndex(`${indexesDir}/cupons-index.json`, [], postId, supabase);
      await updateGlobalIndex(`${indexesDir}/posts-index.json`, [], postId, supabase);

      return NextResponse.json({ success: true, message: 'Post e itens excluídos com sucesso' });
    }

    if (action === 'delete_draft') {
      const draftId = post.id;
      if (!draftId) {
        return NextResponse.json({ success: false, error: 'ID do rascunho é obrigatório' }, { status: 400 });
      }
      await supabase.storage.from(bucketName).remove([`${draftsDir}/${draftId}.json`]);
      return NextResponse.json({ success: true, message: 'Rascunho excluído com sucesso' });
    }

    // =================================================================================
    // AÇÃO: DRAFT
    // =================================================================================
    if (action === 'draft') {
      const { error: draftError } = await supabase.storage
        .from(bucketName)
        .upload(`${draftsDir}/${postId}.json`, createJsonBlob(post), {
          contentType: 'application/json',
          upsert: true
        });

      if (draftError) {
        throw draftError;
      }

      return NextResponse.json({ success: true, message: 'Rascunho salvo' });
    }

    if (action === 'delete_offer') {
      const offerId = post.id;
      const offerType = post.type;
      if (!offerId || !offerType) {
        return NextResponse.json({ success: false, error: 'ID e tipo da oferta são obrigatórios' }, { status: 400 });
      }

      const isProduct = offerType === 'product' || offerType === 'hot_product';
      const isCoupon = offerType === 'coupon';
      if (!isProduct && !isCoupon) {
        return NextResponse.json({ success: false, error: 'Tipo de oferta inválido' }, { status: 400 });
      }

      const filePath = isProduct ? `${productsDir}/${offerId}.json` : `${cuponsDir}/${offerId}.json`;
      await supabase.storage.from(bucketName).remove([filePath]);

      const indexFile = isProduct ? `${indexesDir}/products-index.json` : `${indexesDir}/cupons-index.json`;
      await updateGlobalIndex(indexFile, [], offerId, supabase);

      return NextResponse.json({ success: true, message: 'Oferta excluída com sucesso!' });
    }

    if (action === 'publish_offer') {
      const offerId = post.id;
      if (!offerId) {
        return NextResponse.json({ success: false, error: 'ID da oferta é obrigatório' }, { status: 400 });
      }

      const offerType = post.type;
      const isProduct = offerType === 'product' || offerType === 'hot_product';
      const isCoupon = offerType === 'coupon';
      if (!isProduct && !isCoupon) {
        return NextResponse.json({ success: false, error: 'Tipo de oferta inválido' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const offerTitle = post.productName || post.name || post.title || 'Oferta';
      const category = post.category || 'Geral';
      const commonProps = {
        originPostId: null,
        originPostCategory: category,
        originPostTitle: offerTitle,
        originPostDate: post.publishedAt || post.date || now,
        originPostSlug: post.slug || generateSlug(offerTitle),
        standaloneOffer: true,
      };

      if (isProduct) {
        const itemData = {
          id: offerId,
          ...post,
          ...commonProps,
          type: offerType,
          category,
          date: post.date || now,
          publishedAt: post.publishedAt || now,
          widgetType: offerType === 'hot_product' ? 'HotProductWidget' : 'ProductWidget'
        };

        await supabase.storage.from(bucketName).upload(
          `${productsDir}/${offerId}.json`,
          createJsonBlob(itemData),
          { contentType: 'application/json', upsert: true }
        );

        await updateGlobalIndex(`${indexesDir}/products-index.json`, [itemData], offerId, supabase);
        return NextResponse.json({ success: true, message: 'Oferta publicada com sucesso!' });
      }

      const itemData = {
        id: offerId,
        ...post,
        ...commonProps,
        type: 'coupon',
        category,
        date: post.date || now,
        publishedAt: post.publishedAt || now,
        widgetType: 'CouponWidget'
      };

      await supabase.storage.from(bucketName).upload(
        `${cuponsDir}/${offerId}.json`,
        createJsonBlob(itemData),
        { contentType: 'application/json', upsert: true }
      );

      await updateGlobalIndex(`${indexesDir}/cupons-index.json`, [itemData], offerId, supabase);
      return NextResponse.json({ success: true, message: 'Oferta publicada com sucesso!' });
    }

    // =================================================================================
    // AÇÃO: PUBLISH - Lógica Principal
    // =================================================================================

    await uploadPost(postId, post.json || post, post.html || '', post.title);

    // B. Função de Limpeza (Anti-Zumbi)
    const cleanupPromise = (async () => {
      const listFilesByPrefix = async (folder: string, prefix: string) => {
        let offset = 0;
        const collected: any[] = [];
        while (true) {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .list(folder, { limit: 1000, offset, search: prefix });
          if (error || !data || data.length === 0) break;
          collected.push(...data.filter(item => item.name.startsWith(prefix)));
          if (data.length < 1000) break;
          offset += data.length;
        }
        return collected;
      };

      const [productsList, cuponsList] = await Promise.all([
        listFilesByPrefix(productsDir, `${postId}_`),
        listFilesByPrefix(cuponsDir, `${postId}_`)
      ]);
      const filesToDelete = [
        ...productsList.map(item => `${productsDir}/${item.name}`),
        ...cuponsList.map(item => `${cuponsDir}/${item.name}`)
      ];
      if (filesToDelete.length > 0) {
        await supabase.storage.from(bucketName).remove(filesToDelete);
      }
    })();

    await cleanupPromise;

    const productItems: any[] = [];
    const couponItems: any[] = [];
    const uploadPromises: Promise<any>[] = [];

    const blocksSource = post?.json || post?.jsonContent || post?.content;
    const blocks = Array.isArray(post.blocks) && post.blocks.length > 0
      ? post.blocks
      : extractBlocksFromEditor(blocksSource);
    
    // Processar blocos
    for (const block of blocks) {
      const commonProps = {
        originPostId: postId,
        originPostCategory: post.category,
        originPostTitle: post.title, // Útil para contexto
        originPostDate: post.date,   // Útil para ordenação
        originPostSlug: post.slug || generateSlug(post.title),
      };

      if (['product', 'hot_product', 'product_list'].includes(block.type)) {
        if (block.items && Array.isArray(block.items)) {
          // Lista de Produtos

          // 1. Salvar o bloco da lista como um item único no índice
          // Isso permite renderizar o ProductListWidget corretamente (agrupado)
          const listBlockData = {
            id: block.id,
            ...block,
            ...commonProps,
            category: block.category || post.category,
            type: 'product_list',
            widgetType: 'ProductListWidget'
          };
          // Adiciona ao índice
          productItems.push(listBlockData);
          // Salva micro-doc do bloco (opcional, mas bom para consistência)
          uploadPromises.push(
            supabase.storage.from(bucketName).upload(
              `${productsDir}/${postId}_${block.id}_list.json`,
              createJsonBlob(listBlockData),
              { contentType: 'application/json', upsert: true }
            )
          );

          block.items.forEach((item: any) => {
            const itemId = item?.id || generateId();
            const itemData = {
              id: itemId,
              ...item,
              ...commonProps,
              category: item.category || block.category || post.category,
              type: 'product',
              widgetType: item.widgetType || 'ProductWidget'
            };
            productItems.push(itemData);
            uploadPromises.push(
              supabase.storage.from(bucketName).upload(
                `${productsDir}/${postId}_${itemId}.json`,
                createJsonBlob(itemData),
                { contentType: 'application/json', upsert: true }
              )
            );
          });
        } else {
          // Produto Único (ou hot_product)
          // Se for hot_product ou product simples, geralmente os dados estão no próprio bloco
          // ou em uma propriedade 'product' dentro do bloco, dependendo da estrutura do editor.
          // Baseado no save-posts.js antigo, ele usava o próprio bloco ou propriedades dele.
          // Vamos assumir que o bloco JÁ É o objeto do produto ou contém os dados.
          // O código antigo fazia: const itemData = { id: block.id, ...block, ...commonProps, type: block.type };
          
          const itemData = {
            id: block.id,
            ...block,
            ...commonProps,
            category: block.category || post.category,
            type: block.type, // 'product' ou 'hot_product'
            widgetType: block.type === 'hot_product' ? 'HotProductWidget' : 'ProductWidget'
          };
          
          productItems.push(itemData);
          uploadPromises.push(
            supabase.storage.from(bucketName).upload(
              `${productsDir}/${postId}_${block.id}.json`,
              createJsonBlob(itemData),
              { contentType: 'application/json', upsert: true }
            )
          );
        }
      } else if (['coupon', 'coupon_list'].includes(block.type)) {
         if (block.items && Array.isArray(block.items)) {
          // Lista de Cupons

          // 1. Salvar o bloco da lista como um item único no índice
          const listBlockData = {
            id: block.id,
            ...block,
            ...commonProps,
            type: 'coupon_list',
            widgetType: 'CouponListWidget'
          };
          couponItems.push(listBlockData);
          uploadPromises.push(
            supabase.storage.from(bucketName).upload(
              `${cuponsDir}/${postId}_${block.id}_list.json`,
              createJsonBlob(listBlockData),
              { contentType: 'application/json', upsert: true }
            )
          );

          // 2. Processar itens individuais
          block.items.forEach((item: any) => {
            const itemId = item?.id || generateId();
            const itemData = { 
              id: itemId,
              ...item, 
              ...commonProps, 
              type: 'coupon',
              widgetType: 'CouponListWidget' 
            };
            couponItems.push(itemData);
            uploadPromises.push(
              supabase.storage.from(bucketName).upload(
                `${cuponsDir}/${postId}_${itemId}.json`,
                createJsonBlob(itemData),
                { contentType: 'application/json', upsert: true }
              )
            );
          });
        } else {
          // Cupom Único
          const itemData = {
            id: block.id,
            ...block,
            ...commonProps,
            type: 'coupon',
            widgetType: 'CouponWidget'
          };
          couponItems.push(itemData);
          uploadPromises.push(
            supabase.storage.from(bucketName).upload(
              `${cuponsDir}/${postId}_${block.id}.json`,
              createJsonBlob(itemData),
              { contentType: 'application/json', upsert: true }
            )
          );
        }
      }
    }

    await Promise.all(uploadPromises);

    // D. Atualização de Índices (Sequencial para evitar race conditions)
    
    await updateGlobalIndex(`${indexesDir}/products-index.json`, productItems, postId, supabase);
    await updateGlobalIndex(`${indexesDir}/cupons-index.json`, couponItems, postId, supabase);

    // Calcular metadados de contagem
    const totalCoupons = post.blocks?.reduce((acc: number, block: any) => {
      if (block.type === 'coupon') return acc + 1;
      if (block.type === 'coupon_list') return acc + (block.items?.length || 0);
      return acc;
    }, 0) || 0;

    const hasHotProduct = post.blocks?.some((block: any) => block.type === 'hot_product') || false;

    console.log('[API save-posts] Metadados calculados:', {
      postId,
      title: post.title,
      totalCoupons,
      hasHotProduct,
      blocksCount: post.blocks?.length || 0,
      blocksTypes: post.blocks?.map((b: any) => b.type) || []
    });

    // 3. Índice de Posts (Leve)
    const postMetadata = {
      id: post.id,
      title: post.title,
      date: post.date,
      category: post.category,
      thumbnail: post.thumbnail,
      status: 'published',
      publishedAt: post.publishedAt,
      slug: post.slug || generateSlug(post.title),
      isCouponPost: post.isCouponPost,
      isInformativePost: post.isInformativePost,
      excerpt: post.excerpt,
      totalCoupons,
      hasHotProduct,
      originPostId: postId
    };
    await updateGlobalIndex(`${indexesDir}/posts-index.json`, [postMetadata], postId, supabase);

    try {
       await supabase.storage.from(bucketName).remove([`${draftsDir}/${postId}.json`]);
    } catch (e) {}

    // ============================================================================
    // ENVIAR NOTIFICAÇÃO PUSH (se solicitado)
    // ============================================================================
    let pushNotificationResult = null;
    if (sendPush && action === 'publish') {
      const notificationTitle = post.title;
      const notificationMessage = post.excerpt || 
        `Novo post publicado: ${post.title}` || 
        'Confira nosso novo conteúdo!';
      
      // Priorizar imagem gerada pela IA, depois thumbnail
      const notificationImage = post.aiImage || post.thumbnail || undefined;
      const notificationSlug = post.slug || generateSlug(post.title);

      console.log('📱 Preparando notificação push:', {
        title: notificationTitle,
        hasImage: !!notificationImage,
        imageSource: post.aiImage ? 'AI Generated' : (post.thumbnail ? 'Thumbnail' : 'None'),
        slug: notificationSlug
      });

      pushNotificationResult = await sendOneSignalNotification(
        notificationTitle,
        notificationMessage,
        notificationImage,
        notificationSlug
      );

      if (pushNotificationResult.success) {
        if (pushNotificationResult.recipients === 0) {
          console.log('ℹ️ Notificação preparada, mas nenhum usuário inscrito ainda');
        } else {
          console.log(`✅ Notificação push enviada para ${pushNotificationResult.recipients} usuário(s)`);
        }
      } else {
        console.warn('⚠️ Falha ao enviar notificação push:', pushNotificationResult.error);
        // Não bloquear a publicação do post por falha na notificação
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Post publicado e sincronizado com sucesso!',
      pushNotification: pushNotificationResult ? {
        sent: pushNotificationResult.success,
        recipients: pushNotificationResult.recipients || 0,
        error: pushNotificationResult.error
      } : null,
    });

  } catch (error: any) {
    console.error('❌ Erro na API save-posts:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    }, { status: 500 });
  }
}
