import React, { useEffect, useRef, useState } from "react";

export function SplashScreen({ onComplete }) {
  const [stage, setStage] = useState("initial");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      setStage("complete");
      onCompleteRef.current?.();
    };

    const fadeTimer = setTimeout(() => {
      setStage("fadeOut");
    }, 1200);

    const completeTimer = setTimeout(() => {
      finish();
    }, 1800);

    // Any user interaction skips the splash screen immediately
    const skipEvents = ["wheel", "touchmove", "keydown", "click"];
    const handleSkip = () => finish();
    skipEvents.forEach((ev) => window.addEventListener(ev, handleSkip, { passive: true, once: true }));

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      skipEvents.forEach((ev) => window.removeEventListener(ev, handleSkip));
    };
  }, []);

  if (stage === "complete") return null;

  return (
    <div className={`bc-splash-screen ${stage === "fadeOut" ? "bc-fade-out" : ""}`}>
      <div className="bc-splash-grid" />
      <div className={`bc-splash-content ${stage === "fadeOut" ? "bc-scale-down" : ""}`}>
        <h1 className="bc-splash-title">
          <span className="bc-splash-word-1">Bright</span>{" "}
          <span className="bc-splash-word-2">Code</span>
        </h1>
        <p className="bc-splash-subtitle">
          Real-Time Esports Arena · Campus Testing Ecosystem
        </p>
        <div className="bc-splash-divider" />
        <p className="bc-splash-telemetry">
          Sub-10ms Keystroke Synchronization · Isolated Docker Sandboxes
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;
