/**
 * AKJ Electric - Main JavaScript
 * Features: Scroll progress, navbar, animations, counter, mobile menu,
 *           project filter, project modal, contact form validation, back-to-top
 */

/* =============================================
   SCROLL PROGRESS INDICATOR
   ============================================= */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / total) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* =============================================
   NAVBAR — sticky + color change on scroll
   ============================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const isTransparent = navbar.hasAttribute('data-transparent');
  const logoImg = document.querySelector('.nav-logo-img');
  const navLinks = document.querySelectorAll('.nav-link');
  const menuBtn = document.getElementById('menu-btn');

  // Only toggle scroll-based colors on transparent (homepage) navbar
  if (isTransparent) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
        navLinks.forEach(l => { l.style.color = '#111827'; });
        if (logoImg) logoImg.style.filter = '';
        if (menuBtn && !document.getElementById('mobile-menu')?.classList.contains('open')) {
          menuBtn.style.color = '#181f6f';
        }
      } else {
        navbar.classList.remove('scrolled');
        navLinks.forEach(l => { l.style.color = 'white'; });
        if (logoImg) logoImg.style.filter = '';
        if (menuBtn && !document.getElementById('mobile-menu')?.classList.contains('open')) {
          menuBtn.style.color = 'white';
        }
      }
    }, { passive: true });
  }

  // Set active link based on current page
  const path = window.location.pathname;
  navLinks.forEach(link => {
    if (link.getAttribute('href') === path.split('/').pop() || 
        (path.endsWith('/') && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* =============================================
   MOBILE MENU
   ============================================= */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  if (!menuBtn || !mobileMenu) return;

  // SVG icons for toggle
  const hamburgerSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
  const closeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  let isOpen = false;

  function openMobileMenu() {
    isOpen = true;
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('mobile-menu-open');
    menuBtn.innerHTML = closeSVG;
  }

  function closeMobileMenu() {
    isOpen = false;
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-open');
    menuBtn.innerHTML = hamburgerSVG;
  }

  menuBtn.addEventListener('click', () => {
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  });

  closeBtn?.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
}

/* =============================================
   SCROLL ANIMATIONS — Intersection Observer
   ============================================= */
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('.fade-up, .fade-in');
  if (!animatedEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  animatedEls.forEach(el => observer.observe(el));
}

/* =============================================
   ANIMATED STATS COUNTER
   ============================================= */
function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const isDecimal = target % 1 !== 0;
  
  function update(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target * (isDecimal ? 10 : 1)) / (isDecimal ? 10 : 1);
    el.textContent = isDecimal ? current.toFixed(1) : current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseFloat(entry.target.dataset.count);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* =============================================
   BACK TO TOP BUTTON
   ============================================= */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   HERO PARALLAX (subtle)
   ============================================= */
function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.15}px)`;
    }
  }, { passive: true });

  // Trigger hero loaded class for entrance animation
  setTimeout(() => {
    document.querySelector('.hero-section')?.classList.add('loaded');
  }, 100);
}

/* =============================================
   PROJECT FILTER SYSTEM
   ============================================= */
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card-wrapper');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.style.display = 'block';
          // Stagger animation
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 60);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // Add transition styles to project card wrappers
  projectCards.forEach(card => {
    card.style.transition = 'opacity .3s ease, transform .3s ease';
  });
}

/* =============================================
   PROJECT MODAL
   ============================================= */
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  if (!modal) return;

  // Open modal on card click
  document.querySelectorAll('[data-project]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const data = JSON.parse(trigger.dataset.project);
      populateModal(data);
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  modalClose?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function populateModal(data) {
  document.getElementById('modal-img').src = data.img;
  document.getElementById('modal-img').alt = data.title;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-category').textContent = data.category;
  document.getElementById('modal-location').textContent = data.location || '';
  document.getElementById('modal-desc').textContent = data.description;
  const tagContainer = document.getElementById('modal-tags');
  if (tagContainer && data.tags) {
    tagContainer.innerHTML = '';
    data.tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800';
      span.textContent = t; // textContent prevents XSS
      tagContainer.appendChild(span);
    });
  }
}

/* =============================================
   CONTACT FORM VALIDATION
   ============================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.contact-input').forEach(input => {
      input.classList.remove('error');
    });

    // Validate each field
    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const phone   = form.querySelector('#phone');
    const message = form.querySelector('#message');
    const agree   = form.querySelector('#agree');

    if (!name?.value.trim() || name.value.trim().length < 2) {
      name?.classList.add('error'); valid = false;
    }
    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email?.classList.add('error'); valid = false;
    }
    if (phone?.value && !/^[\d\s+\-().]{7,}$/.test(phone.value)) {
      phone?.classList.add('error'); valid = false;
    }
    if (!message?.value.trim() || message.value.trim().length < 10) {
      message?.classList.add('error'); valid = false;
    }
    if (agree && !agree.checked) {
      agree.closest('div')?.classList.add('opacity-60');
      valid = false;
    } else {
      agree?.closest('div')?.classList.remove('opacity-60');
    }

    if (valid) {
      const submitBtn = form.querySelector('#submit-btn');
      const errorBanner = form.querySelector('#form-error');

      submitBtn.innerHTML = '<svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Sending...';
      submitBtn.disabled = true;
      if (errorBanner) errorBanner.classList.add('hidden');

      const formData = new FormData(form);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            form.style.display = 'none';
            if (successMsg) successMsg.style.display = 'flex';
            if (typeof lucide !== 'undefined') lucide.createIcons();
          } else {
            throw new Error(data.message || 'Submission failed');
          }
        })
        .catch(() => {
          if (errorBanner) errorBanner.classList.remove('hidden');
          submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Send Message & Get Free Quote';
          submitBtn.disabled = false;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }
  });
}

/* =============================================
   HERO VIDEO/IMAGE LOAD
   ============================================= */
function initHeroLoad() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  setTimeout(() => hero.classList.add('loaded'), 200);
}

/* =============================================
   SMOOTH ANCHOR LINKS
   ============================================= */
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* =============================================
   LIGHTBOX FOR IMAGES
   ============================================= */
function initLightbox() {
  const lightboxEl = document.getElementById('lightbox');
  if (!lightboxEl) return;

  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxEl.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightboxEl.classList.remove('open');
    document.body.style.overflow = '';
  }
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', (e) => { if (e.target === lightboxEl) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

/* =============================================
   INIT ALL
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCounters();
  initBackToTop();
  initHeroParallax();
  initProjectFilter();
  initProjectModal();
  initContactForm();
  initHeroLoad();
  initSmoothLinks();
  initLightbox();
});
