import React, { useState, useEffect } from 'react';
import { X, Users, Zap, Clock, Gift, Smartphone, Shield, TrendingUp } from 'lucide-react';

interface WhatsAppBannerProps {
  onClose?: () => void;
  closable?: boolean;
}

const WhatsAppBanner: React.FC<WhatsAppBannerProps> = ({ onClose, closable = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [memberCount, setMemberCount] = useState(587);
  const [isMounted, setIsMounted] = useState(false);
  
  // Link do grupo WhatsApp (substitua pelo seu)
  const whatsappGroupLink = 'https://chat.whatsapp.com/SEU_CODIGO_DO_GRUPO';

  // Detectar mobile e simular contador crescente
  useEffect(() => {
    setIsMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simular contador crescente
    const interval = setInterval(() => {
      setMemberCount(prev => {
        if (prev < 650) {
          return prev + Math.floor(Math.random() * 3) + 1;
        }
        return prev;
      });
    }, 30000); // A cada 30 segundos
    
    // Verificar se o banner foi fechado anteriormente
    const bannerClosed = localStorage.getItem('fabrica-cupons-whatsapp-banner-closed');
    if (bannerClosed === 'true') {
      setIsVisible(false);
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, []);

  const handleJoinClick = () => {
    // Abrir no WhatsApp Web no desktop, WhatsApp app no mobile
    if (isMobile) {
      // Para mobile, tenta abrir no app nativo
      const userAgent = navigator.userAgent || navigator.vendor;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /android/i.test(userAgent);
      
      if (isIOS || isAndroid) {
        window.location.href = `whatsapp://send?text=Quero entrar no grupo Fábrica de Cupons!`;
        setTimeout(() => {
          // Fallback para web se o app não abrir
          window.open(whatsappGroupLink, '_blank');
        }, 2500);
      } else {
        window.open(whatsappGroupLink, '_blank');
      }
    } else {
      window.open(whatsappGroupLink, '_blank', 'noopener,noreferrer');
    }
    
    // Registrar clique para analytics (opcional)
    if (typeof window !== 'undefined') {
      localStorage.setItem('whatsapp-banner-clicked', new Date().toISOString());
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
    
    // Salvar no localStorage para não mostrar novamente
    if (typeof window !== 'undefined') {
      localStorage.setItem('fabrica-cupons-whatsapp-banner-closed', 'true');
    }
  };

  // Não renderizar se não estiver visível ou montado
  if (!isVisible || !isMounted) return null;

  return (
    <div className="w-full">
      {/* Banner para Mobile */}
      {isMobile ? (
        <div className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          {/* Efeito de brilho */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-green-300 to-emerald-400"></div>
          
          {/* Cabeçalho */}
          <div className="p-4 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Logo oficial do WhatsApp com efeito */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.677-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.437 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.892 0-3.18-1.24-6.162-3.495-8.411"/>
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight">Grupo de ofertas no WhatsApp</span>
                    
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-100">
                  </div>
                </div>
              </div>
              
              {closable && (
                <button
                  onClick={handleClose}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-4 pt-0">
            {/* Chips de benefícios */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs">
                <Gift size={12} className="text-yellow-300" />
                <span>Cupons atualizados diariamente</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs">
                <Zap size={12} className="text-yellow-300" />
                <span>Ofertas relâmpago</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs">
                <Shield size={12} className="text-yellow-300" />
                <span>100% seguro</span>
              </div>
            </div>

            {/* Contador ativo */}
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm">Ativo agora</span>
                </div>
                <div className="text-xs bg-green-400/30 px-2 py-1 rounded-full font-medium">
                  🔥 24/7
                </div>
              </div>
            </div>

            {/* Botão principal mobile-optimized */}
            <button
              onClick={handleJoinClick}
              className="w-full bg-white text-green-800 font-bold py-4 px-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform duration-150 flex items-center justify-between"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.677-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.437 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.892 0-3.18-1.24-6.162-3.495-8.411"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg leading-tight">ENTRAR AGORA</div>
                  <div className="text-sm text-green-600 font-medium">Grátis • Clique aqui</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Nota mobile */}
            <p className="text-center text-xs text-green-200/80 mt-3 px-2">
              Abre direto no WhatsApp • Sem spam • Cancelamento a qualquer momento
            </p>
          </div>
        </div>
      ) : (
        // Banner para Desktop
        <div className="relative bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 text-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Efeito de brilho no topo */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-green-300 to-emerald-400"></div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              {/* Left Side */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-10"></div>
                    <div className="relative w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.677-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.437 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.892 0-3.18-1.24-6.162-3.495-8.411"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Grupo de ofertas no WhatsApp
                      </h2>
                    </div>
                    <div className="flex items-center text-green-100">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={16} />
                        <span className="text-sm">Crescendo rápido</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de benefícios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                    <div className="p-2 bg-green-400/20 rounded-lg">
                      <Gift size={20} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Cupons atualizados</div>
                      <div className="text-sm text-green-100/80">Vários descontos em um único lugar</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                    <div className="p-2 bg-green-400/20 rounded-lg">
                      <Zap size={20} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Ofertas relâmpago</div>
                      <div className="text-sm text-green-100/80">Promoções com tempo limitado</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                    <div className="p-2 bg-green-400/20 rounded-lg">
                      <Smartphone size={20} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Direto no celular</div>
                      <div className="text-sm text-green-100/80">Receba notificações instantâneas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                    <div className="p-2 bg-green-400/20 rounded-lg">
                      <Clock size={20} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="font-semibold">Ativo 24/7</div>
                      <div className="text-sm text-green-100/80">Comunidade sempre movimentada</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Call to Action */}
              <div className="flex-shrink-0 md:w-80">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <h3 className="text-xl font-bold mb-4 text-center">Junte-se agora!</h3>

                  {/* Botão principal */}
                  <button
                    onClick={handleJoinClick}
                    className="w-full group bg-white text-green-800 hover:bg-gray-50 font-bold py-4 px-6 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mb-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.677-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.437 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.892 0-3.18-1.24-6.162-3.495-8.411"/>
                    </svg>
                    <div className="text-left">
                      <div className="font-bold text-xl">ENTRAR NO GRUPO</div>
                      <div className="text-sm font-medium text-green-700">Clique para participar</div>
                    </div>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  {/* Garantia */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-green-100/80">
                      <Shield size={12} />
                      <span>100% gratuito • Sem spam • Saia quando quiser</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de fechar */}
              {closable && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppBanner;