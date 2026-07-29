import { useMemo } from 'react';
import { tvPrograms } from '../data/works';
import ScrollReveal from './ScrollReveal';
import SplitText from './SplitText';
import DomeGallery from './DomeGallery';

export default function TvProgramSection() {
  const works = useMemo(
    () => tvPrograms.map((work) => ({
      src: work.image,
      alt: `${work.title}，饰演 ${work.role}`,
      title: work.title,
      role: work.role,
    })),
    []
  );

  return (
    <section id="tv" className="relative -mt-[40px] overflow-hidden pt-20 md:pt-28">
      <div className="pointer-events-none relative z-10 mx-auto flex justify-center px-6 md:px-12">
        <ScrollReveal>
          <div className="text-center">
            <SplitText
              text="TV PROGRAM"
              tag="h2"
              className="font-[Microsoft_YaHei] text-[43px] font-black tracking-wide text-gray-800 md:text-[58px] lg:text-[72px]"
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
            <div className="mt-3 flex justify-center">
              <SplitText
                text="一步一部，初心不负"
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
            <div className="mx-auto mt-4 h-[2px] w-12 bg-warm-400" />
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={180} className="tv-gallery-reveal">
         <div className="tv-gallery-shell relative w-full max-w-[calc(100vw-160px)] mx-auto mt-4 h-[620px] overflow-hidden md:mt-16 md:h-[700px]">
          <DomeGallery
            images={works}
            fit={0.9}
            fitBasis="width"
            minRadius={900}
            maxVerticalRotationDeg={2}
            dragSensitivity={18}
            dragDampening={2}
            enlargeTransitionMs={320}
            openedImageWidth="400px"
            openedImageHeight="560px"
            imageBorderRadius="12px"
            openedImageBorderRadius="24px"
            overlayBlurColor="#f7d995"
            grayscale={false}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
