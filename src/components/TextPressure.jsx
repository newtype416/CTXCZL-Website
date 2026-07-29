import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const attributeValue = (d, max, min, range) => Math.max(min, range - Math.abs((range * d) / max) + min);

export default function TextPressure({
  text = 'LOADING……',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  textColor = '#FFFFFF',
  className = '',
  minFontSize = 20,
  maxFontSize = Number.POSITIVE_INFINITY,
}) {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(minFontSize);
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const onMouseMove = (event) => { cursorRef.current = { x: event.clientX, y: event.clientY }; };
    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) cursorRef.current = { x: touch.clientX, y: touch.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      cursorRef.current = mouseRef.current;
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const resize = useCallback(() => {
    if (!containerRef.current) return;
    const widthValue = containerRef.current.getBoundingClientRect().width;
    setFontSize(Math.min(Math.max(widthValue / Math.max(chars.length / 2, 1), minFontSize), maxFontSize));
  }, [chars.length, maxFontSize, minFontSize]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  useEffect(() => {
    let frame;
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;
      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDistance = Math.max(titleRect.width / 2, 1);
        spansRef.current.forEach((span) => {
          if (!span) return;
          const rect = span.getBoundingClientRect();
          const d = distance(mouseRef.current, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
          const wdth = width ? Math.floor(attributeValue(d, maxDistance, 5, 200)) : 100;
          const wght = weight ? Math.floor(attributeValue(d, maxDistance, 500, 900)) : 700;
          const ital = italic ? attributeValue(d, maxDistance, 0, 1).toFixed(2) : 0;
          span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital}`;
          if (alpha) span.style.opacity = attributeValue(d, maxDistance, 0, 1).toFixed(2);
        });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [alpha, italic, weight, width]);

  const styleElement = useMemo(() => (
    <style>{`@import url('${fontUrl}'); .text-pressure-flex { display: flex; justify-content: space-between; }`}</style>
  ), [fontUrl]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-transparent">
      {styleElement}
      <h1
        ref={titleRef}
        className={`${flex ? 'text-pressure-flex ' : ''}${className}`}
        style={{ fontFamily, fontSize, lineHeight: 1, color: textColor, margin: 0, textAlign: 'center', userSelect: 'none', whiteSpace: 'nowrap', fontWeight: 700, width: '100%' }}
      >
        {chars.map((char, index) => (
          <span key={`${char}-${index}`} ref={(element) => { spansRef.current[index] = element; }} style={{ display: 'inline-block', color: textColor }}>
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
}
