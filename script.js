const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STICKY_NAV_OFFSET = 10;
const BACK_TO_TOP_SHOW = 500;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

document.addEventListener('DOMContentLoaded', function () {
  const scrollProgress = document.querySelector('.scroll-progress');
  const backToTopBtn = document.querySelector('.back-to-top');
  const nav = document.querySelector('nav');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (scrollProgress && !prefersReducedMotion) {
    scrollProgress.style.transition = 'width 0.1s linear';
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const innerHeight = window.innerHeight;

        if (scrollProgress) {
          const progress = scrollHeight > innerHeight
            ? (scrollTop / (scrollHeight - innerHeight)) * 100
            : 0;
          scrollProgress.style.width = progress + '%';
        }

        if (backToTopBtn) {
          if (scrollTop > BACK_TO_TOP_SHOW) {
            backToTopBtn.classList.add('show');
          } else {
            backToTopBtn.classList.remove('show');
          }
        }

        if (nav) {
          if (scrollTop > STICKY_NAV_OFFSET) {
            nav.classList.add('nav-scrolled');
          } else {
            nav.classList.remove('nav-scrolled');
          }
        }

        document.querySelectorAll('.process-section').forEach(function (section) {
          const line = section.querySelector('.process-line');
          if (!line) return;
          const rect = section.getBoundingClientRect();
          const height = rect.height;
          const bottom = rect.bottom;
          const percentVisible = clamp(0, (bottom - innerHeight / 2) / height, 1);
          const isHorizontal = section.classList.contains('process-horizontal') ||
            (line.offsetWidth >= line.offsetHeight && line.offsetHeight < 20);
          if (isHorizontal) {
            line.style.width = (percentVisible * 100) + '%';
          } else {
            line.style.height = (percentVisible * 100) + '%';
          }
        });

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(function (el) {
      if (prefersReducedMotion) {
        el.classList.add('visible');
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  function animateCounter(el, target, duration) {
    duration = duration || 1600;
    const suffix = el.dataset.suffix || '';
    const formatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * target);
      el.textContent = formatter.format(current) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const counterEls = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10) || 0;
          const suffix = el.dataset.suffix || '';
          const formatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
          if (prefersReducedMotion) {
            el.textContent = formatter.format(target) + suffix;
          } else {
            animateCounter(el, target);
          }
          counterObserver.unobserve(el);
        }
      });
    }, {
      threshold: 0.5
    });

    counterEls.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counterEls.forEach(function (el) {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const formatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
      el.textContent = formatter.format(target) + suffix;
    });
  }

  if (hamburgerBtn && mobileMenu) {
    function openMenu() {
      mobileMenu.classList.add('open');
      hamburgerBtn.classList.add('open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
      mobileMenu.classList.remove('open');
      hamburgerBtn.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }

    hamburgerBtn.addEventListener('click', function () {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', function (e) {
      if (!mobileMenu.classList.contains('open')) return;
      if (e.target.closest('.mobile-menu')) return;
      if (e.target.closest('.hamburger-btn')) return;
      closeMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const rect = target.getBoundingClientRect();
      const top = rect.top + window.scrollY - navHeight - 12;
      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  const stepEls = document.querySelectorAll('.step');
  if ('IntersectionObserver' in window && stepEls.length) {
    const stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('step-visible');
          stepObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    stepEls.forEach(function (el) {
      if (prefersReducedMotion) {
        el.classList.add('step-visible');
      } else {
        stepObserver.observe(el);
      }
    });
  } else {
    stepEls.forEach(function (el) {
      el.classList.add('step-visible');
    });
  }

  document.addEventListener('click', function (e) {
    const faqQ = e.target.closest('.faq-q');
    if (faqQ) {
      const wrapper = faqQ.closest('.faq-item, .faq');
      const answer = faqQ.nextElementSibling;
      if (wrapper) wrapper.classList.toggle('open');
      if (answer && (answer.classList.contains('faq-a') || answer.tagName === 'DIV')) {
        if (answer.style.maxHeight) {
          answer.style.maxHeight = null;
        } else {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
      return;
    }

    const toggle = e.target.closest('.transparency-toggle');
    if (toggle) {
      const wrapper = toggle.closest('.transparency-item, .transparency');
      const details = toggle.parentElement.querySelector('.transparency-details') ||
        toggle.nextElementSibling;
      if (wrapper) wrapper.classList.toggle('open');
      if (details) {
        if (details.style.maxHeight) {
          details.style.maxHeight = null;
        } else {
          details.style.maxHeight = details.scrollHeight + 'px';
        }
      }
      return;
    }

    const preset = e.target.closest('.donate-preset, [data-amount]');
    if (preset) {
      const amount = preset.dataset.amount || preset.getAttribute('data-amount');
      if (amount == null) return;
      const form = preset.closest('form, .donate-form, #donate');
      if (!form) return;
      const customField = form.querySelector('.custom-amount, [name="amount"], [data-amount-field]');
      if (customField) {
        customField.value = amount;
      }
      form.querySelectorAll('.donate-preset, [data-amount]').forEach(function (btn) {
        btn.classList.remove('active');
      });
      preset.classList.add('active');
    }
  });

  document.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Demo form — connect your backend/Firebase before production use.');
    });
  });
});
