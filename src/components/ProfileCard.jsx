import { useRef } from 'react';
import './ProfileCard.css';

export default function ProfileCard({
  name,
  title,
  handle,
  status = '\u5728\u7ebf',
  contactText = '\u67e5\u770b\u4e3b\u9875',
  avatarUrl,
  miniAvatarUrl,
  behindGlowColor = 'rgba(255, 126, 46, 0.55)',
  className = '',
  onClick,
}) {
  const cardRef = useRef(null);

  const updateTilt = (event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty('--tilt-x', `${(0.5 - y) * 12}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * 14}deg`);
    card.style.setProperty('--glow-x', `${x * 100}%`);
    card.style.setProperty('--glow-y', `${y * 100}%`);
    card.style.setProperty('--hint-x', `${x * 100}%`);
    card.style.setProperty('--hint-y', `${y * 100}%`);
  };

  const resetTilt = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--glow-x', '50%');
    card.style.setProperty('--glow-y', '50%');
    card.style.setProperty('--hint-x', '50%');
    card.style.setProperty('--hint-y', '50%');
  };

  return (
    <div className="profile-card-scene" onClick={onClick}>
      <div className="profile-card-flipper">
        <article
          ref={cardRef}
          className={`profile-card profile-card-face profile-card-front ${className}`}
          style={{ '--behind-glow': behindGlowColor }}
          onPointerMove={updateTilt}
          onPointerLeave={resetTilt}
        >
          <div className="profile-card__glow" />
          <span className="profile-card__hover-hint" aria-hidden="true">Click~</span>
          <img className="profile-card__avatar" src={avatarUrl} alt={`${name}\u5361\u7247`} />
          <div className="profile-card__wash" />
          <div className="profile-card__topline">
            <div className="profile-card__identity">
              <img src={miniAvatarUrl} alt="" className="profile-card__mini-avatar" />
              <div>
                <strong>@{handle}</strong>
                <span>{status}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
