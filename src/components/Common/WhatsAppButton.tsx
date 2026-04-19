import React, { useState, useEffect } from 'react';
import { X, Users, Tag, Clock, ShieldOff, Shield } from 'lucide-react';

interface WhatsAppButtonProps {
  visible?: boolean;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ visible = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Verificar se foi fechado permanentemente
    const closed = localStorage.getItem('whatsappButtonClosed');
    if (closed === 'true') {
      setIsPermanentlyClosed(true);
    }
  }, []);

  // Se a prop visible for false, não renderiza nada
  if (!visible || !isMounted) {
    return null;
  }

  // Link do seu grupo WhatsApp (substitua pelo seu)
  const whatsappGroupLink = 'https://chat.whatsapp.com/SEU_CODIGO_DO_GRUPO';
  
  // Seu número para contato direto (opcional)
  const whatsappNumber = '5532984780795';
  const whatsappMessage = 'Olá! Vi seu site Fábrica de Cupons e gostaria de mais informações sobre as ofertas.';

  const handleGroupClick = () => {
    window.open(whatsappGroupLink, '_blank', 'noopener,noreferrer');
    setIsExpanded(false);
  };

  const handleDirectClick = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    setIsExpanded(false);
  };

  const handleClosePermanently = () => {
    setIsPermanentlyClosed(true);
    setIsExpanded(false);
    localStorage.setItem('whatsappButtonClosed', 'true');
  };

  const handleResetPermanentlyClosed = () => {
    setIsPermanentlyClosed(false);
    localStorage.removeItem('whatsappButtonClosed');
  };

  // Se o botão foi fechado permanentemente, não renderizar nada
  if (isPermanentlyClosed) {
    return null;
  }

  return (
    <>
      {/* Botão Principal com logo oficial do WhatsApp - SEMPRE VERDE E BRANCO */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
          isExpanded 
            ? 'bg-green-600 hover:bg-green-700' // Mantido verde mesmo quando expandido
            : 'bg-green-500 hover:bg-green-600'
        }`}
        aria-label="Botão do WhatsApp"
      >
        {isExpanded ? (
          <X className="text-white" size={28} />
        ) : (
          // Logo oficial do WhatsApp - SEMPRE BRANCA
          <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.677-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.437 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.892 0-3.18-1.24-6.162-3.495-8.411"/>
          </svg>
        )}
        
        {/* Badge de notificação - SEMPRE VERMELHO */}
        {!isExpanded && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            1
          </div>
        )}
      </button>

      {/* Menu Expandido - ADAPTADO PARA TEMA ESCURO */}
      {isExpanded && (
        <div className="fixed bottom-24 right-6 z-50 animate-fade-in-up">
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 w-64 border border-gray-200 dark:border-gray-700`}>
            {/* Header com logo do WhatsApp - VERDE E BRANCO */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                {/* Logo oficial do WhatsApp - SEMPRE VERDE (#25D366) */}
                <svg className="w-6 h-6" fill="#25D366" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.677-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.437 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.892 0-3.18-1.24-6.162-3.495-8.411"/>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Fale Conosco</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escolha uma opção</p>
            </div>

            {/* Opção 1: Grupo VIP - VERDE E BRANCO */}
            <button
              onClick={handleGroupClick}
              className="w-full mb-3 p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02]"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                {/* Ícone sempre branco sobre fundo verde */}
                <Users size={20} className="text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Grupo WhatsApp</div>
                <div className="text-sm text-white/90">Ofertas atualizadas</div>
              </div>
            </button>

            {/* Info - ADAPTADO PARA TEMA ESCURO */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Clock size={14} className="text-gray-600 dark:text-gray-400" />
                <span>Cupons diários</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Tag size={14} className="text-gray-600 dark:text-gray-400" />
                <span>Promoções que cabem no seu bolso</span>
              </div>
            </div>

            {/* Opção para fechar permanentemente */}
            <button
              onClick={handleClosePermanently}
              className="w-full mt-4 p-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Shield size={16} />
              <span className="text-sm font-medium">Não mostrar novamente</span>
            </button>
          </div>

          {/* Seta para baixo - ADAPTADA PARA TEMA ESCURO */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 border-r border-b border-gray-200 dark:border-gray-700"></div>
        </div>
      )}

      {/* Animação de fundo - SEMPRE VERDE */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-green-400/30"></div>
      )}

      {/* Estilos de animação */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default WhatsAppButton;