import { varietyShows } from '../data/works';
import ScrollReveal from './ScrollReveal';
import SplitText from './SplitText';
import PixelCard from './PixelCard';

export default function VarietyShowSection() {
  return (
    <section id="variety" className="section-padding bg-transparent -mt-[-150px]">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-6">
            <SplitText
              text="VARIETY SHOW"
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
                text="有趣的灵魂万里挑一"
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

        <ScrollReveal delay={200}>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            {varietyShows.map((show, index) => {
              const isLeftCard = index % 2 === 0;

              return (
                <div
                  key={show.id}
                  className={`w-full max-w-[330px] md:w-[80%] md:max-w-none ${
                    isLeftCard
                      ? 'mt-6 justify-self-center md:mt-20 md:justify-self-start md:-rotate-[10deg] md:ml-12'
                      : 'mt-6 justify-self-center md:mt-12 md:justify-self-end md:rotate-[18deg] md:mr-12'
                  }`}
                >
                  <div className="group card-hover block">

                      <PixelCard className="aspect-[3/4] rounded-2xl bg-gray-50 shadow-lg">
                        <img
                          src={show.image}
                          alt={show.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 z-30 p-6">
                          <h3 className="font-[Microsoft_YaHei] text-xl font-semibold text-white">{show.title}</h3>
                        </div>
                      </PixelCard>

                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
