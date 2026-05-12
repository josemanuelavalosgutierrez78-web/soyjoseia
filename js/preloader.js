/* ═══════════════════════════════════════════
   preloader.js — 2-second progress bar
   ═══════════════════════════════════════════ */

const pre     = document.getElementById('preloader');
const prePct  = document.getElementById('pre-pct');
const PRELOAD_MS = 5000;
const preStart   = Date.now();

function tickPre() {
  const elapsed  = Date.now() - preStart;
  const progress = Math.min(elapsed / PRELOAD_MS, 1);
  // Ease-in-out curve
  const eased = progress < .5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  prePct.textContent = Math.floor(eased * 100) + '%';

  if (progress < 1) {
    requestAnimationFrame(tickPre);
  } else {
    prePct.textContent = '100%';
    setTimeout(() => {
      pre.classList.add('done');
      setTimeout(() => pre.remove(), 500);
    }, 100);
  }
}

requestAnimationFrame(tickPre);
