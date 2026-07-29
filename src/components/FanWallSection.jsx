import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import SplitText from './SplitText';
import './FanWallSection.css';

const DANMAKU_COLORS = ['#b63f1d', '#d9571f', '#e96d21', '#f28b26', '#f7ad32', '#cf4a24'];
const DANMAKU_LANES = 12;

const FAN_MESSAGES_API_URL = (import.meta.env.VITE_FAN_MESSAGES_API_URL || '/api/fan-messages').replace(/\/$/, '');
function DanmakuWall({ messages, wallRef }) {
  return (
    <div ref={wallRef} className="danmaku-wall" aria-label="Latest fan messages scrolling from right to left">
      {messages.map((message, index) => {
        const lane = index % DANMAKU_LANES;
        const duration = 16 + ((index * 7) % 9);
        const delay = -((index * 2.3) % duration);
        return (
          <span
            key={`${message.createdAt}-${index}`}
            className={index === 0 ? 'danmaku-item danmaku-item--latest' : 'danmaku-item'}
            style={{
              '--lane': lane,
              '--duration': `${duration}s`,
              '--delay': `${delay}s`,
              '--danmaku-color': DANMAKU_COLORS[index % DANMAKU_COLORS.length],
            }}
            title={message.content}
          >
            {message.content}
          </span>
        );
      })}
    </div>
  );
}

function ParticleFlight({ flight }) {
  const [burst, setBurst] = useState(false);
  const particles = useMemo(() => {
    const colors = ['#ff7e2e', '#ff9c4a', '#ffbc62', '#ffe0a5', '#e6601a'];
    return Array.from({ length: 72 }, (_, index) => ({
      id: index,
      x: ((index * 17) % 17) - 8,
      y: ((index * 23) % 17) - 8,
      angle: (index * 137.5) % 360,
      distance: 84 + ((index * 29) % 142),
      color: colors[(index + (flight?.id ?? 0)) % colors.length],
      secondary: index >= 48,
      delay: index >= 48 ? 0.28 + ((index % 6) * 0.035) : (index % 9) * 0.018,
    }));
  }, [flight?.id]);

  useEffect(() => {
    if (!flight) return undefined;
    setBurst(false);
    const timer = window.setTimeout(() => setBurst(true), 2800);
    return () => window.clearTimeout(timer);
  }, [flight]);

  if (!flight) return null;
  return (
    <div className="fanwall-effects" aria-hidden="true">
      <div className={`firework-launch ${burst ? 'firework-launch--burst' : ''}`} style={{ '--start-x': `${flight.startX}px`, '--start-y': `${flight.startY}px`, '--target-y': `${flight.targetY}px` }}>
        <div className="attachment-flight">
          <span className="attachment-flight__heart">{'\u2665'}</span>
          <span className="attachment-flight__trail" />
        </div>
        <div className="firework-cluster">
          <span className="firework-flash" />
          {particles.map((particle) => <span key={particle.id} className={particle.secondary ? 'firework-spark firework-spark--secondary' : 'firework-spark'} style={{ '--cluster-x': `${particle.x}px`, '--cluster-y': `${particle.y}px`, '--burst-angle': `${particle.angle}deg`, '--burst-distance': `${particle.distance}px`, '--burst-color': particle.color, '--burst-delay': `${particle.delay}s` }}>{'\u2665'}</span>)}
          {Array.from({ length: 16 }, (_, index) => <span key={`smoke-${index}`} className="firework-smoke" style={{ '--smoke-angle': `${index * 22.5}deg`, '--smoke-distance': `${42 + ((index * 19) % 52)}px`, '--smoke-delay': `${(index % 5) * 0.06}s` }} />)}
        </div>
      </div>
    </div>
  );
}

export default function FanWallSection() {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [flight, setFlight] = useState(null);
  const effectsRootRef = useRef(null);
  const danmakuRef = useRef(null);
  const inputRef = useRef(null);

  const loadMessages = useCallback(async () => {
    const response = await fetch(FAN_MESSAGES_API_URL);
    if (!response.ok) throw new Error('Unable to load messages');
    const { messages: savedMessages } = await response.json();
    if (Array.isArray(savedMessages)) setMessages(savedMessages);
  }, []);

  useEffect(() => {
    loadMessages().catch(() => undefined);
    const timer = window.setInterval(() => loadMessages().catch(() => undefined), 30000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  const triggerFlight = (message) => {
    if (!effectsRootRef.current || !danmakuRef.current || !inputRef.current) return;
    const effectsRoot = effectsRootRef.current.getBoundingClientRect();
    const input = inputRef.current.getBoundingClientRect();
    const danmakuWall = danmakuRef.current.getBoundingClientRect();
    const flightId = Date.now();
    const centerX = input.left - effectsRoot.left + input.width * 0.5;
    setFlight({ id: flightId, startX: centerX, startY: input.top - effectsRoot.top + input.height * 0.5, targetY: danmakuWall.top - effectsRoot.top + danmakuWall.height * 0.36 });
    window.setTimeout(() => setFlight((current) => current?.id === flightId ? null : current), 5000);
    setMessages((current) => [message, ...current.filter((item) => item.id !== message.id)].slice(0, 200));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = inputMsg.trim();
    if (!message || submitting) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch(FAN_MESSAGES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.message) throw new Error(payload.error || 'Unable to save message');

      triggerFlight(payload.message);
      setInputMsg('');
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 2000);
    } catch (error) {
      setSubmitError(error.message || '\u7559\u8a00\u53d1\u5e03\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="fanwall" className="section-padding bg-transparent">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <SplitText text="CZL's VOICE" tag="h2" className="font-[Microsoft_YaHei] text-[43px] font-black tracking-wide text-gray-800 md:text-[58px] lg:text-[72px]" delay={100} duration={1.2} ease="power3.out" splitType="words" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0} rootMargin="200px" textAlign="center" />
            <div className="flex justify-center mt-3">
              <SplitText text={'\u6dfb\u6dfb\u5f00\u5fc3\uff0c\u591a\u591a\u89c1\u9762'} tag="p" className="text-sm tracking-widest text-gray-600" delay={100} duration={1.2} ease="power3.out" splitType="words" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0} rootMargin="200px" textAlign="center" />
            </div>
            <div className="w-12 h-[2px] bg-warm-400 mx-auto mt-4" />
          </div>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <div ref={effectsRootRef} className="max-w-8xl mx-auto relative">
            <DanmakuWall messages={messages} wallRef={danmakuRef} />
            <div className="mt-[60px]">
              <form onSubmit={handleSubmit} className="fanwall-form flex items-center gap-3 max-w-2xl mx-auto">
                <label className="sr-only" htmlFor="fan-message">{'\u5199\u4e0b\u60f3\u8bf4\u7684\u8bdd'}</label>
                <div className="message-input-glow">
                  <textarea ref={inputRef} id="fan-message" value={inputMsg} onChange={(event) => setInputMsg(event.target.value)} placeholder={'\u5199\u4e0b\u60f3\u8bf4\u7684\u8bdd...'} className="message-input" maxLength={500} disabled={submitting} />
                </div>
                <button type="submit" disabled={submitting} className="h-12 px-6 bg-gradient-to-r from-warm-500 to-warm-400 text-white text-sm rounded-full font-medium hover:shadow-lg hover:shadow-warm-200/50 transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? '\u53d1\u5e03\u4e2d...' : '\u53d1\u9001'}</button>
              </form>
              {submitted && <p className="text-center text-xs text-warm-600 mt-3 animate-fade-in">{'\u611f\u8c22\u4f60\u7684\u7559\u8a00\uff01'}</p>}
              {submitError && <p className="text-center text-xs text-red-500 mt-3" role="alert">{submitError}</p>}
              <p className="text-center text-xs text-gray-500 mt-3">{'\u5df2\u6709 '}{messages.length}{' \u6761\u6e29\u6696\u7559\u8a00'}</p>
            </div>
            <ParticleFlight flight={flight} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
