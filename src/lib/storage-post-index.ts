import { getSupabaseClient } from '@/lib/supabase';

const BUCKET = 'portal-posts';

export function getStorageIndexPath(
  type: string
): 'fabrica-cupons/indexes/products-index.json' | 'fabrica-cupons/indexes/cupons-index.json' | 'fabrica-cupons/indexes/posts-index.json' | null {
  if (type === 'products') return 'fabrica-cupons/indexes/products-index.json';
  if (type === 'cupons') return 'fabrica-cupons/indexes/cupons-index.json';
  if (type === 'index') return 'fabrica-cupons/indexes/posts-index.json';
  return null;
}

export async function downloadParsedPostsIndex(fileName: string): Promise<unknown[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(BUCKET).download(fileName);
  if (error || !data) return [];
  const text = await data.text();
  try {
    const json = JSON.parse(text) as unknown;
    if (Array.isArray(json)) return json;
    if (json && typeof json === 'object' && 'posts' in json && Array.isArray((json as { posts: unknown }).posts)) {
      return (json as { posts: unknown[] }).posts;
    }
    return [];
  } catch {
    return [];
  }
}
