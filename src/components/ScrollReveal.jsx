import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const revealTimerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealTimerRef.current = window.setTimeout(() => setRevealed(true), delay);
        } else {
          window.clearTimeout(revealTimerRef.current);
          setRevealed(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      window.clearTimeout(revealTimerRef.current);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${revealed ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
