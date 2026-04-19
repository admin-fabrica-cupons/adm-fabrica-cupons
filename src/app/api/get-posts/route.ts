import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { downloadParsedPostsIndex, getStorageIndexPath } from '@/lib/storage-post-index';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'index';
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    const supabase = getSupabaseClient();
    const bucketName = 'portal-posts';

    const fileName = getStorageIndexPath(type);

    if (type === 'detail') {
      if (!id) {
        return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
      }
      // Tenta buscar o post detalhado
      const { data, error } = await supabase.storage.from(bucketName).download(`fabrica-cupons/posts/${id}.json`);
      if (error || !data) {
         // Tenta fallback antigo
         const { data: data2, error: error2 } = await supabase.storage.from(bucketName).download(`admin/posts/${id}.json`);
         if (error2 || !data2) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
         const text = await data2.text();
         return NextResponse.json(JSON.parse(text));
      }
      const text = await data.text();
      return NextResponse.json(JSON.parse(text));
    }

    if (!fileName) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    console.log(`[API get-posts] Baixando ${fileName}`);
    let posts = (await downloadParsedPostsIndex(fileName)) as Record<string, unknown>[];

    // Filtrar por status se especificado
    if (status === 'published') {
      posts = posts.filter((p: any) => p.status === 'published' || !p.status);
    } else if (status === 'draft') {
      posts = posts.filter((p: any) => p.status === 'draft');
    }

    // Ordenar por data de publicação (mais recente primeiro)
    posts.sort((a: any, b: any) => {
      const dateA = new Date(a.publishedAt || a.date || 0).getTime();
      const dateB = new Date(b.publishedAt || b.date || 0).getTime();
      return dateB - dateA;
    });

    if (posts.length > 0) {
      console.log('[API get-posts] Exemplo de post retornado:', {
        id: posts[0].id,
        title: posts[0].title,
        totalCoupons: posts[0].totalCoupons,
        hasHotProduct: posts[0].hasHotProduct,
        isInformativePost: posts[0].isInformativePost,
        hasBlocks: !!posts[0].blocks
      });
    }

    // Para o tipo 'index', retornar apenas o array de posts para compatibilidade
    const responseData = type === 'index' ? posts : { posts, type };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na API get-posts:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar dados' },
      { status: 500 }
    );
  }
}