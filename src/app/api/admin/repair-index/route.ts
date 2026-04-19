
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const bucketName = 'portal-posts';

// Helper para gerar slug (duplicado de posts/route.ts por segurança)
const generateSlug = (title: string) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();

    const postsDir = 'admin/posts';
    const indexesDir = 'fabrica-cupons/indexes';

    console.log('Listando posts...');
    let offset = 0;
    let allFiles: any[] = [];
    while (true) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(postsDir, { limit: 1000, offset });
      if (error || !data || data.length === 0) break;
      allFiles = [...allFiles, ...data];
      if (data.length < 1000) break;
      offset += data.length;
    }

    console.log(`Encontrados ${allFiles.length} arquivos totais.`);

    const jsonFiles = allFiles.filter(file => file.name.endsWith('.json'));
    console.log(`Filtrados ${jsonFiles.length} arquivos JSON.`);

    const fetchPromises = jsonFiles.map(async (file) => {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .download(`${postsDir}/${file.name}`);
        if (error || !data) return null;

        const text = await data.text();
        const post = JSON.parse(text);

        const totalCoupons = post.blocks?.reduce((acc: number, block: any) => {
          if (block.type === 'coupon') return acc + 1;
          if (block.type === 'coupon_list') return acc + (block.items?.length || 0);
          return acc;
        }, 0) || 0;

        const hasHotProduct = post.blocks?.some((block: any) => block.type === 'hot_product') || false;

        return {
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
          originPostId: post.id
        };
      } catch (e) {
        console.error(`Erro ao processar post ${file.name}:`, e);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    const validPosts = results.filter(p => p !== null);

    // Ordenar por data (decrescente)
    validPosts.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    console.log(`Salvando índice com ${validPosts.length} posts...`);

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`${indexesDir}/posts-index.json`, new Blob([JSON.stringify(validPosts)], { type: 'application/json' }), {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    return NextResponse.json({
      success: true,
      message: `Índice reparado com sucesso! ${validPosts.length} posts processados.`,
      count: validPosts.length
    });

  } catch (error: any) {
    console.error('Erro ao reparar índice:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno'
    }, { status: 500 });
  }
}
