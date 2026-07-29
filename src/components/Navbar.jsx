import { useState, useEffect } from 'react';
import { navItems } from '../data/works';
import ShinyText from './ShinyText';

const navColors = [
  { background: '#00bf75', color: '#111111' },
  { background: '#278cff', color: '#ffffff' },
  { background: '#ffa51b', color: '#111111' },
  { background: '#e95ac7', color: '#111111' },
  { background: '#ff6865', color: '#111111' },
  { background: '#b7e43f', color: '#111111' },
  { background: '#f06f44', color: '#111111' },
];

const navLabels = {
  about: 'ABOUT CTX',
  tv: 'TV',
  variety: 'VARIETY SHOW',
  music: 'MUSIC',
  award: 'AWARD',
  fanwall: 'FANS',
  contact: 'CONTACT ME',
};

const navItemStyle = (index) => {
  const color = navColors[index % navColors.length];
  return { ...color, '--nav-color': color.background };
};
 
export default function Navbar({ onBack }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      // Detect active section
      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const section = document.getElementById(id);
    if (section) {
      const title = section.querySelector('h2') || section;
      const navbarHeight = document.querySelector('.nav-reference > div')?.getBoundingClientRect().height || 0;
      const top = Math.max(0, title.getBoundingClientRect().top + window.scrollY - navbarHeight - 20);
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className="nav-reference fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-[1700px] mx-auto px-5 md:px-7">
        <div className="flex items-center justify-between h-16 md:h-[76px]">
          {/* Logo / Back button */}
          <button
            onClick={onBack}
            className="nav-reference__brand"
            aria-label="Chen TX"
          >
            <ShinyText
              text="Chen TX"
              speed={1.5}
              delay={1.4}
              color="#fa730a"
              shineColor="#ffffff"
              spread={120}
              direction="left"
            />
          </button> 

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-nowrap items-center gap-[0.5px]">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`nav-reference__item ${activeSection === item.id ? 'nav-reference__item--active' : ''}`}
                style={navItemStyle(index)}
              >
                <span className="nav-reference__item-label">{navLabels[item.id] || item.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white transition-colors"
            aria-label="Menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-[2px] bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`block h-[2px] bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[2px] bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-400 overflow-hidden ${
        mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="border-t border-white/15 bg-[#141414] px-6 py-4">
          <div className="flex flex-col gap-2">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`nav-reference__item w-full text-left ${activeSection === item.id ? 'nav-reference__item--active' : ''}`}
                style={navItemStyle(index)}
              >
                <span className="nav-reference__item-label">{navLabels[item.id] || item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
