import { awards } from '../data/works';
import ScrollReveal from './ScrollReveal';
import SplitText from './SplitText';
import MagicBento from './MagicBento';

export default function AwardSection() {
  return (
    <section id="award" className="section-padding bg-transparent">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <SplitText
              text="AWARD"
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
            <div className="flex justify-center mt-3">
              <SplitText
                text="星光不负赶路人"
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
          <MagicBento items={awards} />
        </ScrollReveal>
      </div>
    </section>
  );
}
