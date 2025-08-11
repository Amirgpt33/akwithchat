(function () {
  'use strict';

  const html = document.documentElement;
  const themeToggle = document.querySelector('[data-toggle-theme]');
  const mobileToggle = document.querySelector('[data-toggle-mobile]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  // Initialize theme from localStorage
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  // Mobile nav toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Header blur after scroll
  const header = document.querySelector('header[data-header]');
  const headerObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) header?.classList.add('header-blur');
    else header?.classList.remove('header-blur');
  }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 });
  const headerSentinel = document.createElement('div');
  headerSentinel.style.position = 'absolute';
  headerSentinel.style.top = '0';
  headerSentinel.style.height = '1px';
  document.body.prepend(headerSentinel);
  headerObserver.observe(headerSentinel);

  // Scroll reveal
  const revealElements = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.15 });
  revealElements.forEach(el => io.observe(el));

  // Smooth anchor scroll
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    }
  });

  // Simple autoplay slider using scroll-snap
  const slider = document.querySelector('.slider[data-autoplay]');
  if (slider) {
    const delay = Number(slider.getAttribute('data-autoplay')) || 4000;
    let idx = 0;
    const slides = slider.querySelectorAll('.slide');
    const go = () => {
      idx = (idx + 1) % slides.length;
      const left = slides[idx].offsetLeft;
      slider.scrollTo({ left, behavior: 'smooth' });
    };
    let timer = setInterval(go, delay);
    slider.addEventListener('pointerenter', () => clearInterval(timer));
    slider.addEventListener('pointerleave', () => (timer = setInterval(go, delay)));
  }

  // 3D tilt effect
  const tiltCards = document.querySelectorAll('.tilt');
  const constrain = 18;
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * (constrain * 2);
      const rx = -(py - 0.5) * (constrain * 2);
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      card.style.setProperty('--tz', '12px');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--tz', '0px');
    });
  });

  // Parallax hero shapes
  const shapes = document.querySelectorAll('.shape[data-parallax]');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    shapes.forEach((s) => {
      const factor = Number(s.getAttribute('data-parallax')) || 0.2;
      s.style.transform = `translateY(${y * factor}px)`;
    });
  }, { passive: true });

  // FAQ collapsibles
  document.querySelectorAll('[data-collapsible]').forEach((item) => {
    const button = item.querySelector('button');
    const content = item.querySelector('.collapsible-content');
    if (!button || !content) return;
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        content.style.height = content.scrollHeight + 'px';
        requestAnimationFrame(() => { content.style.height = '0px'; });
      } else {
        content.style.height = content.scrollHeight + 'px';
        content.addEventListener('transitionend', function handler() {
          content.style.height = 'auto';
          content.removeEventListener('transitionend', handler);
        });
      }
    });
  });
})();