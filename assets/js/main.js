/* Main JS for Driving School site */
(function () {
  const select = (q, root = document) => root.querySelector(q);
  const selectAll = (q, root = document) => Array.from(root.querySelectorAll(q));

  // Mobile nav toggle
  function setupMobileNav() {
    const menuBtn = select('[data-menu-toggle]');
    const nav = select('[data-mobile-nav]');
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
      const isOpen = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!isOpen));
      nav.classList.toggle('translate-x-full');
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
      document.body.classList.toggle('overflow-hidden', !isOpen);
    });

    selectAll('[data-close-nav]').forEach((btn) =>
      btn.addEventListener('click', () => {
        nav.setAttribute('data-open', 'false');
        nav.classList.add('translate-x-full');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('overflow-hidden');
      })
    );
  }

  // Scroll reveal
  function setupScrollReveal() {
    const items = selectAll('[data-animate]');
    if (!items.length) return;

    items.forEach((el) => el.classList.add('reveal'));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('animate-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    items.forEach((el) => io.observe(el));
  }

  // Parallax hero backgrounds
  function setupParallax() {
    const sections = selectAll('[data-parallax]');
    if (!sections.length) return;

    function update() {
      const scrollY = window.scrollY;
      sections.forEach((sec) => {
        const speed = parseFloat(sec.getAttribute('data-parallax')) || 0.4;
        const offset = Math.round(scrollY * speed);
        sec.style.backgroundPosition = `center calc(50% + ${offset}px)`;
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  // Simple carousel with autoplay
  function setupCarousel() {
    const carousels = selectAll('[data-carousel]');
    carousels.forEach((carousel) => {
      const track = select('[data-carousel-track]', carousel);
      const slides = selectAll('[data-slide]', carousel);
      const nextBtn = select('[data-next]', carousel);
      const prevBtn = select('[data-prev]', carousel);
      const dotsContainer = select('[data-dots]', carousel);
      if (!track || !slides.length) return;

      let index = 0;
      let autoPlayTimer = null;

      function goTo(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        updateDots();
      }

      function next() { goTo(index + 1); }
      function prev() { goTo(index - 1); }

      function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(next, 4500);
      }
      function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
      }

      function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
          const btn = document.createElement('button');
          btn.className = `h-2 w-2 rounded-full ${i === index ? 'bg-green-500' : 'bg-gray-400/60 dark:bg-gray-500/60'}`;
          btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
          btn.addEventListener('click', () => goTo(i));
          dotsContainer.appendChild(btn);
        });
      }

      nextBtn && nextBtn.addEventListener('click', next);
      prevBtn && prevBtn.addEventListener('click', prev);

      carousel.addEventListener('mouseenter', stopAutoPlay);
      carousel.addEventListener('mouseleave', startAutoPlay);

      goTo(0);
      startAutoPlay();
    });
  }

  // FAQ accordion
  function setupAccordion() {
    selectAll('[data-accordion] [data-acc-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('[data-acc-item]');
        const panel = item.querySelector('[data-acc-panel]');
        const open = item.getAttribute('data-open') === 'true';
        item.setAttribute('data-open', String(!open));
        panel.style.maxHeight = !open ? panel.scrollHeight + 'px' : '0px';
      });
    });

    // Initialize heights
    selectAll('[data-accordion] [data-acc-item]').forEach((item) => {
      const panel = item.querySelector('[data-acc-panel]');
      const open = item.getAttribute('data-open') === 'true';
      panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
    });
  }

  // Form validation
  function setupForm() {
    const form = select('#contact-form');
    if (!form) return;
    const status = select('#form-status');

    function setStatus(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.className = ok
        ? 'mt-3 text-sm text-green-600'
        : 'mt-3 text-sm text-red-600';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const phone = String(formData.get('phone') || '').trim();
      const date = String(formData.get('date') || '').trim();
      const course = String(formData.get('course') || '').trim();

      // Basic validation
      const errors = [];
      if (name.length < 2) errors.push('Name must be at least 2 characters.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Enter a valid email.');
      if (!/^\+?[0-9\-\s]{7,}$/.test(phone)) errors.push('Enter a valid phone number.');
      if (!date) errors.push('Please choose a preferred date.');
      if (!course) errors.push('Please select a course.');

      if (errors.length) {
        setStatus(errors[0], false);
        return;
      }

      // Fake submit
      try {
        setStatus('Submitting...', true);
        await new Promise((r) => setTimeout(r, 900));
        setStatus('Thanks! We will contact you shortly to confirm your lesson.', true);
        form.reset();
      } catch (err) {
        setStatus('Something went wrong. Please try again later.', false);
      }
    });
  }

  // Dark mode toggle and persistence
  function setupTheme() {
    const toggle = select('[data-theme-toggle]');
    const root = document.documentElement;

    function apply(mode) {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Initialize from localStorage or prefers-color-scheme
    const stored = localStorage.getItem('theme');
    if (stored) {
      apply(stored);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      apply('dark');
    }

    toggle && toggle.addEventListener('click', () => {
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    setupMobileNav();
    setupScrollReveal();
    setupParallax();
    setupCarousel();
    setupAccordion();
    setupForm();
  });
})();