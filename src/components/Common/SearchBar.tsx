import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Search, Ticket, Smartphone, Book, Star, Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { GiClothes } from 'react-icons/gi';
import { useRouter } from 'next/navigation';
import { usePost } from '../../contexts/PostContext';
import { useUI } from '../../contexts/UIContext';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface SearchBarProps {
  isMobile?: boolean;
  className?: string;
  variant?: 'default' | 'navbar';
  tone?: 'blue' | 'emerald' | 'cyan' | 'pink';
}

export const SearchBar = ({
  isMobile = false,
  className = '',
  variant = 'default',
}: SearchBarProps) => {
  const postContext = usePost();
  const posts = postContext ? postContext.posts : [];
  const uiContext = useUI();
  const searchQuery = uiContext?.searchQuery || '';
  const onSearch = uiContext?.setSearchQuery;
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(target) &&
        inputWrapperRef.current && !inputWrapperRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate position on scroll/resize
  const updatePosition = useCallback(() => {
    if (inputWrapperRef.current && showSuggestions) {
      const rect = inputWrapperRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [showSuggestions]);

  useEffect(() => {
    if (!showSuggestions) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSuggestions, updatePosition]);

  // Also update when query changes
  useEffect(() => {
    updatePosition();
  }, [searchQuery, updatePosition]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (onSearch) onSearch(query);
    setShowSuggestions(query.length > 0);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const suggestions = posts
    .filter((post: any) => {
      const query = searchQuery.toLowerCase();
      const titleMatch = (post.title || '').toLowerCase().includes(query);
      const categoryMatch = (post.category || '').toLowerCase().includes(query);
      return titleMatch || categoryMatch;
    })
    .slice(0, 5);

  const handleSelectPost = (postId: string) => {
    router.push(`/post/${postId}`);
    setShowSuggestions(false);
    if (onSearch) onSearch('');
  };

  const getSuggestionIcon = (post: any) => {
    if (post.category === 'Cupons') return <Ticket size={14} className="text-emerald-500" />;
    if (post.category === 'Tecnologia') return <Smartphone size={14} className="text-blue-500" />;
    if (post.category === 'Informativos') return <Book size={14} className="text-cyan-500" />;
    if (post.category === 'Moda') return <GiClothes size={14} className="text-pink-500" />;
    return <Star size={14} className="text-yellow-500" />;
  };

  if (!mounted) return null;

  const inputBaseClass = variant === 'navbar'
    ? `block w-full pl-10 pr-24 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all text-sm border-2 border-yellow-400 dark:border-yellow-500/70 focus:ring-yellow-400/40 focus:border-yellow-500 dark:focus:border-yellow-400 ${searchQuery ? 'shadow-lg shadow-yellow-500/20' : 'hover:border-yellow-300 dark:hover:border-yellow-500/70'} disabled:opacity-50`
    : `block w-full pl-10 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all text-sm border border-yellow-400 dark:border-yellow-500/70 focus:ring-yellow-400/40 shadow-sm ${searchQuery ? 'shadow-lg shadow-yellow-500/20' : 'hover:border-yellow-300 dark:hover:border-yellow-500/70'} disabled:opacity-50`;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group" ref={inputWrapperRef}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`${variant === 'navbar' ? 'h-5 w-5' : 'h-4 w-4'} ${searchQuery ? 'text-yellow-500' : 'text-gray-400'}`} />
        </div>
        <input
          type="text"
          placeholder="Buscar ofertas, cupons, artigos..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchQuery && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className={inputBaseClass}
        />
        {variant === 'navbar' && (
          <button
            onClick={handleSearchSubmit}
            disabled={!searchQuery.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 rounded-lg text-gray-900 dark:text-gray-900 text-sm font-semibold flex items-center transition-all bg-yellow-400 hover:bg-yellow-500 ${!searchQuery.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <span>Buscar</span>
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="absolute z-10 bg-white dark:bg-slate-800 rounded-md shadow-lg" style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}>
          {suggestions.map((p: any) => (
            <div key={p.id} className="flex items-center px-3 py-2 hover:bg-yellow-50 cursor-pointer" onMouseDown={() => handleSelectPost(p.id)}>
              {getSuggestionIcon(p)}
              <span className="ml-2 text-sm">{p.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
