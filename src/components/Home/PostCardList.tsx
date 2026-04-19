'use client';

import React, { useMemo } from 'react';
import PostCard from '../Post/PostCard';
import CouponPostCard from '../Post/CouponCard';
import PostCardHorizontal from './PostCardHorizontal';
import { BlogPost } from '../../types';
import { isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO } from 'date-fns';
import { Calendar, Clock, CalendarDays, Archive } from 'lucide-react';

interface PostCardListProps {
    viewMode: 'grid' | 'cupons' | 'list' | 'informativo';
    postsToRender: BlogPost[];
    selectedPostId: string | null;
    lastPostElementRef: any;
}

const PostCardList: React.FC<PostCardListProps> = ({
    viewMode,
    postsToRender,
    selectedPostId,
    lastPostElementRef
}) => {
    const getGroupKey = (dateStr: string) => {
        try {
            const date = parseISO(dateStr);
            if (isToday(date)) return 'Hoje';
            if (isYesterday(date)) return 'Ontem';
            if (isThisWeek(date, { weekStartsOn: 1 })) return 'Nesta Semana';
            if (isThisMonth(date)) return 'Neste Mês';
            if (isThisYear(date)) return 'Neste Ano';
            return 'Antigos';
        } catch (e) {
            return 'Antigos';
        }
    };

    const getGroupIcon = (group: string) => {
        switch (group) {
            case 'Hoje': return <Clock className="w-5 h-5 text-green-500" />;
            case 'Ontem': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'Nesta Semana': return <Calendar className="w-5 h-5 text-purple-500" />;
            case 'Neste Mês': return <CalendarDays className="w-5 h-5 text-orange-500" />;
            case 'Neste Ano': return <CalendarDays className="w-5 h-5 text-yellow-500" />;
            default: return <Archive className="w-5 h-5 text-gray-500" />;
        }
    };

    const groupedPosts = useMemo(() => {
        const groups: Record<string, BlogPost[]> = {};
        postsToRender.forEach(post => {
            const key = getGroupKey(post.date);
            if (!groups[key]) groups[key] = [];
            groups[key].push(post);
        });
        return groups;
    }, [postsToRender]);

    const groupOrder = ['Hoje', 'Ontem', 'Nesta Semana', 'Neste Mês', 'Neste Ano', 'Antigos'];

    const renderPosts = (posts: BlogPost[]) => {
        if (viewMode === 'list') {
            return (
                <div className="space-y-6 max-w-4xl mx-auto">
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            data-post-id={post.id}
                            ref={index === posts.length - 1 && posts === postsToRender ? (lastPostElementRef as any) : null}
                            className="scroll-mt-32 transition-all duration-300"
                        >
                            <PostCardHorizontal post={post} />
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className={`grid gap-6
                ${viewMode === 'cupons' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
                    viewMode === 'informativo' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
                animate-in fade-in duration-500
            `}>
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        data-post-id={post.id}
                        ref={null} // Ref handling needs to be smarter if we want infinite scroll to trigger on the absolute last item
                        className={`scroll-mt-32 transition-all duration-300 ${selectedPostId === post.id ? 'ring-4 ring-blue-500 ring-offset-4 rounded-2xl' : ''
                            }`}
                        style={{ scrollMarginTop: '120px' }}
                    >
                        {viewMode === 'cupons' ? (
                            <CouponPostCard post={post} />
                        ) : (
                            <PostCard post={post} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // Flatten posts to find the true last index for ref
    const flatPosts = groupOrder.flatMap(group => groupedPosts[group] || []);

    return (
        <div className="space-y-10">
            {groupOrder.map(group => {
                const posts = groupedPosts[group];
                if (!posts || posts.length === 0) return null;

                return (
                    <div key={group} className="space-y-4">
                        <div className="flex items-center gap-3 px-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                            {getGroupIcon(group)}
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {group}
                            </h3>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {posts.length}
                            </span>
                        </div>
                        
                        {/* We need to pass the ref to the last item of the LAST group that has items */}
                        {viewMode === 'list' ? (
                             <div className="space-y-6 max-w-4xl mx-auto">
                                {posts.map((post, index) => {
                                    const isLastGlobal = post.id === flatPosts[flatPosts.length - 1].id;
                                    return (
                                        <div
                                            key={post.id}
                                            data-post-id={post.id}
                                            ref={isLastGlobal ? (lastPostElementRef as any) : null}
                                            className="scroll-mt-32 transition-all duration-300"
                                        >
                                            <PostCardHorizontal post={post} />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={`grid gap-6
                                ${viewMode === 'cupons' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
                                    viewMode === 'informativo' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
                                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
                                animate-in fade-in duration-500
                            `}>
                                {posts.map((post, index) => {
                                    const isLastGlobal = post.id === flatPosts[flatPosts.length - 1].id;
                                    return (
                                        <div
                                            key={post.id}
                                            data-post-id={post.id}
                                            ref={isLastGlobal ? (lastPostElementRef as any) : null}
                                            className={`scroll-mt-32 transition-all duration-300 ${selectedPostId === post.id ? 'ring-4 ring-blue-500 ring-offset-4 rounded-2xl' : ''
                                                }`}
                                            style={{ scrollMarginTop: '120px' }}
                                        >
                                            {viewMode === 'cupons' ? (
                                                <CouponPostCard post={post} />
                                            ) : (
                                                <PostCard post={post} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PostCardList;
