/* ═══════════════════════════════════════════
   background.js — Ambient canvas effects:
   matrix rain, neural network, dot grid, ripples
   ═══════════════════════════════════════════ */

/* ─── SHARED STATE ─── */
const mouse      = { x: innerWidth / 2, y: innerHeight / 2 };
let   clickWaves = [];   // shared between neural net + dot grid

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
document.addEventListener('click',     e => { clickWaves.push({ x: e.clientX, y: e.clientY, r: 0, life: 1 }); });

/* ══════════ MATRIX RAIN ══════════ */
const matC = document.getElementById('matrix-canvas');
const matX = matC.getContext('2d');
const MCHARS = 'アイウエオカキクケコサシスセソ01234567890110101ABCDEF';
let mW, mH, mCols, mDrops;

function matResize() {
  mW = matC.width = innerWidth;
  mH = matC.height = innerHeight;
  mCols = Math.floor(mW / 22);
  mDrops = Array.from({ length: mCols }, () => Math.random() * -60);
}
matResize();
window.addEventListener('resize', matResize);

function drawMat() {
  matX.fillStyle = 'rgba(16,24,40,0.13)';
  matX.fillRect(0, 0, mW, mH);
  matX.font = '12px monospace';
  mDrops.forEach((d, i) => {
    const ch = MCHARS[Math.floor(Math.random() * MCHARS.length)];
    matX.fillStyle = Math.random() > .97
      ? 'rgba(200,255,230,.5)'
      : `rgba(127,255,178,${Math.random() * .2 + .08})`;
    matX.fillText(ch, i * 22, d * 13);
    if (d * 13 > mH && Math.random() > .975) mDrops[i] = 0;
    else mDrops[i] += .2;
  });
}
setInterval(drawMat, 80);

/* ══════════ NEURAL NETWORK ══════════ */
const bgC = document.getElementById('bg');
const bgX = bgC.getContext('2d');
let W, H, nodes = [], clusters = [], packets = [];
const NODE_COUNT = 60, MAX_DIST = 140, CLUSTER_N = 5;

function resize() { W = bgC.width = innerWidth; H = bgC.height = innerHeight; }
resize();
window.addEventListener('resize', () => { resize(); initNodes(); });

function initNodes() {
  clusters = Array.from({ length: CLUSTER_N }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
    r: Math.random() * 90 + 50,
    str: .0007 + Math.random() * .001
  }));
  nodes = Array.from({ length: NODE_COUNT }, () => {
    const c = clusters[Math.floor(Math.random() * CLUSTER_N)];
    const a = Math.random() * Math.PI * 2, d = Math.random() * c.r;
    return {
      x: (c.x + Math.cos(a) * d + W) % W,
      y: (c.y + Math.sin(a) * d + H) % H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 2 + .7,
      pulse: Math.random() * Math.PI * 2, ps: .01 + Math.random() * .008,
      active: Math.random() > .55, ci: Math.floor(Math.random() * CLUSTER_N),
      comet: Math.random() > .8, trail: [], mt: 8 + Math.floor(Math.random() * 10)
    };
  });
}
initNodes();

function bgDraw() {
  bgX.clearRect(0, 0, W, H);
  const g = bgX.createRadialGradient(W * .5, H * .5, 0, W * .5, H * .5, W * .8);
  g.addColorStop(0, 'rgba(8,12,24,1)'); g.addColorStop(1, 'rgba(2,4,10,1)');
  bgX.fillStyle = g; bgX.fillRect(0, 0, W, H);

  // Move clusters
  clusters.forEach(c => {
    c.x += c.vx; c.y += c.vy;
    if (c.x < -100 || c.x > W + 100) c.vx *= -1;
    if (c.y < -100 || c.y > H + 100) c.vy *= -1;
  });

  // Update nodes
  nodes.forEach(n => {
    const cl = clusters[n.ci];
    const cx = cl.x - n.x, cy = cl.y - n.y, cd = Math.hypot(cx, cy);
    if (cd > 30) { n.vx += cx * cl.str; n.vy += cy * cl.str; }
    const dx = n.x - mouse.x, dy = n.y - mouse.y, dd = Math.hypot(dx, dy);
    if (dd < 130 && dd > 0) { const f = .5 / dd; n.vx += dx * f * .07; n.vy += dy * f * .07; }
    clickWaves.forEach(w => {
      const wx = n.x - w.x, wy = n.y - w.y, wd = Math.hypot(wx, wy), rim = Math.abs(wd - w.r);
      if (rim < 60 && wd > 0) { const f = (1 - rim / 60) * 2 / wd; n.vx += wx * f * .14; n.vy += wy * f * .14; }
    });
    n.vx *= .97; n.vy *= .97;
    if (n.comet) { n.trail.unshift({ x: n.x, y: n.y }); if (n.trail.length > n.mt) n.trail.pop(); }
    n.x += n.vx; n.y += n.vy; n.pulse += n.ps;
    if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
    if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
  });

  // Click waves
  clickWaves = clickWaves.filter(w => {
    w.r += 20; w.life -= .016; if (w.life <= 0) return false;
    bgX.beginPath(); bgX.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    bgX.strokeStyle = `rgba(127,255,178,${w.life * .28})`; bgX.lineWidth = 1.5; bgX.stroke();
    bgX.beginPath(); bgX.arc(w.x, w.y, w.r * .65, 0, Math.PI * 2);
    bgX.strokeStyle = `rgba(127,255,178,${w.life * .12})`; bgX.lineWidth = 3; bgX.stroke();
    return true;
  });

  // Comet trails
  nodes.forEach(n => {
    if (!n.comet || n.trail.length < 2) return;
    bgX.beginPath(); bgX.moveTo(n.trail[0].x, n.trail[0].y);
    for (let t = 1; t < n.trail.length; t++) bgX.lineTo(n.trail[t].x, n.trail[t].y);
    const tg = bgX.createLinearGradient(n.trail[0].x, n.trail[0].y, n.trail[n.trail.length - 1].x, n.trail[n.trail.length - 1].y);
    tg.addColorStop(0, 'rgba(127,255,178,.55)'); tg.addColorStop(1, 'rgba(127,255,178,0)');
    bgX.strokeStyle = tg; bgX.lineWidth = 1.4; bgX.lineCap = 'round'; bgX.stroke();
  });

  // Edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
      if (d < MAX_DIST) {
        const al = (1 - d / MAX_DIST) * .1;
        const md = Math.hypot((a.x + b.x) * .5 - mouse.x, (a.y + b.y) * .5 - mouse.y);
        const boost = md < 200 ? .15 * (1 - md / 200) : 0;
        let wb = 0;
        clickWaves.forEach(w => {
          const wd = Math.hypot((a.x + b.x) * .5 - w.x, (a.y + b.y) * .5 - w.y), rim = Math.abs(wd - w.r);
          if (rim < 80) wb += w.life * .2 * (1 - rim / 80);
        });
        bgX.beginPath(); bgX.moveTo(a.x, a.y); bgX.lineTo(b.x, b.y);
        bgX.strokeStyle = `rgba(127,255,178,${al + boost + wb})`; bgX.lineWidth = .4; bgX.stroke();
        if (Math.random() < .0008) packets.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, sp: .012 + Math.random() * .02 });
      }
    }
  }

  // Packets
  packets = packets.filter(p => {
    p.t += p.sp; if (p.t > 1) return false;
    for (let tt = 0; tt < 5; tt++) {
      const pt = Math.max(0, p.t - tt * .028), tx = p.ax + (p.bx - p.ax) * pt, ty = p.ay + (p.by - p.ay) * pt;
      bgX.beginPath(); bgX.arc(tx, ty, Math.max(.1, 2 - tt * .25), 0, Math.PI * 2);
      bgX.fillStyle = `rgba(127,255,178,${(1 - tt / 5) * .65 * (1 - p.t)})`; bgX.fill();
    }
    bgX.beginPath(); bgX.arc(p.ax + (p.bx - p.ax) * p.t, p.ay + (p.by - p.ay) * p.t, 5, 0, Math.PI * 2);
    bgX.fillStyle = `rgba(127,255,178,${.15 * (1 - p.t)})`; bgX.fill();
    return true;
  });

  // Nodes glow
  nodes.forEach(n => {
    const glow = .5 + .5 * Math.sin(n.pulse);
    let wlit = 0;
    clickWaves.forEach(w => {
      const wd = Math.hypot(n.x - w.x, n.y - w.y), rim = Math.abs(wd - w.r);
      if (rim < 50) wlit += w.life * (1 - rim / 50);
    });
    const gg = bgX.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
    gg.addColorStop(0, `rgba(127,255,178,${(.07 + wlit * .15) * glow})`);
    gg.addColorStop(1, 'rgba(127,255,178,0)');
    bgX.beginPath(); bgX.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2); bgX.fillStyle = gg; bgX.fill();
    bgX.beginPath(); bgX.arc(n.x, n.y, n.r * (1 + .2 * glow + wlit * .3), 0, Math.PI * 2);
    bgX.fillStyle = `rgba(127,255,178,${(n.active ? .6 : .25) * glow + .08 + wlit * .3})`; bgX.fill();
  });

  // Scan line
  const sy = (Date.now() * .04) % H;
  const sg = bgX.createLinearGradient(0, sy - 60, 0, sy + 60);
  sg.addColorStop(0, 'rgba(127,255,178,0)');
  sg.addColorStop(.5, 'rgba(127,255,178,0.012)');
  sg.addColorStop(1, 'rgba(127,255,178,0)');
  bgX.fillStyle = sg; bgX.fillRect(0, sy - 60, W, 120);

  requestAnimationFrame(bgDraw);
}
bgDraw();

/* ══════════ DOT GRID ══════════ */
const dgC = document.getElementById('dotgrid');
const dgX = dgC.getContext('2d');

function dgResize() { dgC.width = innerWidth; dgC.height = innerHeight; }
dgResize();
window.addEventListener('resize', dgResize);

function drawDots() {
  dgX.clearRect(0, 0, dgC.width, dgC.height);
  const sp = 36, cols = Math.ceil(dgC.width / sp) + 2, rows = Math.ceil(dgC.height / sp) + 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = c * sp, oy = r * sp;
      const dx = ox - mouse.x, dy = oy - mouse.y, dist = Math.hypot(dx, dy);
      let nx = ox, ny = oy;
      if (dist < 130 && dist > 0) { const f = (1 - dist / 130) * 13; nx += dx / dist * f; ny += dy / dist * f; }
      let wa = 0;
      clickWaves.forEach(w => {
        const wd = Math.hypot(ox - w.x, oy - w.y), rim = Math.abs(wd - w.r);
        if (rim < 40) {
          wa += w.life * (1 - rim / 40) * .45;
          if (wd > 0) { const wf = w.life * (1 - rim / 40) * 13; nx += ((ox - w.x) / wd) * wf; ny += ((oy - w.y) / wd) * wf; }
        }
      });
      dgX.beginPath(); dgX.arc(nx, ny, 1, 0, Math.PI * 2);
      dgX.fillStyle = `rgba(127,255,178,${Math.min(.07 + wa, .45)})`; dgX.fill();
    }
  }
  requestAnimationFrame(drawDots);
}
drawDots();

/* ══════════ RIPPLE CANVAS ══════════ */
const rpC = document.getElementById('ripple-canvas');
const rpX = rpC.getContext('2d');
let ripples = [];

function rpResize() { rpC.width = innerWidth; rpC.height = innerHeight; }
rpResize();
window.addEventListener('resize', rpResize);

document.addEventListener('mousemove', e => {
  if (Math.random() < .015) ripples.push({ x: e.clientX, y: e.clientY, r: 0, life: 1, sp: .8 + Math.random() * .6 });
});

function drawRipples() {
  rpX.clearRect(0, 0, rpC.width, rpC.height);
  ripples = ripples.filter(rp => {
    rp.r += rp.sp; rp.life -= .05; if (rp.life <= 0) return false;
    rpX.beginPath(); rpX.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    rpX.strokeStyle = `rgba(127,255,178,${rp.life * .03})`; rpX.lineWidth = 1; rpX.stroke();
    return true;
  });
  requestAnimationFrame(drawRipples);
}
drawRipples();
