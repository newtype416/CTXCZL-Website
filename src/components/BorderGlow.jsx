import { useCallback, useRef } from 'react';
import './BorderGlow.css';

const POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function gradientVariables(colors) {
  return POSITIONS.reduce((variables, position, index) => {
    const color = colors[Math.min(COLOR_MAP[index], colors.length - 1)];
    variables[`--border-gradient-${index}`] = `radial-gradient(at ${position}, ${color} 0, transparent 50%)`;
    return variables;
  }, {});
}

export default function BorderGlow({
  children,
  className = '',
  glowColor = '30 85 72',
  borderRadius = 16,
  glowRadius = 26,
  glowIntensity = 1,
  coneSpread = 25,
  colors = ['#fb923c', '#fda4af', '#fef08a'],
}) {
  const cardRef = useRef(null);

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;
    const edge = Math.min(1, Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2)));
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

    card.style.setProperty('--border-edge', edge.toFixed(3));
    card.style.setProperty('--border-angle', `${angle}deg`);
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow ${className}`}
      style={{
        '--border-radius': `${borderRadius}px`,
        '--glow-radius': `${glowRadius}px`,
        '--glow-color': `hsl(${glowColor} / ${Math.min(glowIntensity, 1)})`,
        '--cone-spread': `${coneSpread}%`,
        ...gradientVariables(colors),
      }}
    >
      <span className="border-glow__light" aria-hidden="true" />
      {children}
    </div>
  );
}
