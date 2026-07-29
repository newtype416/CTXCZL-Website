import { useEffect, useRef, useState } from 'react';
import DogRunScene from './DogRunScene';
import { assetUrl } from '../utils/assets';

const PET_WIDTH = 190;
const PET_HEIGHT = 218;
const EDGE_GAP = 22;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function initialPosition() {
  return {
    x: Math.max(EDGE_GAP, window.innerWidth - PET_WIDTH - EDGE_GAP),
    y: Math.max(EDGE_GAP, window.innerHeight - PET_HEIGHT - EDGE_GAP - 5),
  };
}

const BARK_SOUND_URL = assetUrl('/audio/dog-bark.mp3');

function bark() {
  [0, 240].forEach((delay) => {
    window.setTimeout(() => {
      const sound = new Audio(BARK_SOUND_URL);
      sound.volume = 0.72;
      sound.play().catch(() => undefined);
    }, delay);
  });
}
export default function DesktopPet() {
  const [position, setPosition] = useState(initialPosition);
  const [hidden, setHidden] = useState(false);
  const [jumpTrigger, setJumpTrigger] = useState(0);
  const dragRef = useRef(null);

  useEffect(() => {
    const keepInView = () => {
      setPosition((current) => ({
        x: clamp(current.x, 0, Math.max(0, window.innerWidth - PET_WIDTH - EDGE_GAP)),
        y: clamp(current.y, EDGE_GAP, Math.max(EDGE_GAP, window.innerHeight - PET_HEIGHT)),
      }));
    };
    window.addEventListener('resize', keepInView);
    return () => window.removeEventListener('resize', keepInView);
  }, []);

  const handlePointerDown = (event) => {
    if (event.button !== 0 || event.target.closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) drag.moved = true;
    setPosition({
      x: clamp(event.clientX - drag.offsetX, 0, Math.max(0, window.innerWidth - PET_WIDTH - EDGE_GAP)),
      y: clamp(event.clientY - drag.offsetY, EDGE_GAP, Math.max(EDGE_GAP, window.innerHeight - PET_HEIGHT)),
    });
  };

  const stopDragging = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) {
      setJumpTrigger((current) => current + 1);
      bark();
    }
  };

  if (hidden) {
    return <button className="desktop-pet-launcher" type="button" onClick={() => setHidden(false)} aria-label="Show desktop pet">Didi</button>;
  }

  return (
    <aside className="desktop-pet" style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }} aria-label="Desktop pet">
      <DogRunScene followPointer jumpTrigger={jumpTrigger} />
      <div
        className="desktop-pet__hit-area"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        aria-label="Interact with desktop pet"
        role="button"
      />
      <button className="desktop-pet__dismiss" type="button" onClick={() => setHidden(true)} aria-label="Hide desktop pet" title="Hide desktop pet">x</button>
    </aside>
  );
}