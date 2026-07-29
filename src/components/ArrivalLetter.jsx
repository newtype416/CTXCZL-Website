import { useEffect, useRef, useState } from 'react';
import birthdayLetter from '../data/birthday-letter.txt?raw';
import './ArrivalLetter.css';

const letterParagraphs = birthdayLetter.trim().split(/\r?\n/).filter(Boolean);
const CLOSE_DURATION = 900;

export default function ArrivalLetter({ onClose, startOpen = false }) {
  const [phase, setPhase] = useState(startOpen ? 'opening' : 'arriving');
  const closeTimerRef = useRef();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && phase === 'opening') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  const handlePlaneAnimationEnd = (event) => {
    if (event.target === event.currentTarget && event.animationName === 'arrival-plane-enter') {
      setPhase('ready');
    }
  };

  const handleOpen = () => {
    if (phase === 'ready') setPhase('opening');
  };

  const handleClose = () => {
    if (phase === 'ready') {
      onClose();
      return;
    }

    if (phase !== 'opening') return;

    setPhase('closing');
    closeTimerRef.current = window.setTimeout(onClose, CLOSE_DURATION);
  };

  return (
    <section className={`arrival-letter arrival-letter--${phase}${startOpen ? ' arrival-letter--direct-open' : ''}`} aria-label="生日信互动">
      <div className="arrival-letter__backdrop" aria-hidden="true" />
      <div className="arrival-letter__scene">
        <button
          className="arrival-letter__dismiss"
          type="button"
          onClick={handleClose}
          aria-label={'\u5173\u95ed\u7eb8\u98de\u673a'}
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <button
          className="arrival-letter__plane"
          type="button"
          onClick={handleOpen}
          onAnimationEnd={handlePlaneAnimationEnd}
          disabled={phase !== 'ready'}
          aria-label="轻触展信"
        >
          <span className="arrival-letter__wing arrival-letter__wing--left" aria-hidden="true" />
          <span className="arrival-letter__wing arrival-letter__wing--right" aria-hidden="true" />
          <span className="arrival-letter__fold" aria-hidden="true" />
          <span className="arrival-letter__plane-prompt">轻触展信</span>
        </button>

        <article className="arrival-letter__paper" aria-label="生日信">
          <button className="arrival-letter__close" type="button" onClick={handleClose} aria-label="关闭生日信">
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="arrival-letter__message">
            {letterParagraphs.map((paragraph, index) => (
              <p key={paragraph} style={{ animationDelay: `${1030 + index * 580}ms` }}>
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
