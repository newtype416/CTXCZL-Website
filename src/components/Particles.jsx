import { useEffect, useRef } from 'react';

const hexToRgba = (hex, alpha) => {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export default function Particles({
  className = '',
  particleCount = 230,
  particleSpread = 10,
  speed = 0.15,
  particleColors = ['#ff6b6b', '#6b98e2', '#Fa730a'],
  moveParticlesOnHover = true,
  particleHoverFactor = 1,
  alphaParticles = true,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const pointer = { x: 0, y: 0, active: false };
    const particles = Array.from({ length: particleCount }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      depth: Math.random(),
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: (Math.random() - 0.5) * 0.4,
      size: 0.35 + Math.random() * sizeRandomness,
      color: particleColors[index % particleColors.length],
      phase: Math.random() * Math.PI * 2
    }));

    let frameId;
    let width = 0;
    let height = 0;
    let lastTime = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const animate = (time) => {
      const delta = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += (particle.driftX * speed * delta) / 1000;
        particle.y += (particle.driftY * speed * delta) / 1000;
        if (particle.x < -0.05) particle.x = 1.05;
        if (particle.x > 1.05) particle.x = -0.05;
        if (particle.y < -0.05) particle.y = 1.05;
        if (particle.y > 1.05) particle.y = -0.05;

        let x = particle.x * width;
        let y = particle.y * height;
        if (moveParticlesOnHover && pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          const influence = Math.max(0, 1 - distance / (Math.min(width, height) * 0.24));
          x += (dx / distance) * influence * 20 * particleHoverFactor;
          y += (dy / distance) * influence * 20 * particleHoverFactor;
        }

        const scale = 0.45 + particle.depth * 0.85;
        const radius = Math.max(0.75, (particleBaseSize / cameraDistance) * 0.16 * particle.size * scale);
        const rotation = disableRotation ? 0 : time * speed * 0.0007 + particle.phase;
        const alpha = alphaParticles ? 0.14 + particle.depth * 0.36 : 0.7;

        context.save();
        context.translate(x, y);
        context.rotate(rotation);
        context.fillStyle = hexToRgba(particle.color, alpha);
        context.beginPath();
        context.ellipse(0, 0, radius, radius * 0.68, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      frameId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onPointerLeave, { passive: true });
    frameId = window.requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerLeave);
      window.cancelAnimationFrame(frameId);
    };
  }, [particleCount, particleSpread, speed, particleColors, moveParticlesOnHover, particleHoverFactor, alphaParticles, particleBaseSize, sizeRandomness, cameraDistance, disableRotation]);

  return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} aria-hidden="true" />;
}
