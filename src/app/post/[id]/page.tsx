import { Suspense } from 'react';
import PostDetailClient from './PostDetailClient';
import { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

// Loading component
function PostDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Carregando publicação...
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  
  return {
    title: `Post ${id} | Fábrica de Cupons`,
    description: 'Confira esta publicação na Fábrica de Cupons',
  };
}

export default function PostDetailPage({ params }: PageProps) {
  const { id } = params;

  return (
    <Suspense fallback={<PostDetailLoading />}>
      <PostDetailClient postId={id} />
    </Suspense>
  );
}
