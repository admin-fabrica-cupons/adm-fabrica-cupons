'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Zap, ChevronRight, Shield, X, Star, Truck, CheckCircle, Gift, Flame } from 'lucide-react';

import carro from '../../assets/carro-cupons.png';
import logo from '../../assets/logo.svg';
import mascoteLogo from '../../assets/moca-ofc.png';
import { RiShoppingCartFill, RiSecurePaymentFill, RiMoneyDollarCircleFill, RiPercentFill } from 'react-icons/ri';
import { FaBolt, FaFire, FaShippingFast, FaCheckCircle, FaStar, FaGift, FaTicketAlt } from 'react-icons/fa';
import { ScrollVelocityContainer, ScrollVelocityRow } from '../ui/scroll-based-velocity';
import { PARTNER_STORES } from '../../constants';

interface HeroProps {
  ctaText?: string;
  ctaLink?: string;
}

const Hero: React.FC<HeroProps> = ({
  ctaText = 'Ver Ofertas',
  ctaLink = '#posts-section'
}) => {
  const router = useRouter();
  const [currentOffer, setCurrentOffer] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<number[]>([]);
  const offers = useMemo(() => [
    { text: 'Cupons atualizados diariamente', icon: <FaTicketAlt /> },
    { text: 'Ofertas relâmpago verificadas', icon: <FaBolt /> },
    { text: 'Economize nas melhores lojas', icon: <RiMoneyDollarCircleFill /> },
    { text: 'Descontos exclusivos', icon: <FaStar /> },
    { text: 'Compra segura e garantida', icon: <Shield size={16} /> },
    { text: 'As melhores marcas', icon:  <FaStar /> },
    { text: 'Promoções imperdíveis', icon: <FaFire /> },
    { text: 'Dinheiro no bolso', icon:  <FaStar />}
  ], []);
  const storeLogos = useMemo(
    () => Object.values(PARTNER_STORES)
      .map(store => store.logoUrl)
      .filter((logo): logo is string => !!logo),
    []
  );
  const marqueeItems = useMemo(
    () => [
      { text: 'Ofertas Verificadas', icon: <FaCheckCircle /> },
      { text: 'Cupons Exclusivos', icon: <FaTicketAlt /> },
      { text: 'Economia Garantida', icon: <RiMoneyDollarCircleFill /> },
      { text: 'Frete Grátis', icon: <FaShippingFast /> },
      { text: 'Lojas Parceiras', icon: <RiSecurePaymentFill /> },
      { text: 'Descontos Relâmpago', icon: <FaBolt /> },
      { text: 'Curadoria Premium', icon: <FaStar /> },
      { text: 'Benefícios VIP', icon: <FaGift /> }
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer(prev => (prev + 1) % offers.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [offers]);

  useEffect(() => {
    if (showPopup) {
      setConfettiParticles(Array.from({ length: 30 }, (_, i) => i));
    }
  }, [showPopup]);

  const scrollToOffers = () => {
    document.querySelector(ctaLink)?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToTrending = () => {
    router.push('/sections?section=ofertas');
  };

  const handleCarClick = () => {
    setShowPopup(true);
  };

  return (
    <section className="relative w-full overflow-x-hidden overflow-y-hidden pt-0 pb-10 bg-[#FCEE21]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[20%] aurora-background mix-blend-screen opacity-70" />
      </div>

      <div className="relative z-30 w-full overflow-hidden flex justify-center mt-4">
        <div className="relative w-full max-w-6xl rounded-full overflow-hidden bg-[linear-gradient(135deg,#ff008a,#ff6b00,#ff008a)] shadow-lg">
          <div className="marquee-track py-1.5">
            <div className="flex items-center gap-10 px-6">
              {marqueeItems.map((item, index) => (
                <React.Fragment key={`marquee-a-${index}`}>
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="text-yellow-300 text-lg drop-shadow-sm">{item.icon}</span>
                    <span className="text-sm font-black uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-sm">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">•</span>
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-10 px-6">
              {marqueeItems.map((item, index) => (
                <React.Fragment key={`marquee-b-${index}`}>
                   <div className="flex items-center gap-2 text-white/90">
                    <span className="text-yellow-300 text-lg drop-shadow-sm">{item.icon}</span>
                    <span className="text-sm font-black uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-sm">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#ff008a] via-[#ff008a]/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#ff6b00] via-[#ff6b00]/70 to-transparent" />
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative z-20 w-full max-w-7xl mt-0 mx-auto px-4 sm:px-6 pt-10 pb-20 lg:py-20">

        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-black px-4 py-2 rounded-full text-sm font-bold shadow-sm ring-1 ring-white/40">
            <span className="text-blue-600">{offers[currentOffer].icon}</span>
            <span>{offers[currentOffer].text}</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-transparent bg-clip-text bg-[linear-gradient(135deg,#ff008a,#2D3277,#ff008a)] bg-[length:200%_200%] animate-auroraText drop-shadow-sm pb-2">
            Economize nas suas compras online
          </h1>

          <p className="text-base md:text-lg text-black/80 maxw-xl mx-auto lg:mx-0 font-medium leading-relaxed">
            Cupons reais, promoções verificadas e os melhores preços encontrados pela nossa equipe.
          </p>

          {/* MOBILE: Mascote e Botão */}
          <div className="block lg:hidden relative z-30">
            <div className="flex justify-center items-end relative">
              <div className="absolute bottom-5 w-80 h-40 bg-white/90 blur-[60px] rounded-full z-0"></div>
              <Image
                src={mascoteLogo}
                alt="Mascote"
                width={350}
                height={280}
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 350px, 0px"
                className="relative z-10 w-auto h-[280px] sm:h-[280px] object-contain"
              />
            </div>
            <div className="flex flex-col gap-3 justify-center items-center relative z-20">
              {/* BOTÃO MOBILE 1 */}
              <button
                onClick={scrollToOffers}
                className="group relative inline-flex items-center gap-3 bg-brand-blue/90 backdrop-blur
                border-2 border-yellow-200 text-yellow-200 font-extrabold px-8 py-3.5 rounded-full shadow-lg transition-all duration-300 overflow-hidden w-full max-w-xs justify-center"
              >
                <RiShoppingCartFill size={22} />
                {ctaText}
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* BOTÃO MOBILE 2 (Rosa Choque) */}
              <button
                onClick={goToTrending}
                className="group relative inline-flex items-center gap-3 bg-[#FF007F] hover:bg-[#D6006B] text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg shadow-pink-500/30 transition-all duration-300 overflow-hidden w-full max-w-xs justify-center active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                <Zap size={22} className="text-white" />
                <span>Ver produtos em Alta</span>
                <ChevronRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* DESKTOP: Botão */}
          <div className="hidden lg:flex flex-col sm:flex-row gap-4 justify-start pt-4">
            {/* BOTÃO DESKTOP 1 */}
            <button
              onClick={scrollToOffers}
              className="group relative inline-flex items-center gap-3 bg-brand-blue border-2 border-yellow-200 text-yellow-200 font-bold px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 overflow-hidden"
            >
              {/* Efeito de brilho no botão */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shine"></div>
              <RiShoppingCartFill size={24} />
              <span className="text-lg">{ctaText}</span>
              <ChevronRight size={24} className="text-yellow-200 group-hover:translate-x-1 transition-transform" />
            </button>

             {/* BOTÃO DESKTOP 2 (Rosa Choque) */}
             <button
                onClick={goToTrending}
              className="group relative inline-flex items-center gap-3 bg-[#FF007F] hover:bg-[#D6006B] text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-200 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shine"></div>
              <Zap size={24} className="text-white" />
              <span className="text-lg">Ver produtos em Alta</span>
              <ChevronRight size={24} className="text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex justify-center lg:justify-start items-center gap-2 text-sm font-bold text-black/60">
            <Shield size={16} />
            Ofertas verificadas diariamente
          </div>
        </div>
      </div>

      {/* --- SCROLL BASED VELOCITY LOGOS --- */}
      <div className="relative z-20 w-full py-8 mb-24 lg:mb-0">
        <ScrollVelocityContainer>
          <ScrollVelocityRow baseVelocity={4.5} className="flex items-center gap-12">
            {storeLogos.map((logo, i) => (
              <div key={`velocity-a-${i}`} className="opacity-70 relative w-24 h-12 mx-8 hover:scale-110 transition-transform duration-300">
                <div 
                  className="object-contain w-full h-full"
                  style={{
                    backgroundImage: `url(${logo})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            ))}
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      </div>

      {/* --- MASCOTE DESKTOP COM STRONG BLUR ATRÁS --- */}
      <div className="hidden lg:block absolute bottom-0 right-0 xl:right-10 h-[90%] w-auto z-10 pointer-events-none">
        <div className="relative h-full flex items-end">
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/60 rounded-full blur-[100px] z-0 mix-blend-screen"></div>
          
          <Image
            src={mascoteLogo}
            alt="Mascote"
            width={500}
            height={650}
            loading="lazy"
            sizes="(min-width: 1024px) 500px, 0px"
            className="relative z-10 w-auto h-full max-h-[650px] object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
          />
        </div>
      </div>

      {/* --- ÁREA DO CARRO, PISTA E FUMAÇA --- */}
      <div className="absolute bottom-0 left-0 w-full h-24 z-30 pointer-events-none">

        {/* 1. A PISTA (Estrada com perspectiva) */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-b from-gray-700 to-gray-900 transform perspective-500 rotate-x-12 origin-bottom border-t-2 border-yellow-500/90">
          {/* Faixas da pista */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-dashed border-t border-yellow-400/60 opacity-70"></div>
        </div>

        {/* Container que move o carro e a fumaça */}
        <div className="absolute bottom-2 left-0 h-20 w-auto animate-driveCar pointer-events-auto cursor-pointer group/car">
          {/* 2. FUMAÇA (Efeito de partícula saindo da traseira) */}
          <div className="absolute bottom-4 -left-6 w-8 h-8 bg-white/60 blur-md animate-smoke"></div>
          <div className="absolute bottom-5 -left-10 w-10 h-10 bg-gray-200/30 rounded-full blur-lg animate-smoke delay-100"></div>

          {/* 3. O CARRO */}
          <Image
            src={carro}
            alt="Carro de Cupons"
            width={120}
            height={80}
            onClick={handleCarClick}
            loading="lazy"
            sizes="120px"
            className="
            h-full w-auto object-contain 
            group-hover/car:scale-120 
            transition-transform duration-300 
            relative z-10
            drop-shadow-[-10px_-3px_20px_rgba(0,0,0,0.7)]
            "/>
        </div>
      </div>

      {/* --- POP-UP --- */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay Escuro mais suave */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPopup(false)}
          />

          {/* Card do Popup - Efeito Vidro Moderno */}
          <div className="relative bg-brand-blue/70 border border-yellow-300/70 rounded-[2rem] p-8 max-w-md w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-popupEnter overflow-hidden">
            {/* Reflexo de luz no vidro */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[2rem]"></div>

            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-5 right-5 text-brand-blue/70 hover:text-brand-blue bg-white/30 hover:bg-white/50 p-2 rounded-full transition-all z-20 backdrop-blur-md"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center pt-4">
              <h2 className="text-3xl text-white font-black mb-1 drop-shadow-sm">Bem-vindo à</h2>
              <h3 className="text-2xl font-extrabold text-yellow-300 mb-6">
                Fábrica de Cupons!
              </h3>

              <p className="text-white font-medium mb-8 leading-relaxed">
                Você encontrou o carro secreto! Aqui produzimos os melhores descontos da internet todos os dias.
              </p>

              {/* Botão do Popup no mesmo estilo Glass */}
              <button
                onClick={() => { setShowPopup(false); scrollToOffers(); }}
                className="bg-yellow-300 text-brand-blue font-bold py-3.5 px-8 rounded-xl shadow-md transition-all w-full "
              >
                Ver Cupons Fresquinhos
              </button>
            </div>

            {/* EXPLOSÃO DE LOGOS (Mantida) */}
            {confettiParticles.map((_, i) => {
              // Use CSS variables for random values to avoid hydration mismatch
              // or generate them in a useEffect (but that would trigger re-render)
              // Better: use deterministic values based on index, or simple inline styles that don't rely on random during render?
              // Actually, for hydration safety, we must use useEffect to set these if they are random.
              // Or use a deterministic pseudo-random function based on index 'i'.
              
              // Deterministic values based on index 'i' to match server and client
              const seed = i * 1337;
              const pseudoRandom = (offset: number) => {
                const x = Math.sin(seed + offset) * 10000;
                return x - Math.floor(x);
              };
              
              const randomX = (pseudoRandom(1) - 0.5) * 800;
              const randomY = (pseudoRandom(2) - 1) * 800;
              const randomRotate = pseudoRandom(3) * 720;
              const randomDelay = pseudoRandom(4) * 0.5;
              const randomScale = 0.5 + pseudoRandom(5);

              return (
                <Image
                  key={i}
                  src={logo}
                  alt=""
                  width={48}
                  height={48}
                  className="absolute top-1/2 left-1/2 w-12 h-12 object-contain pointer-events-none opacity-0 animate-confettiExplosion z-0"
                  style={{
                    ['--tx' as any]: `${randomX}px`,
                    ['--ty' as any]: `${randomY}px`,
                    ['--r' as any]: `${randomRotate}deg`,
                    animationDelay: `${randomDelay}s`,
                    transform: `scale(${randomScale}) translate(-50%, -50%)`
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <style>
        {`
          /* Animação de brilho passando pelo botão */
          @keyframes shine {
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          .animate-shine {
            animation: shine 1s ease-in-out forwards;
          }

          /* Pulsação suave das luzes de fundo */
          @keyframes pulseSlow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          .animate-pulseSlow {
            animation: pulseSlow 8s ease-in-out infinite;
          }

          @keyframes aurora {
            0% { transform: translate(-5%, -5%) scale(1); }
            50% { transform: translate(5%, 5%) scale(1.1); }
            100% { transform: translate(-5%, -5%) scale(1); }
          }
          .aurora-background {
            background:
              radial-gradient(60% 60% at 20% 20%, rgba(34, 197, 94, 0.35), transparent 60%),
              radial-gradient(50% 50% at 80% 10%, rgba(59, 130, 246, 0.35), transparent 60%),
              radial-gradient(40% 40% at 60% 80%, rgba(168, 85, 247, 0.35), transparent 60%),
              radial-gradient(50% 50% at 10% 80%, rgba(236, 72, 153, 0.35), transparent 60%);
            filter: blur(40px);
            animation: aurora 12s ease-in-out infinite;
            transform: translateZ(0);
          }

          @keyframes auroraText {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-auroraText {
            animation: auroraText 6s ease-in-out infinite;
          }

          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: inline-flex;
            width: max-content;
            animation: marquee 24s linear infinite;
            will-change: transform;
          }

          /* Carro atravessando a tela */
          @keyframes driveCar {
            from { transform: translateX(-120%); }
            to { transform: translateX(120vw); }
          }
          .animate-driveCar {
            animation: driveCar 10s linear infinite; 
          }

          /* Animação da Fumaça */
          @keyframes smoke {
            0% { opacity: 0.8; transform: scale(1) translate(0, 0); }
            100% { opacity: 0; transform: scale(3) translate(-20px, -10px); }
          }
          .animate-smoke {
            animation: smoke 1s ease-out infinite;
          }

          /* Popup entering */
          @keyframes popupEnter {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-popupEnter {
            animation: popupEnter 0.3s ease-out forwards;
          }

          /* Confetti */
          @keyframes confettiExplosion {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
            100% { opacity: 0; transform: translate(var(--tx), var(--ty)) rotate(var(--r)) scale(1); }
          }
          .animate-confettiExplosion {
            animation: confettiExplosion 1.5s ease-out forwards;
          }
        `}
      </style>
    </section>
  );
};

export default Hero;
