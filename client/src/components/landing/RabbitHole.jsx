import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const FELL_IN = "brightcode-fell-into-arena";

const DEBRIS = [
  { glyph: "{ }", x: 0.18, y: 0.22, size: 32 },
  { glyph: "const duel = 1v1;", x: 0.78, y: 0.18, size: 16 },
  { glyph: "⚔️", x: 0.12, y: 0.65, size: 40 },
  { glyph: "return true;", x: 0.86, y: 0.54, size: 16 },
  { glyph: "BrightCode.init()", x: 0.35, y: 0.82, size: 22 },
  { glyph: "01011001", x: 0.7, y: 0.84, size: 18 },
  { glyph: "fn resolve()", x: 0.52, y: 0.12, size: 18 },
  { glyph: "+250 ELO", x: 0.88, y: 0.86, size: 22 },
  { glyph: "🛡️ AI SENTINEL", x: 0.28, y: 0.38, size: 18 }
];

function Fall({ origin, onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = performance.now();
    const duration = 1200;

    const frame = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(eased);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(onDone, 90);
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [onDone]);

  const centerX = origin?.x ?? window.innerWidth / 2;
  const centerY = origin?.y ?? window.innerHeight / 2;

  return (
    <div className="bc-fall-overlay">
      <div
        className="bc-fall-vortex"
        style={{
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: `translate(-50%, -50%) scale(${progress * 40 + 0.5}) rotate(${progress * 540}deg)`,
          opacity: Math.min(1, progress * 1.6),
        }}
      />
      <div
        className="bc-fall-core"
        style={{
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: `translate(-50%, -50%) scale(${1 + progress * 4})`,
          opacity: progress < 0.8 ? 1 : (1 - progress) * 5,
        }}
      />
      {DEBRIS.map((item, idx) => {
        const startX = item.x * window.innerWidth;
        const startY = item.y * window.innerHeight;
        const currentX = startX + (centerX - startX) * progress;
        const currentY = startY + (centerY - startY) * progress;
        const angle = (progress * 720) + idx * 45;
        const scale = Math.max(0.01, (1 - progress) * 1.2);
        const opacity = Math.max(0, 1 - progress * 1.1);

        return (
          <div
            key={idx}
            className="bc-debris-item"
            style={{
              left: `${currentX}px`,
              top: `${currentY}px`,
              fontSize: `${item.size}px`,
              transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`,
              opacity,
            }}
          >
            {item.glyph}
          </div>
        );
      })}
    </div>
  );
}

export function RabbitHoleButton({ label = "Launch Arena [1v1 Duel]", target = "/auth", dataCursor = "Enter the multiplayer code arena ⚔️" }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [origin, setOrigin] = useState(null);

  const jump = () => {
    const button = ref.current;
    if (!button || origin) return;
    const r = button.getBoundingClientRect();
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    try {
      sessionStorage.setItem(FELL_IN, "1");
    } catch (e) {}
  };

  return (
    <>
      <button
        ref={ref}
        onClick={jump}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        data-cursor={dataCursor}
        className={`bc-rabbit-hole-btn ${hovered ? "hovered" : ""} ${origin ? "jumping" : ""}`}
      >
        {origin ? "Entering Arena..." : hovered ? "Ready to Duel?" : label}
        <span className="bc-btn-arrow">→</span>
      </button>

      {origin && (
        <Fall
          origin={origin}
          onDone={() => {
            navigate(target);
          }}
        />
      )}
    </>
  );
}

export default RabbitHoleButton;
