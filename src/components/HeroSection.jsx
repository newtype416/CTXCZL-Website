import { useState, useRef, useEffect } from 'react';
import { assetUrl } from '../utils/assets';
 
export default function HeroSection() {
  const [muted, setMuted] = useState(true);
  const [showAudioBtn, setShowAudioBtn] = useState(false);
  const videoRef = useRef(null);
  const LOOP_START = 3.88;
 
  useEffect(() => {
    setShowAudioBtn(true);
    const video = videoRef.current;
    if (!video) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');

    // Mobile browsers keep muted inline video inside the page. Sound can still be enabled deliberately.
    video.muted = isMobile;
    video.play().then(() => {
      setMuted(video.muted);
    }).catch(() => {
      // Keep video playback available when a browser blocks sound autoplay.
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, []);
 
  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = LOOP_START;
    video.play();
  };
 
  const toggleAudio = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setMuted(video.muted);
      if (video.paused) video.play().catch(() => {});
    }
  };
 
  return (
    <section id="hero" className="hero-section relative h-screen w-full overflow-hidden">
      {/* Video background with sound enabled after entering the site. */}
      <video preload="metadata"
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        disablePictureInPicture
        controlsList="nofullscreen nodownload noremoteplayback"
        poster={assetUrl('/images/home/hero-poster.jpg')}
        className="absolute inset-0 h-full w-full object-cover"
        onEnded={handleVideoEnded}
      >
        <source src={assetUrl('/video/hero.mp4?v=media-optimized')} type="video/mp4" />
      </video>
 
      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-float pointer-events-none">
        <span className="text-white/60 text-[10px] tracking-[0.25em] font-light">SCROLL</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
 
      {/* Music toggle */}
      {showAudioBtn && (
        <button
          onClick={toggleAudio}
          className="absolute bottom-8 right-8 z-20 w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 border border-white/20 hover:scale-105"
          title={muted ? '开启音乐' : '关闭音乐'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {muted ? (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            ) : (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 010 14.14" />
                <path d="M15.54 8.46a5 5 0 010 7.07" />
              </>
            )}
          </svg>
        </button>
      )}
    </section>
  );
}
