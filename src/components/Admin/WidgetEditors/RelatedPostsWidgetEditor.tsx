import React, { useState } from 'react';
import { RelatedPostsBlock, RelatedPostItem } from '../../../types';
import { usePost } from '../../../contexts/PostContext';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import { BiTrashAlt, BiDetail } from 'react-icons/bi';
import { MdOutlinePostAdd } from 'react-icons/md';
import Image from 'next/image';

interface RelatedPostsWidgetEditorProps {
    block: RelatedPostsBlock;
    onUpdate: (field: string, value: any) => void;
}

const RelatedPostsWidgetEditor: React.FC<RelatedPostsWidgetEditorProps> = ({
    block,
    onUpdate,
}) => {
    const { posts } = usePost() || { posts: [] };
    const [searchTerm, setSearchTerm] = useState('');

    const selectedPosts = block.posts || [];

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedPosts.some(selected => selected.id === post.id)
    );

    const handleAddPost = (post: any) => {
        const newItem: RelatedPostItem = {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || '',
            slug: post.slug || '',
            image: post.thumbnail,
        };
        onUpdate('posts', [...selectedPosts, newItem]);
    };

    const handleRemovePost = (postId: string) => {
        onUpdate('posts', selectedPosts.filter(p => p.id !== postId));
    };

    const inputLabelStyles = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest";
    const baseInputStyles = "w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white text-sm";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
                    <MdOutlinePostAdd size={20} className="text-blue-500" />
                    <span>Posts Relacionados</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={inputLabelStyles}>Buscar Posts</label>
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Digite para buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${baseInputStyles} pl-10`}
                            />
                        </div>
                    </div>

                    {filteredPosts.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                            {filteredPosts.map(post => (
                                <button
                                    key={post.id}
                                    onClick={() => handleAddPost(post)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                                >
                                    <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                                        <Image src={post.thumbnail || '/placeholder-post.png'} alt={post.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{post.title}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">{post.category}</p>
                                    </div>
                                    <HiOutlinePlus className="text-blue-500" size={20} />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {searchTerm ? 'Nenhum post encontrado' : 'Nenhum post disponível'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <label className={inputLabelStyles}>Posts Selecionados ({selectedPosts.length})</label>
                {selectedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {selectedPosts.map((post, index) => (
                            <div
                                key={post.id}
                                className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm group"
                            >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                                    <Image src={post.image || '/placeholder-post.png'} alt={post.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{post.excerpt}</p>
                                </div>
                                <button
                                    onClick={() => handleRemovePost(post.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                    <BiTrashAlt size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <BiDetail size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum post selecionado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RelatedPostsWidgetEditor;
