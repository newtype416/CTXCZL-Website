import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import TvProgramSection from './components/TvProgramSection';
import VarietyShowSection from './components/VarietyShowSection';
import MusicSection from './components/MusicSection';
import AwardSection from './components/AwardSection';
import FanWallSection from './components/FanWallSection';
import ContactSection from './components/ContactSection';
import Particles from './components/Particles';
import DesktopPet from './components/DesktopPet';
import ArrivalLetter from './components/ArrivalLetter';
import { assetUrl } from './utils/assets';

export default function App() {
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showArrivalLetter, setShowArrivalLetter] = useState(false);
  const [showLetterEnvelope, setShowLetterEnvelope] = useState(false);
  const [openLetterDirectly, setOpenLetterDirectly] = useState(false);
  const [playHeroWithSound, setPlayHeroWithSound] = useState(false);
  const [shouldPreloadHero] = useState(() => window.matchMedia('(min-width: 768px)').matches);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);



  const handleEnter = () => {
    const playWithSound = !window.matchMedia('(max-width: 767px)').matches;
    const enter = () => {
      setShowLanding(false);
      setEntered(true);
      setShowLetterEnvelope(false);
      setOpenLetterDirectly(false);
      setShowArrivalLetter(true);
      setPlayHeroWithSound(playWithSound);
    };

    // Mount the video during the click so desktop browsers permit sound playback.
    if (playWithSound) {
      flushSync(enter);
    } else {
      enter();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBack = () => {
    setEntered(false);
    setShowArrivalLetter(false);
    setShowLetterEnvelope(false);
    setTimeout(() => setShowLanding(true), 100);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLetterClose = () => {
    setShowArrivalLetter(false);
    setShowLetterEnvelope(true);
  };

  const handleLetterReopen = () => {
    setOpenLetterDirectly(true);
    setShowLetterEnvelope(false);
    setShowArrivalLetter(true);
  };

  return (
    <div className="relative min-h-screen bg-cream">
      <Particles
        className="fixed inset-0 z-0 h-screen w-screen"
        particleCount={200}
        particleSpread={10}
        speed={0.6}
        particleColors={['#ff6b6b', '#6b98e2', '#Fa730a']}
        moveParticlesOnHover
        particleHoverFactor={1}
        alphaParticles
        particleBaseSize={500}
        sizeRandomness={1}
        cameraDistance={20}
        disableRotation={false}
      />
      <div className={`loading-screen ${loading ? '' : 'hide'}`}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-warm-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 tracking-widest">LOADING</p>
        </div>
      </div>

      {!entered && shouldPreloadHero && (
        <video
          aria-hidden="true"
          className="hero-video-preload"
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
        >
          <source src={assetUrl('/video/hero.mp4?v=media-optimized')} type="video/mp4" />
        </video>
      )}

      {showLanding && !entered && (
        <div className={`relative z-10 ${!entered ? '' : 'landing-enter'}`}>
          <LandingPage onEnter={handleEnter} />
        </div>
      )}

      {entered && (
        <>
          <Navbar onBack={handleBack} />
          <div className={`relative z-10 ${entered ? 'main-enter' : ''}`}>
            <HeroSection playWithSound={playHeroWithSound} />
            <AboutSection />
            <TvProgramSection />
            <VarietyShowSection />
            <MusicSection />
            <AwardSection />
            <FanWallSection />
            <ContactSection />
          </div>
        </>
      )}

      {showArrivalLetter && <ArrivalLetter onClose={handleLetterClose} startOpen={openLetterDirectly} />}
      {entered && showLetterEnvelope && (
        <button
          className="letter-envelope-launcher"
          style={{ zIndex: 90 }}
          type="button"
          onClick={handleLetterReopen}
          aria-label="重新打开生日信"
          title="重新打开信纸"
        >
          <span aria-hidden="true">✉</span>
        </button>
      )}
      {entered && <DesktopPet />}
    </div>
  );
}
