import { useEffect, useRef } from 'react';

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animId: number;
    let mouse = { x: -9999, y: -9999 };

    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Particle {
      x: number; y: number; vx: number; vy: number; r: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.r = Math.random() * 1.5 + 0.4;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }
    }

    const init = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 11000);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const getTokens = () => {
      const s = getComputedStyle(document.documentElement);
      return {
        rgb: s.getPropertyValue('--neural-rgb').trim() || '245,158,11',
        nodeAlpha: parseFloat(s.getPropertyValue('--neural-node-alpha').trim() || '0.75'),
        connAlpha: parseFloat(s.getPropertyValue('--neural-conn-alpha').trim() || '0.45'),
        mouseAlpha: parseFloat(s.getPropertyValue('--neural-mouse-alpha').trim() || '0.75'),
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { rgb, nodeAlpha, connAlpha, mouseAlpha } = getTokens();

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        // node
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${nodeAlpha})`;
        ctx.fill();

        // peer connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgb},${((1 - dist / 150) * connAlpha).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // mouse connection
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 200) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${rgb},${((1 - md / 200) * mouseAlpha).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* deepest layer: bg-canvas fill so there's never bare HTML bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'var(--bg-canvas)', zIndex: 0 }}
      />
      {/* ambient radial gold glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.08) 0%, transparent 70%)',
          zIndex: 1,
        }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 2, opacity: 0.85 }}
      />
    </>
  );
}
