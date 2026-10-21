import React, { useEffect, useRef, useState } from "react";

export const sayComment = (id, text, fade = true) => {
  window.dispatchEvent(new CustomEvent("cursor-comment", { detail: { id, text, fade } }));
};

export function PhoneComment() {
  const [comment, setComment] = useState(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const onComment = (event) => {
      const next = event.detail;
      if (next.id !== "hover" && window.innerWidth < 768) setComment(next);
    };
    window.addEventListener("cursor-comment", onComment);
    return () => window.removeEventListener("cursor-comment", onComment);
  }, []);

  useEffect(() => {
    setTyped("");
    if (!comment) return;
    let index = 0;
    let fade = 0;
    const timer = setInterval(() => {
      index += 1;
      setTyped(comment.text.slice(0, index));
      if (index >= comment.text.length) {
        clearInterval(timer);
        fade = setTimeout(() => setComment(null), 3800);
      }
    }, 28);
    return () => {
      clearInterval(timer);
      clearTimeout(fade);
    };
  }, [comment]);

  if (!comment) return null;

  return (
    <div aria-hidden="true" className="bc-phone-comment">
      <div className="bc-phone-bubble">
        <span className="bc-status-dot" />
        {typed || " "}
      </div>
    </div>
  );
}

export function CuriousCursor({ visible }) {
  const ref = useRef(null);
  const [comment, setComment] = useState(null);
  const [typed, setTyped] = useState("");
  const [moved, setMoved] = useState(false);
  const reposition = useRef(() => {});

  useEffect(() => {
    const target = { x: -200, y: -200 };
    const pos = { x: -200, y: -200 };
    let frame = 0;

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.28;
      pos.y += (target.y - pos.y) * 0.28;
      const el = ref.current;
      if (el) {
        const bubble = el.firstElementChild;
        const w = bubble?.offsetWidth ?? 0;
        const h = bubble?.offsetHeight ?? 0;
        const left = pos.x + 14 + w > window.innerWidth - 8;
        const up = pos.y + 16 + h > window.innerHeight - 8;
        const x = left ? pos.x - 14 - w : pos.x + 14;
        const y = up ? pos.y - 16 - h : pos.y + 16;
        el.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`;
        if (bubble) {
          const r = ["22px", "22px", "22px", "22px"];
          r[up ? (left ? 2 : 3) : left ? 1 : 0] = "2px";
          bubble.style.borderRadius = r.join(" ");
          bubble.style.transformOrigin = `${up ? "bottom" : "top"} ${left ? "right" : "left"}`;
        }
      }
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };

    reposition.current = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const move = (event) => {
      if (target.x === -200) {
        pos.x = event.clientX;
        pos.y = event.clientY;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      setMoved(true);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    let hoverText = "";
    const over = (event) => {
      const el = event.target instanceof Element ? event.target.closest("[data-cursor]") : null;
      const text = el?.dataset?.cursor ?? "";
      if (text === hoverText) return;
      hoverText = text;
      if (text) setComment({ id: "hover", text, fade: false });
      else setComment((c) => (c?.id === "hover" ? null : c));
    };

    const onComment = (event) => setComment(event.detail);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("cursor-comment", onComment);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("cursor-comment", onComment);
    };
  }, []);

  useEffect(() => {
    reposition.current();
  }, [typed]);

  useEffect(() => {
    setTyped("");
    if (!comment) return;
    let index = 0;
    let fade = 0;
    const timer = setInterval(() => {
      index += 1;
      setTyped(comment.text.slice(0, index));
      if (index >= comment.text.length) {
        clearInterval(timer);
        if (comment.fade) fade = setTimeout(() => setComment(null), 4500);
      }
    }, 28);
    return () => {
      clearInterval(timer);
      clearTimeout(fade);
    };
  }, [comment]);

  const showing = visible && moved && comment !== null;

  return (
    <div ref={ref} aria-hidden="true" className="bc-curious-cursor">
      <div className={`bc-cursor-bubble ${showing ? "bc-shown" : ""}`}>
        <span className="bc-status-dot" />
        {typed || " "}
      </div>
    </div>
  );
}

export default CuriousCursor;
