import { getSupabaseClient, getSupabaseServerClient } from '../lib/supabase';
import { revalidateTag } from 'next/cache';

const bucketName = 'portal-posts';

const createJsonBlob = (payload: unknown) => {
  return new Blob([JSON.stringify(payload)], { type: 'application/json' });
};

export const uploadPost = async (
  id: string,
  jsonContent: any,
  htmlContent: string,
  title?: string
) => {
  if (typeof window !== 'undefined') {
    throw new Error('uploadPost disponível apenas no servidor');
  }

  const supabase = getSupabaseServerClient();
  const postsPath = `fabrica-cupons/posts/${id}.json`;

  const metadata = jsonContent && typeof jsonContent === 'object' ? jsonContent : {};
  const postPayload = {
    id,
    title: title || metadata.title,
    content: jsonContent,
    html: htmlContent || metadata.html || '',
    date: metadata.date,
    slug: metadata.slug,
    description: metadata.description,
    image: metadata.image,
    category: metadata.category,
    tags: metadata.tags,
    excerpt: metadata.excerpt,
    thumbnail: metadata.thumbnail,
    thumbnailAlt: metadata.thumbnailAlt,
    publishedAt: metadata.publishedAt,
    isCouponPost: metadata.isCouponPost,
    isInformativePost: metadata.isInformativePost,
    blocks: metadata.blocks,
    json: jsonContent,
    aiImage: metadata.aiImage,
    status: 'published'
  };

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(postsPath, createJsonBlob(postPayload), {
      contentType: 'application/json',
      upsert: true
    });

  if (error) {
    throw error;
  }

  try {
    // Revalida cache por tag após publicação
    revalidateTag('post-detail', { expire: 0 });
    revalidateTag(id, { expire: 0 });
  } catch (e) {
    console.error('Erro ao revalidar cache:', e);
  }

  return { postsPath };
};

export const getPublicPost = async (id: string) => {
  const supabase = getSupabaseClient();
  const path = `public/posts/${id}.json`;
  const { data, error } = await supabase.storage.from(bucketName).download(path);

  if (error || !data) {
    return null;
  }

  try {
    const text = await data.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
};
