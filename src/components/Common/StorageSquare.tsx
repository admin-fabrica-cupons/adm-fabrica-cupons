import React from 'react';
import Image from 'next/image';
import { PARTNER_STORES, STORE_THEMES } from '../../constants';

interface StoreCardData {
    name: string;
    logo?: string;
    theme?: any;
    couponCount: number;
    description?: string;
}

interface StorageSquareProps {
    store: StoreCardData;
    onClick: () => void;
}

const StorageSquare: React.FC<StorageSquareProps> = ({ store, onClick }) => {
    const theme = STORE_THEMES[store.name] || STORE_THEMES['Default'];
    const partnerKey = Object.keys(PARTNER_STORES).find(
        key => key.toLowerCase() === store.name.trim().toLowerCase()
    );
    const partnerLogo = partnerKey ? PARTNER_STORES[partnerKey as keyof typeof PARTNER_STORES]?.logoUrl : undefined;
    const logoUrl = partnerLogo || `https://placehold.co/100x100?text=${store.name.charAt(0)}`;
    
    // Usar as classes de estilo do tema
    const containerClass = theme.container;
    const badgeClass = theme.badge;
    const borderClass = theme.borderColor || 'border-transparent';
    const textClass = theme.text || (containerClass.includes('text-white') ? 'text-white' : 'text-gray-900 dark:text-white');

    return (
        <button
            onClick={onClick}
            className={`group aspect-square rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br ${containerClass} border ${borderClass} shadow-md overflow-hidden relative`}
        >
            <div className="flex-1 flex flex-col items-center justify-center w-full z-10 gap-3">
                {/* Logo da loja */}
                <div className="relative w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 overflow-hidden">
                    <Image
                        src={logoUrl}
                        alt={store.name}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-contain p-2.5"
                    />
                </div>

                {/* Nome da loja */}
                <h3 className={`font-bold text-center text-sm line-clamp-2 ${textClass}`}>
                    {store.name}
                </h3>

                {/* Contagem de cupons */}
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeClass} shadow-sm`}>
                    {store.couponCount} {store.couponCount === 1 ? 'cupom' : 'cupons'}
                </div>
            </div>
            
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    );
};

export default StorageSquare;
