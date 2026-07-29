import { useEffect, useRef } from 'react';
import ScrollReveal from './ScrollReveal';
import SplitText from './SplitText';
import Particles from './Particles';

const NOTES = [
  "hello\u5404\u4F4D\u6A59\u5B50\u7C92\u4EEC",
  "\u8C22\u8C22\u4F60\u4EEC\u6D4F\u89C8\u8FD9\u4E2A\u7F51\u7AD9",
  "\u505A\u8FD9\u4E2A\u7F51\u7AD9\u7684\u521D\u8877\u5C31\u662F\u60F3\u5728\u6DFB\u6DFB24\u5C81\u751F\u65E5\u7684\u65F6\u5019\u9001\u4ED6\u4E00\u4EFD\u7279\u522B\u7684\u793C\u7269",
  "\u4E5F\u60F3\u628A\u5B83\u5F53\u505A\u4E00\u4E2A\u5C5E\u4E8E\u6DFB\u6DFB\u548C\u6A59\u5B50\u7C92\u7684\u5BB6\u56ED",
  "\u4F5C\u8005\u4E0D\u662F\u4E13\u4E1A\u5B66\u8BBE\u8BA1\u7684\uFF0C\u505A\u7F51\u7AD9\u4E5F\u662F\u4E1A\u4F59\u9009\u624B\u7B2C\u4E00\u6B21",
  "\u6709\u505A\u7684\u4E0D\u597D\u7684\u5730\u65B9\u5927\u5BB6\u53EF\u4EE5\u7ED9\u6211\u7559\u8A00",
  "\u53EA\u8981\u662F\u5584\u610F\u7684\u5EFA\u8BAE\u90FD\u7167\u5355\u5168\u6536",
  "\u540E\u7EED\u4E5F\u4F1A\u5C3D\u91CF\u5B9A\u671F\u66F4\u65B0\u7F51\u7AD9",
  "\u6700\u540E",
  "\u795D\u5927\u5BB6\u6DFB\u5929\u5F00\u5FC3\uFF01",
  "\u9648\u6DFB\u7965\u540C\u5B66\uFF0C24\u5C81\u751F\u65E5\u5FEB\u4E50\uFF01",
  "\u81EA\u5728\u968F\u98CE\uFF01",
];

function ContactNotes() {
  const windowRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const maxOffsetRef = useRef(0);
  const isVisibleRef = useRef(false);
  const isHoveredRef = useRef(false);
  const startDelayRef = useRef(null);

  const setOffset = (nextOffset) => {
    const clampedOffset = Math.max(0, Math.min(nextOffset, maxOffsetRef.current));
    offsetRef.current = clampedOffset;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateY(${-clampedOffset}px)`;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      if (!entry.isIntersecting) {
        startDelayRef.current = null;
        setOffset(0);
      }
    }, { threshold: 0.3 });

    if (windowRef.current) observer.observe(windowRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateBounds = () => {
      if (!windowRef.current || !trackRef.current) return;
      const lastNote = trackRef.current.lastElementChild;
      const lastNoteCenter = lastNote
        ? lastNote.offsetTop + lastNote.offsetHeight / 2
        : trackRef.current.scrollHeight;
      maxOffsetRef.current = Math.max(0, lastNoteCenter - windowRef.current.clientHeight / 2);
      setOffset(offsetRef.current);
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let animationFrame;
    let previousTime;
    let hasStarted = false;

    const animate = (time) => {
      if (previousTime === undefined) previousTime = time;
      const elapsed = time - previousTime;
      previousTime = time;

      if (isVisibleRef.current && !isHoveredRef.current) {
        if (!hasStarted) {
          if (startDelayRef.current === null) startDelayRef.current = time;
          hasStarted = time - startDelayRef.current >= 1200;
        }

        if (hasStarted && offsetRef.current < maxOffsetRef.current) {
          // The original 15s animation moved for 11.1s; 14.8s keeps it at 75% of that speed.
          setOffset(offsetRef.current + (maxOffsetRef.current / 14.8) * (elapsed / 1000));
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return undefined;

    const handleWheel = (event) => {
      if (maxOffsetRef.current === 0) return;
      const isScrollingPastStart = event.deltaY < 0 && offsetRef.current === 0;
      const isScrollingPastEnd = event.deltaY > 0 && offsetRef.current === maxOffsetRef.current;
      if (isScrollingPastStart || isScrollingPastEnd) return;

      event.preventDefault();
      setOffset(offsetRef.current + event.deltaY);
    };

    windowElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => windowElement.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div
      ref={windowRef}
      className="contact-notes-window"
      role="region"
      aria-label="\u6700\u540E\u788E\u788E\u5FF5"
      onPointerEnter={() => { isHoveredRef.current = true; }}
      onPointerLeave={() => { isHoveredRef.current = false; }}
    >
      <div ref={trackRef} className="contact-notes-track">
        {NOTES.map((note) => <p key={note}>{note}</p>)}
      </div>
    </div>
  );
}

export default function ContactSection() {
  return (
    <section id="contact" className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cream to-warm-50">
      <Particles
        className="absolute inset-0 z-0 h-full w-full"
        particleCount={200}
        particleSpread={10}
        speed={0.6}
        particleColors={["#ff6b6b", "#6b98e2", "#Fa730a"]}
        moveParticlesOnHover
        particleHoverFactor={1}
        alphaParticles
        particleBaseSize={500}
        sizeRandomness={1}
        cameraDistance={20}
        disableRotation={false}
      />
      <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-warm-200/20 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-warm-300/15 blur-3xl" />

      <div className="section-container relative z-10 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <SplitText
              text={'\u4E00\u4E9B\u788E\u788E\u5FF5'}
              tag="h2"
              className="font-[Microsoft_YaHei] text-[28px] font-black tracking-wide text-gray-800"
              delay={100}
              duration={1.2}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="200px"
              textAlign="center"
            />
            <div className="mx-auto mt-5 h-[2px] w-12 bg-warm-400" />
          </ScrollReveal>
        </div>

        <ScrollReveal delay={180}>
          <div className="mx-auto mt-[38px] max-w-3xl px-6 text-center text-[14px] tracking-[0.06em] text-gray-600 md:mt-[54px]">
            <ContactNotes />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={260}>
          <div className="mx-auto mt-10 max-w-lg px-4 md:mt-12">
            <div className="flex flex-wrap justify-center gap-4">
              {              [
                { label: '\u5FAE\u535A', handle: '@\u5927\u8033\u6735\u6DFB\u6DFB\u751C', icon: 'WB', color: '#E6162D' },
                { label: '\u6296\u97F3', handle: '@\u7CD6\u918B\u6392\u9AA8\uD83D\uDC31\uD83C\uDF4A', icon: 'Dou', color: '#111111' },
              ].map((social) => (
                <a key={social.label} href="#" onClick={(event) => event.preventDefault()} className="flex items-center gap-3 rounded-full border border-white/80 bg-white/70 px-5 py-2.5 backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: social.color }}>{social.icon}</span>
                  <span className="text-left leading-tight"><span className="block text-xs text-gray-400">{social.label}</span><span className="block text-sm text-gray-700">{social.handle}</span></span>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="mt-16 text-center md:mt-20">
            <div className="mx-auto mb-6 h-[2px] w-16 bg-warm-300" />
            <p className="mb-2 font-display text-2xl font-bold text-gray-800 md:text-3xl">Chen TX</p>
            <p className="text-xs tracking-[0.2em] text-gray-400">{'\u597d\u597d\u751f\u6d3b \u00b7 \u6dfb\u5929\u5f00\u5fc3'}</p>
            <p className="mt-6 text-xs tracking-wider text-gray-300">婵?2026 Chen TX. All rights reserved.</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
