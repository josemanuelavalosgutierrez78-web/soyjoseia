/* ═══════════════════════════════════════════
   nav.js — Smooth scroll, hamburger drawer,
            section tracker (big-num)
   ═══════════════════════════════════════════ */

const scrollRootEl = document.getElementById('scroll-root');

/* ─── SMOOTH SCROLL for all [data-scroll] links ─── */
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
}

document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    scrollToSection(link.dataset.scroll);
  });
});

/* ─── HAMBURGER DRAWER ─── */
const hamburger = document.getElementById('nav-hamburger');
const drawer    = document.getElementById('mobile-drawer');
const drawerBg  = document.getElementById('mobile-drawer-bg');

function openDrawer()  {
  drawer.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  drawer.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  drawer.classList.contains('open') ? closeDrawer() : openDrawer();
});
drawerBg.addEventListener('click', closeDrawer);

// Drawer links — close then scroll
document.querySelectorAll('#mobile-drawer [data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    closeDrawer();
    scrollToSection(link.dataset.scroll);
  });
});

/* ─── BIG-NUM section tracker ─── */
const bigNum      = document.getElementById('big-num');
const sectionNums = { home: '01', servicios: '02', como: '03', casos: '04', contacto: '05' };

window.addEventListener('scroll', function () {
  const scrollTop = window.scrollY;
  let current = 'home';
  ['home', 'servicios', 'como', 'casos', 'contacto'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop - 100 <= scrollTop) current = id;
  });
  if (bigNum) bigNum.textContent = sectionNums[current] || '01';
});

/* ─── SMART FLOATING CTA ─── */
const smartCta    = document.getElementById('smart-cta');
const smartClose  = document.getElementById('smart-close');
const smartInner  = document.getElementById('smart-cta-inner');
let ctaShown = false;

window.addEventListener('scroll', function () {
  if (!ctaShown && window.scrollY > 200) {
    ctaShown = true;
    smartCta.classList.add('show');
  }
});
setTimeout(() => {
  if (!ctaShown) { ctaShown = true; smartCta.classList.add('show'); }
}, 9000);

smartInner.addEventListener('click', e => {
  if (e.target === smartClose || smartClose.contains(e.target)) return;
  scrollToSection('contacto');
});
smartClose.addEventListener('click', e => {
  e.stopPropagation();
  smartCta.classList.remove('show');
});
