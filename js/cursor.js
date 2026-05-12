/* ═══════════════════════════════════════════
   cursor.js — Custom cursor + magnetic effect
   ═══════════════════════════════════════════ */

const cur      = document.getElementById('cur');
const ring     = document.getElementById('ring');
const curLabel = document.getElementById('cur-label');

let mx = innerWidth / 2, my = innerHeight / 2;
let rx = mx, ry = my;

// Cursor follows mouse exactly
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left      = mx + 'px';
  cur.style.top       = my + 'px';
  curLabel.style.left = mx + 'px';
  curLabel.style.top  = my + 'px';
});

// Ring lags behind with lerp
(function animRing() {
  rx += (mx - rx) * .1;
  ry += (my - ry) * .1;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

// Cursor label on data-cursor elements
document.querySelectorAll('[data-cursor]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.body.classList.add('cur-hover');
    curLabel.textContent = el.dataset.cursor;
  });
  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('cur-hover');
    curLabel.textContent = '';
  });
});

// Magnetic buttons
document.querySelectorAll('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r  = el.getBoundingClientRect();
    const dx = e.clientX - r.left - r.width  / 2;
    const dy = e.clientY - r.top  - r.height / 2;
    el.style.transform  = `translate(${dx * .28}px, ${dy * .32}px)`;
    el.style.transition = 'transform .08s';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform  = '';
    el.style.transition = 'transform .5s cubic-bezier(.25,1,.5,1)';
  });
});
