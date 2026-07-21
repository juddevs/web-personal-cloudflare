/* ============================================================
   JUDDEVS — Main JavaScript
   ============================================================
   Modules:
   1. Navbar scroll behaviour
   2. Mobile hamburger menu
   3. Scroll-triggered reveal animations (IntersectionObserver)
   4. Animated counters
   5. Dynamic footer year
   6. Smooth scroll offset (for fixed navbar)
   7. Cursor glow effect (desktop)
   ============================================================ */

'use strict';

/* ── 1. Navbar Scroll Behaviour ─────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ── 2. Mobile Hamburger Menu ───────────────────────────────── */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');
  if (!hamburger || !navMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on nav link click
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();


/* ── 3. Scroll-triggered Reveal Animations ──────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length || !('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el) { observer.observe(el); });
})();


/* ── 4. Animated Counters ───────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  /**
   * Eases a value using an ease-out cubic curve.
   * @param {number} t - progress 0..1
   * @returns {number}
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Animates a single counter element.
   * @param {HTMLElement} el
   */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '%';
    const prefix   = el.dataset.prefix || '';
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const value    = Math.round(eased * target);

      el.textContent = prefix + value + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { observer.observe(el); });
})();


/* ── 5. Dynamic Footer Year ─────────────────────────────────── */
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();


/* ── 6. Smooth Scroll Offset for Fixed Navbar ───────────────── */
(function initSmoothScroll() {
  const navbar = document.getElementById('navbar');

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = navbar ? navbar.offsetHeight : 80;
      const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();


/* ── 7. Cursor Glow Effect (Desktop only) ───────────────────── */
(function initCursorGlow() {
  // Only on devices with a fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const glow = document.createElement('div');
  glow.setAttribute('aria-hidden', 'true');
  Object.assign(glow.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '360px',
    height:        '360px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
    transform:     'translate(-50%, -50%)',
    zIndex:        '9999',
    transition:    'opacity 0.3s ease',
    opacity:       '0',
  });
  document.body.appendChild(glow);

  let mouseX = 0;
  let mouseY = 0;
  let glowX  = 0;
  let glowY  = 0;
  let raf    = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    glowX = lerp(glowX, mouseX, 0.1);
    glowY = lerp(glowY, mouseY, 0.1);
    glow.style.transform = 'translate(' + (glowX - 180) + 'px,' + (glowY - 180) + 'px)';
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    glow.style.opacity = '0';
  });
})();


/* ── 8. Service Card Tilt Effect (Desktop) ──────────────────── */
(function initCardTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cards = document.querySelectorAll('.service-card');
  const MAX_TILT = 6; // degrees

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect   = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const rotateY = ((e.clientX - centerX) / (rect.width  / 2)) * MAX_TILT;
      const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * MAX_TILT;

      card.style.transform = [
        'translateY(-8px)',
        'perspective(800px)',
        'rotateX(' + rotateX + 'deg)',
        'rotateY(' + rotateY + 'deg)',
      ].join(' ');
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s, border-color 0.3s';
    });
  });
})();
