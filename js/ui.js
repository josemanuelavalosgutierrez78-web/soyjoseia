/* ═══════════════════════════════════════════
   ui.js — Scroll reveal, HUD counters, toast,
           scramble/glitch, 3D tilt, carousel dots
   ═══════════════════════════════════════════ */



/* ─── SCROLL REVEAL — uses window scroll (body scrolls now) ─── */
const revealEls = document.querySelectorAll('.reveal');

function checkReveal() {
  revealEls.forEach(el => {
    if (el.classList.contains('visible')) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.93) el.classList.add('visible');
  });
}
window.addEventListener('scroll', checkReveal, { passive: true });
setTimeout(checkReveal, 200);
setTimeout(checkReveal, 800);
setTimeout(checkReveal, 2600);

/* ─── COUNT-UP ON SCROLL ─── */
const countEls = document.querySelectorAll('.count-up');
function checkCountUp() {
  countEls.forEach(el => {
    if (el.dataset.done) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      el.dataset.done = '1';
      const target = +el.dataset.target, suffix = el.dataset.suffix || '';
      let cur = 0;
      const dur = 1600, step = 16, inc = target / (dur / step);
      const t = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Math.floor(cur) + suffix;
        if (cur >= target) clearInterval(t);
      }, step);
    }
  });
}
window.addEventListener('scroll', checkCountUp, { passive: true });



/* ─── TEXT SCRAMBLE ─── */
const SC = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scramble(el, txt, dur = 900, delay = 0) {
  setTimeout(() => {
    let f = 0;
    const tot = Math.floor(dur / 30);
    const t = setInterval(() => {
      const p = f / tot;
      let o = '';
      for (let i = 0; i < txt.length; i++)
        o += i < Math.floor(p * txt.length) ? txt[i] : SC[Math.floor(Math.random() * SC.length)];
      el.textContent = o;
      if (++f > tot) { el.textContent = txt; clearInterval(t); }
    }, 30);
  }, delay);
}

/* ─── GLITCH ─── */
function glitch(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('glitching');
  setTimeout(() => el.classList.remove('glitching'), 550);
}

/* ─── TRIGGER AFTER PRELOADER (2s) ─── */
setTimeout(() => {
  scramble(document.getElementById('scramble-main'), 'IA real', 700, 0);
  setTimeout(() => { glitch('g1'); glitch('g2'); }, 200);
  setTimeout(() => glitch('g3'), 600);
}, 2100);

/* ─── 3D TILT (hero block) ─── */
const tiltP = document.getElementById('tilt-block');
const tiltI = document.getElementById('tilt-inner');
if (tiltP && tiltI) {
  tiltP.addEventListener('mousemove', e => {
    const r  = tiltP.getBoundingClientRect();
    const rx = (e.clientY - r.top  - r.height / 2) / r.height * -8;
    const ry = (e.clientX - r.left - r.width  / 2) / r.width  *  8;
    tiltI.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  tiltP.addEventListener('mouseleave', () => { tiltI.style.transform = 'rotateX(0) rotateY(0)'; });
}

/* ─── CAROUSEL DOTS ─── */
const casesScroll = document.getElementById('cases-scroll');
const casesDots   = document.querySelectorAll('.cases-dot');
const caseCards   = document.querySelectorAll('.case-card');

if (casesScroll && casesDots.length) {
  casesDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const card = caseCards[i];
      if (card) casesScroll.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' });
    });
  });
  casesScroll.addEventListener('scroll', () => {
    const cardWidth = caseCards[0] ? caseCards[0].offsetWidth + 20 : 360;
    const activeIdx = Math.round(casesScroll.scrollLeft / cardWidth);
    casesDots.forEach((dot, i) => dot.classList.toggle('active', i === activeIdx));
  });
}
