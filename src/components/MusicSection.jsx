import { useState, useRef } from 'react';
import { musicWorks } from '../data/works';
import ScrollReveal from './ScrollReveal';
import SplitText from './SplitText';
import Masonry from './Masonry';

export default function MusicSection() {
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  const playMusic = (music) => {
    if (playingId === music.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(music.audio);
    audioRef.current = audio;
    audio.play().then(() => setPlayingId(music.id)).catch(() => setPlayingId(null));
    audio.addEventListener('ended', () => setPlayingId(null));
  };

  return (
    <section id="music" className="section-padding bg-transparent -mt-[-30px]">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <SplitText
              text="MUSIC"
              tag="h2"
              className="font-[Microsoft_YaHei] text-[43px] font-black tracking-wide text-gray-900 md:text-[58px] lg:text-[72px]"
              delay={100}
              duration={1.2}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="200px"
              textAlign="center"
            />
            <div className="flex justify-center mt-3">
              <SplitText
                text="音乐是第三种语言的表达"
                tag="p"
                className="text-sm tracking-widest text-gray-600"
                delay={100}
                duration={1.2}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="200px"
                textAlign="center"
              />
            </div>
            <div className="w-12 h-[2px] bg-warm-400 mx-auto mt-4" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="max-w-8xl mx-auto px-4">
            <Masonry
              items={musicWorks.map((music, index) => ({
                ...music,
                width: 4,
                height: [5.2, 4.1, 5.7, 4.5, 6.5, 4.2, 5][index],
                ariaLabel: `${playingId === music.id ? 'Pause' : 'Play'} ${music.title}`,
              }))}
              onItemClick={playMusic}
              animateFrom="bottom"
              blurToFocus
              scaleOnHover
              hoverScale={0.96}
              renderOverlay={(music) => (
                <>
                  <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${playingId === music.id ? 'bg-warm-400/90 scale-110' : 'bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100'}`}>
                      {playingId === music.id ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                      ) : (
                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent text-left">
                    <h3 className="text-sm md:text-base font-medium text-white">{music.title}</h3>
                  </div>
                  {playingId === music.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-warm-400 animate-pulse" />}
                </>
              )}
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
