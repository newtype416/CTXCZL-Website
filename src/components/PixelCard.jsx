import { useEffect, useRef } from 'react';
import './PixelCard.css';

const COLORS = ['#fff7ed', '#fed7aa', '#fb923c'];

export default function PixelCard({ className = '', children }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext('2d');
    let pixels = [];
    let pixelRatio = 1;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      pixels = [];

      for (let x = 0; x < width; x += 7) {
        for (let y = 0; y < height; y += 7) {
          pixels.push({
            x,
            y,
            size: 0,
            maxSize: 0.9 + Math.random() * 1.6,
            delay: Math.hypot(x - width / 2, y - height / 2) * 0.85,
            elapsed: 0,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
    };

    const render = () => {
      const width = canvas.width / pixelRatio;
      const height = canvas.height / pixelRatio;
      context.clearRect(0, 0, width, height);
      let visible = false;

      pixels.forEach((pixel) => {
        if (hoveredRef.current) {
          pixel.elapsed += 5;
          if (pixel.elapsed >= pixel.delay) pixel.size = Math.min(pixel.maxSize, pixel.size + 0.18);
        } else {
          pixel.elapsed = 0;
          pixel.size = Math.max(0, pixel.size - 0.14);
        }

        if (pixel.size > 0.02) {
          visible = true;
          context.fillStyle = pixel.color;
          context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
        }
      });

      if (hoveredRef.current || visible) frameRef.current = requestAnimationFrame(render);
    };

    const start = (hovered) => {
      hoveredRef.current = hovered;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const enter = () => start(true);
    const leave = () => start(false);
    container.addEventListener('mouseenter', enter);
    container.addEventListener('mouseleave', leave);

    return () => {
      observer.disconnect();
      container.removeEventListener('mouseenter', enter);
      container.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={`pixel-card ${className}`}>
      <canvas ref={canvasRef} className="pixel-card__canvas" aria-hidden="true" />
      {children}
    </div>
  );
}