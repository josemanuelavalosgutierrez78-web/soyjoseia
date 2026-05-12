/* ═══════════════════════════════════════════
   diagrams.js — Flow canvas animation
   To add a new diagram: add a new canvas in HTML,
   copy this pattern and change NODES/EDGES.
   ═══════════════════════════════════════════ */

const flowC = document.getElementById('flow-canvas');
if (!flowC) { throw new Error('flow-canvas not found — diagrams.js loaded but canvas missing'); }

const fx = flowC.getContext('2d');

function resizeFlow() {
  flowC.width  = flowC.offsetWidth;
  flowC.height = flowC.offsetHeight;
}
resizeFlow();
window.addEventListener('resize', resizeFlow);

/* ─── NODE DEFINITIONS ─── */
// x/y are 0–1 fractions of canvas width/height
const NODES = [
  { label: 'Tarea manual',   sub: 'Repetitiva / lenta',      x: .15, y: .2, accent: true },
  { label: 'IA recibe',      sub: 'Prompt bien hecho',        x: .5,  y: .2 },
  { label: '¿Qué necesitas?',sub: 'Tiempo / dinero / foco',   x: .82, y: .2 },
  { label: 'Automatizar',    sub: 'Flujo sin intervención',   x: .82, y: .6 },
  { label: 'Tú decides',     sub: 'Solo lo importante',       x: .5,  y: .6, accent: true },
  { label: 'Aprender',       sub: 'Iterar y mejorar',         x: .15, y: .6 },
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[2,5],[1,4]];

let flowT = 0, fpk = [];

function drawFlow() {
  // Guard: canvas might be 0 before layout
  if (!flowC.width || !flowC.height) { resizeFlow(); return requestAnimationFrame(drawFlow); }

  fx.clearRect(0, 0, flowC.width, flowC.height);
  flowT += .008;

  // Edges + particle spawn
  EDGES.forEach(([a, b]) => {
    const an = NODES[a], bn = NODES[b];
    const ax = an.x * flowC.width,  ay = an.y * flowC.height;
    const bx = bn.x * flowC.width,  by = bn.y * flowC.height;
    fx.beginPath(); fx.moveTo(ax, ay); fx.lineTo(bx, by);
    fx.strokeStyle = 'rgba(127,255,178,0.12)'; fx.lineWidth = 1; fx.stroke();
    if (Math.random() < .004) fpk.push({ ax, ay, bx, by, t: 0, sp: .015 + Math.random() * .02 });
  });

  // Packets travelling along edges
  fpk = fpk.filter(p => {
    p.t += p.sp; if (p.t > 1) return false;
    const px = p.ax + (p.bx - p.ax) * p.t;
    const py = p.ay + (p.by - p.ay) * p.t;
    fx.beginPath(); fx.arc(px, py, 3, 0, Math.PI * 2);
    fx.fillStyle = `rgba(127,255,178,${.9 * (1 - p.t)})`; fx.fill();
    fx.beginPath(); fx.arc(px, py, 6, 0, Math.PI * 2);
    fx.fillStyle = `rgba(127,255,178,${.15 * (1 - p.t)})`; fx.fill();
    return true;
  });

  // Nodes
  NODES.forEach(n => {
    const x = n.x * flowC.width, y = n.y * flowC.height;
    const pulse = .5 + .5 * Math.sin(flowT * 2 + n.x * 10);
    const r = n.accent ? 6 : 4;
    const gg = fx.createRadialGradient(x, y, 0, x, y, r * 6);
    gg.addColorStop(0, `rgba(127,255,178,${.15 * pulse})`);
    gg.addColorStop(1, 'rgba(127,255,178,0)');
    fx.beginPath(); fx.arc(x, y, r * 6, 0, Math.PI * 2); fx.fillStyle = gg; fx.fill();
    fx.beginPath(); fx.arc(x, y, r, 0, Math.PI * 2);
    fx.fillStyle = n.accent
      ? `rgba(127,255,178,${.7 + .3 * pulse})`
      : `rgba(127,255,178,${.35 + .2 * pulse})`;
    fx.fill();
    // Labels
    fx.font = `500 10px 'DM Sans',sans-serif`;
    fx.fillStyle = 'rgba(240,240,238,.8)';
    fx.textAlign = 'center';
    fx.fillText(n.label, x, y + r + 14);
    fx.font = `300 9px 'DM Sans',sans-serif`;
    fx.fillStyle = 'rgba(240,240,238,.3)';
    fx.fillText(n.sub, x, y + r + 25);
  });

  requestAnimationFrame(drawFlow);
}
drawFlow();
