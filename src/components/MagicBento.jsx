import { useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

function AwardCard({ award, index }) {
  const cardRef = useRef(null);
  const particles = useMemo(() => Array.from({ length: 10 }, (_, particleIndex) => ({
    id: particleIndex,
    left: `${12 + ((particleIndex * 37) % 76)}%`,
    top: `${10 + ((particleIndex * 53) % 78)}%`,
    '--delay': `${particleIndex * 0.09}s`,
  })), []);

  const resetCard = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.45, ease: 'power3.out' });
  };

  const handleMove = (event) => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(max-width: 767px)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const offsetX = x - rect.width / 2;
    const offsetY = y - rect.height / 2;
    card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
    card.style.setProperty('--glow-intensity', '1');
    gsap.to(card, {
      x: offsetX * 0.035,
      y: offsetY * 0.035,
      rotateX: offsetY * -0.025,
      rotateY: offsetX * 0.025,
      duration: 0.25,
      ease: 'power2.out',
      transformPerspective: 900,
    });
  };

  const handleClick = (event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'magic-bento-ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    card.appendChild(ripple);
    gsap.fromTo(ripple, { scale: 0, opacity: 0.65 }, { scale: 16, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
  };

  return (
    <article
      ref={cardRef}
      className={`magic-bento-card magic-bento-card--award magic-bento-card--${index + 1}`}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        cardRef.current?.style.setProperty('--glow-intensity', '0');
        resetCard();
      }}
      onClick={handleClick}
    >
      <img src={award.image} alt={award.title} className="magic-bento-card__image" loading="lazy" />
      <div className="magic-bento-card__shade" />
      <div className="magic-bento-card__particles" aria-hidden="true">
        {particles.map((particle) => <span key={particle.id} style={particle} />)}
      </div>
      <div className="magic-bento-card__content"><h3>{award.title}</h3><p>{award.award}</p></div>
    </article>
  );
}

export default function MagicBento({ items }) {
  return <div className="magic-bento-grid">{items.map((award, index) => <AwardCard key={award.id} award={award} index={index} />)}</div>;
}
