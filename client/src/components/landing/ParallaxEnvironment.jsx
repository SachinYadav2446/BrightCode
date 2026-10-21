import React, { useEffect, useRef } from "react";

export function ParallaxEnvironment({ subscribe }) {
  const deepGridRef = useRef(null);
  const midLayerRef = useRef(null);
  const dustLayerRef = useRef(null);
  const warpGlowRef = useRef(null);

  useEffect(() => {
    return subscribe((progress) => {
      if (deepGridRef.current) {
        deepGridRef.current.style.transform = `translate3d(-${progress * 150}vw, 0, 0)`;
      }
      if (midLayerRef.current) {
        midLayerRef.current.style.transform = `translate3d(-${progress * 280}vw, 0, 0)`;
      }
      if (dustLayerRef.current) {
        dustLayerRef.current.style.transform = `translate3d(-${progress * 520}vw, 0, 0)`;
      }
      if (warpGlowRef.current) {
        // Warp illumination peaks around progress 0.20-0.35 (during transition into Arena)
        const factor = Math.max(0, 1 - Math.abs(progress - 0.28) / 0.16);
        warpGlowRef.current.style.opacity = `${factor * 0.8}`;
      }
    });
  }, [subscribe]);

  return (
    <div aria-hidden="true" className="bc-parallax-env">
      {/* Layer 1: Deep slow cyber grid & ambient lighting */}
      <div ref={deepGridRef} className="bc-parallax-deep">
        <div className="bc-grid-bg-pattern" />
        <div className="bc-ambient-pool bc-pool-1" />
        <div className="bc-ambient-pool bc-pool-2" />
        <div className="bc-ambient-pool bc-pool-3" />
      </div>

      {/* Layer 2: Dimensional Warp Portal Bloom */}
      <div ref={warpGlowRef} className="bc-parallax-warp">
        <div className="bc-warp-bloom" />
        <div className="bc-warp-lines">
          <div className="bc-warp-line full" />
          <div className="bc-warp-line mid" />
          <div className="bc-warp-line full" />
        </div>
      </div>

      {/* Layer 3: Midground tech markers - All coordinates >= 120vw to protect Hero */}
      <div ref={midLayerRef} className="bc-parallax-mid">
        <span style={{ left: "135vw", top: "22vh" }}>// ARENA_CORE_INITIALIZED</span>
        <span style={{ left: "165vw", top: "76vh" }}>01000010 01010011</span>
        <span style={{ left: "190vw", top: "16vh" }}>✦ [MONACO_AST_ENGINE]</span>
        <span style={{ left: "220vw", top: "82vh" }}>&#123; duel_mode: &apos;1v1_ranked&apos; &#125;</span>
        <span style={{ left: "245vw", top: "24vh" }}>// SENTINEL_AI_PROCTOR_v3</span>
        <span style={{ left: "280vw", top: "78vh" }}>CAMPUS_CONCURRENCY [300_TESTEES]</span>
        <span style={{ left: "310vw", top: "18vh" }}>WEBSOCKET_LATENCY [&lt;8ms]</span>
        <span style={{ left: "345vw", top: "82vh" }}>// PRODUCTION_DOCKER_SANDBOX</span>
      </div>

      {/* Layer 4: Floating star dust particles */}
      <div ref={dustLayerRef} className="bc-parallax-stars">
        {[
          { x: "115vw", y: "30vh", s: 3.5, c: "rgba(255,255,255,0.4)" },
          { x: "138vw", y: "65vh", s: 5, c: "#fb7185" },
          { x: "165vw", y: "20vh", s: 4, c: "rgba(255,255,255,0.5)" },
          { x: "195vw", y: "78vh", s: 4.5, c: "rgba(255,255,255,0.4)" },
          { x: "230vw", y: "35vh", s: 5, c: "#f43f5e" },
          { x: "260vw", y: "60vh", s: 5.5, c: "rgba(255,255,255,0.5)" },
          { x: "295vw", y: "25vh", s: 4, c: "rgba(255,255,255,0.6)" },
          { x: "330vw", y: "70vh", s: 5, c: "#fb7185" },
          { x: "365vw", y: "40vh", s: 4.5, c: "rgba(255,255,255,0.5)" },
        ].map((pt, i) => (
          <span
            key={i}
            className="bc-star-particle"
            style={{
              left: pt.x,
              top: pt.y,
              width: `${pt.s}px`,
              height: `${pt.s}px`,
              backgroundColor: pt.c,
              boxShadow: `0 0 8px ${pt.c}`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ParallaxEnvironment;
