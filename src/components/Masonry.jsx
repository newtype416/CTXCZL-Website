import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './Masonry.css';

function useColumns() {
  const getColumns = () => {
    if (typeof window === 'undefined') return 1;
    if (window.matchMedia('(min-width: 1500px)').matches) return 5;
    if (window.matchMedia('(min-width: 1000px)').matches) return 4;
    if (window.matchMedia('(min-width: 600px)').matches) return 3;
    if (window.matchMedia('(min-width: 400px)').matches) return 2;
    return 1;
  };

  const [columns, setColumns] = useState(getColumns);

  useEffect(() => {
    const updateColumns = () => setColumns(getColumns());
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
}

function useMeasure() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

export default function Masonry({
  items,
  onItemClick,
  renderOverlay,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.06,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.96,
  blurToFocus = true,
}) {
  const columns = useColumns();
  const [containerRef, width] = useMeasure();
  const mounted = useRef(false);

  const grid = useMemo(() => {
    if (!width) return { items: [], height: 0 };

    const gap = 12;
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);
    const positionedItems = items.map((item) => {
      const column = columnHeights.indexOf(Math.min(...columnHeights));
      const aspectRatio = item.height / item.width;
      const height = Math.round(columnWidth * aspectRatio);
      const x = column * (columnWidth + gap);
      const y = columnHeights[column];
      columnHeights[column] += height + gap;
      return { ...item, x, y, width: columnWidth, height };
    });

    return { items: positionedItems, height: Math.max(...columnHeights, 0) - gap };
  }, [columns, items, width]);

  useLayoutEffect(() => {
    if (!grid.items.length) return;

    grid.items.forEach((item, index) => {
      const element = containerRef.current?.querySelector(`[data-key="${item.id}"]`);
      if (!element) return;

      const target = { x: item.x, y: item.y, width: item.width, height: item.height };
      if (!mounted.current) {
        const initial = animateFrom === 'top'
          ? { x: item.x, y: -120 }
          : animateFrom === 'left'
            ? { x: -160, y: item.y }
            : animateFrom === 'right'
              ? { x: width + 160, y: item.y }
              : { x: item.x, y: window.innerHeight + 120 };

        gsap.fromTo(element, { opacity: 0, ...initial, width: item.width, height: item.height, ...(blurToFocus ? { filter: 'blur(10px)' } : {}) }, {
          opacity: 1,
          ...target,
          ...(blurToFocus ? { filter: 'blur(0px)' } : {}),
          duration: 0.8,
          ease,
          delay: index * stagger,
        });
      } else {
        gsap.to(element, { ...target, duration, ease, overwrite: 'auto' });
      }
    });

    mounted.current = true;
  }, [animateFrom, blurToFocus, containerRef, duration, ease, grid, stagger, width]);

  return (
    <div ref={containerRef} className="masonry-list" style={{ height: Math.max(grid.height, 0) }}>
      {grid.items.map((item) => (
        <button
          key={item.id}
          type="button"
          data-key={item.id}
          className="masonry-item group"
          onClick={() => onItemClick?.(item)}
          onMouseEnter={(event) => scaleOnHover && gsap.to(event.currentTarget, { scale: hoverScale, duration: 0.3, ease: 'power2.out' })}
          onMouseLeave={(event) => scaleOnHover && gsap.to(event.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' })}
          aria-label={item.ariaLabel || item.title}
        >
          <img src={item.image} alt={item.title} className="masonry-image" loading="lazy" />
          {renderOverlay?.(item)}
        </button>
      ))}
    </div>
  );
}
