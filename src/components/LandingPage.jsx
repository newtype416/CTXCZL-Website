import { useEffect, useRef, useState } from 'react';
import VariableProximity from './VariableProximity';
import TextPressure from './TextPressure';
import ShinyText from './ShinyText';
import { assetUrl } from '../utils/assets';
 
export default function LandingPage({ onEnter }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);
 
  return (
    <div className="landing-page relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={assetUrl('/images/home/splash-poster.jpg')}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={assetUrl('/video/splash.mp4?v=media-optimized')} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-30 -translate-x-1/2 text-[8px] font-light text-white/60">
        @糖醋排骨
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-6">
        <div className="animate-fade-in text-center">
          <div ref={containerRef} style={{ position: 'relative' }}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-[0.15em] mb-6 leading-[1.5] text-balance bg-gradient-to-r from-warm-400 via-warm-200 to-white bg-clip-text text-transparent">
            <VariableProximity
              label="Welcome to"
              className="variable-proximity-demo"
              fromFontVariationSettings="'wght' 700, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef}
              radius={120}
              falloff="linear"
            />
            <br />
            <VariableProximity
              label="CTX&CZL's Home"
              className="variable-proximity-demo"
              fromFontVariationSettings="'wght' 700, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef}
              radius={120}
              falloff="linear"
            />
          </h1>
          </div>
          <div className="mt-12 mb-12 max-w-2xl mx-auto text-lg md:text-xl font-light tracking-wider leading-relaxed">
            <ShinyText text="用作品说话，用角色证明。" speed={3} color="rgba(255,255,255,0.7)" shineColor="#f2e2ab" spread={120} direction="left" className="block" />
            <ShinyText text="每一帧都是热爱，每段戏都是人生。" speed={3} color="rgba(255,255,255,0.7)" shineColor="#f2e2ab" spread={120} direction="left" className="block" />
          </div>
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-10 py-4 text-base tracking-[0.2em] text-white border-2 border-white/40 rounded-full overflow-hidden transition-all duration-500 hover:border-warm-400 hover:text-white scale-[0.8] translate-y-8"
          >
            <span className="relative z-10 block h-6 w-[154px] overflow-hidden font-bold tracking-[0.12em]">
              <TextPressure text={`LOADING${'\u2026\u2026'}`} textColor="#ffffff" minFontSize={isMobile ? 14 : 16} maxFontSize={isMobile ? 18 : undefined} className="text-base" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-warm-500/80 to-warm-400/80 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          </button>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-10 animate-float">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse-soft" />
          </div>
        </div>
      </div>
    </div>
  );
}
