import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RelatedPostsBlock } from '../../types';

interface RelatedPostsWidgetProps {
    data: RelatedPostsBlock;
}

const RelatedPostsWidget: React.FC<RelatedPostsWidgetProps> = ({ data }) => {
    const posts = data.posts || [];

    return (
        <div className="my-8 rounded-xl overflow-hidden border border-blue-100/70 dark:border-blue-900/40 bg-white dark:bg-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.08)] dark:shadow-[0_6px_18px_rgba(15,23,42,0.35)] hover:shadow-[0_10px_24px_rgba(37,99,235,0.18)] transition-shadow">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 px-6 py-4 border-b border-blue-100/70 dark:border-blue-900/40">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
                    Leia também
                </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {posts.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100/70 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nenhum post relacionado</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clique com o botão direito para adicionar posts</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/post/${post.slug || post.id}`}
                            className="group flex items-center gap-4 p-4 hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors"
                        >
                            <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-blue-100/70 dark:border-blue-900/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] group-hover:shadow-[0_6px_16px_rgba(37,99,235,0.2)] transition-all">
                                <Image
                                    src={post.image || '/placeholder-post.png'}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors line-clamp-2 leading-tight">
                                    {post.title}
                                </h4>
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default RelatedPostsWidget;
