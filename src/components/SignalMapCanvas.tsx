/**
 * SignalMapCanvas — logistics network signal map for the landing hero.
 *
 * Draws a purposeful freight network with named nodes, directed routes,
 * moving data packets, a threat-path overlay, and mouse-reactive highlighting.
 * Confined to the right panel of the hero — not a full-page background.
 */
import { useEffect, useRef } from 'react';

interface NodeDef {
  label: string;
  x: number; // fraction of canvas CSS width
  y: number; // fraction of canvas CSS height
  r: number;
  threat?: boolean;
}

interface EdgeDef {
  from: number;
  to: number;
  dashed?: boolean;
}

interface Packet {
  edge: number;
  t: number;   // 0–1 progress along edge
  speed: number; // fraction-per-second
}

// Node positions are fractions — they scale with container size
const NODES: NodeDef[] = [
  { label: 'PORT',     x: 0.13, y: 0.70, r: 5 },
  { label: 'CUSTOMS',  x: 0.32, y: 0.47, r: 4.5 },
  { label: 'HUB',      x: 0.56, y: 0.29, r: 5 },
  { label: 'HQ',       x: 0.74, y: 0.54, r: 4.5 },
  { label: 'DIST.',    x: 0.90, y: 0.76, r: 4 },
  { label: '⚠ THREAT', x: 0.42, y: 0.73, r: 4.5, threat: true },
];

const EDGES: EdgeDef[] = [
  { from: 0, to: 1 },                    // PORT → CUSTOMS
  { from: 1, to: 2 },                    // CUSTOMS → HUB
  { from: 2, to: 3 },                    // HUB → HQ
  { from: 3, to: 4 },                    // HQ → DIST
  { from: 0, to: 5, dashed: true },      // PORT → THREAT (compromise path)
  { from: 5, to: 2, dashed: true },      // THREAT → HUB  (infiltration path)
];

const SOLID_EDGES = [0, 1, 2, 3];

function distToSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function SignalMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    let pulseT = 0;
    const mouse = { x: -9999, y: -9999 };

    // Stagger packet starting positions so they don't all move in lockstep
    const packets: Packet[] = SOLID_EDGES.map((edgeIdx, i) => ({
      edge: edgeIdx,
      t: i * 0.26,
      speed: 0.055 + i * 0.008,
    }));

    // Mouse coords in CSS pixels relative to canvas
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      // Reset transform to prevent accumulation on repeated resize
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Helpers — CSS pixel dimensions for drawing
    const W = () => canvas.width / (window.devicePixelRatio || 1);
    const H = () => canvas.height / (window.devicePixelRatio || 1);
    const npos = (n: NodeDef) => ({ x: n.x * W(), y: n.y * H() });

    function draw(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      pulseT = (pulseT + dt / 2.4) % 1; // 2.4s threat-pulse cycle

      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // ── Background grid ────────────────────────────────────────────────
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(245,158,11,0.028)';
      const grid = 70;
      for (let gx = 0; gx < w; gx += grid) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += grid) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      // ── Route lines ────────────────────────────────────────────────────
      ctx.setLineDash([]);
      EDGES.forEach((edge) => {
        const a = npos(NODES[edge.from]);
        const b = npos(NODES[edge.to]);
        const proximity = Math.max(0, 1 - distToSegment(mouse.x, mouse.y, a.x, a.y, b.x, b.y) / 130);

        if (edge.dashed) {
          ctx.setLineDash([5, 8]);
          ctx.strokeStyle = `rgba(251,146,60,${(0.10 + proximity * 0.28).toFixed(3)})`;
          ctx.lineWidth = 0.9;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = `rgba(245,158,11,${(0.14 + proximity * 0.36).toFixed(3)})`;
          ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // ── Threat pulse ───────────────────────────────────────────────────
      const tp = npos(NODES[5]);
      const pulseR = pulseT * 58;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251,146,60,${((1 - pulseT) * 0.45).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Data packets ───────────────────────────────────────────────────
      packets.forEach((pkt) => {
        pkt.t = (pkt.t + pkt.speed * dt) % 1;
        const edge = EDGES[pkt.edge];
        const a = npos(NODES[edge.from]);
        const b = npos(NODES[edge.to]);

        // Tail
        for (let j = 1; j <= 7; j++) {
          const tailT = pkt.t - j * 0.013;
          if (tailT < 0) continue;
          const tx = a.x + (b.x - a.x) * tailT;
          const ty = a.y + (b.y - a.y) * tailT;
          const alpha = Math.max(0, 0.55 - j * 0.075);
          ctx.beginPath();
          ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,158,11,${alpha.toFixed(3)})`;
          ctx.fill();
        }

        // Head
        const hx = a.x + (b.x - a.x) * pkt.t;
        const hy = a.y + (b.y - a.y) * pkt.t;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.96)';
        ctx.fill();
      });

      // ── Nodes ──────────────────────────────────────────────────────────
      NODES.forEach((node) => {
        const p = npos(node);
        const nearMouse = Math.hypot(mouse.x - p.x, mouse.y - p.y) < 72;
        const [r, g, b_] = node.threat ? [251, 146, 60] : [245, 158, 11];
        const fillAlpha = nearMouse ? 1 : 0.78;

        // Node fill
        ctx.beginPath();
        ctx.arc(p.x, p.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b_},${fillAlpha})`;
        ctx.fill();

        // Hover ring
        if (nearMouse) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, node.r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r},${g},${b_},0.28)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label (above node)
        ctx.font = '600 7px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = node.threat
          ? `rgba(251,146,60,${nearMouse ? 0.8 : 0.48})`
          : `rgba(245,158,11,${nearMouse ? 0.75 : 0.40})`;
        ctx.fillText(node.label, p.x, p.y - node.r - 5);
      });

      animId = requestAnimationFrame(draw);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    animId = requestAnimationFrame((t) => { lastTime = t; draw(t); });

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
      aria-hidden="true"
    />
  );
}
