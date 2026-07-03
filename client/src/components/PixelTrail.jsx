import React, { useRef, useEffect } from 'react';

const PixelTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const mouse = { 
      x: 0, 
      y: 0, 
      active: false,
      opacity: 0,
      lastMoveTime: Date.now()
    };

    const gridSize = 72; // Reduced by 10% (80px -> 72px)
    
    const getThemeRgb = () => {
      const computed = getComputedStyle(document.documentElement);
      return computed.getPropertyValue('--primary-rgb').trim() || '239, 68, 68';
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.lastMoveTime = Date.now();
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const drawGrid = (opacity) => {
      const width = canvas.width;
      const height = canvas.height;
      const highlightRadius = 300; // Increased radius for larger grid visibility
      const themeRgb = getThemeRgb();

      ctx.clearRect(0, 0, width, height);

      // 1. Draw the Red Radial Glow first (Background of grid)
      if (mouse.active && opacity > 0.01) {
        const glowRadius = 300; // Larger radius for a softer spread
        const glowGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0, 
          mouse.x, mouse.y, glowRadius
        );
        
        // Smoother, multi-step falloff to avoid the "torch" look
        glowGradient.addColorStop(0, `rgba(${themeRgb}, ${0.24 * opacity})`); 
        glowGradient.addColorStop(0.3, `rgba(${themeRgb}, ${0.11 * opacity})`); 
        glowGradient.addColorStop(0.6, `rgba(${themeRgb}, ${0.035 * opacity})`); 
        glowGradient.addColorStop(1, `rgba(${themeRgb}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        const distY = Math.abs(y - mouse.y);
        let lineOpacity = 0.06; // Base visibility
        
        if (mouse.active && distY < highlightRadius) {
          const factor = 1 - distY / highlightRadius;
          lineOpacity = Math.max(0.06, factor * 0.45 * opacity); 
        }
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${themeRgb}, ${lineOpacity})`;
        ctx.lineWidth = 0.6; 
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Draw vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        const distX = Math.abs(x - mouse.x);
        let lineOpacity = 0.06; // Base visibility

        if (mouse.active && distX < highlightRadius) {
          const factor = 1 - distX / highlightRadius;
          lineOpacity = Math.max(0.06, factor * 0.45 * opacity); 
        }
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${themeRgb}, ${lineOpacity})`;
        ctx.lineWidth = 0.6; 
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    };

    const animate = () => {
      const now = Date.now();
      const timeSinceMove = now - mouse.lastMoveTime;
      
      const targetOpacity = (mouse.active && timeSinceMove < 3000) ? 1 : 0.2;
      mouse.opacity += (targetOpacity - mouse.opacity) * 0.05;

      drawGrid(mouse.opacity);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'transparent',
      }}
    />
  );
};

export default PixelTrail;
