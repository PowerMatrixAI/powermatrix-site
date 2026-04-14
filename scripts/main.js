/**
 * PowerMatrix — main.js
 * Handles: Canvas particle system, scroll animations, navbar, mobile menu
 */

/* ── Utility ─────────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ============================================================
   1. NAVBAR — scroll & mobile toggle
   ============================================================ */
(function initNavbar() {
  const navbar = $('#navbar');
  const toggle = $('#nav-toggle');
  const menu   = $('#nav-menu');

  // Scroll detection
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Close on link click
  $$('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle?.classList.remove('active');
    });
  });
})();


/* ============================================================
   2. HERO CANVAS — flowing particle network
   ============================================================ */
(function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], connections = [], animId;

  const CONFIG = {
    particleCount: 80,
    connectionDist: 120,
    particleColor: 'rgba(0, 232, 122,',
    lineColor: 'rgba(0, 232, 122,',
    speed: 0.3,
    particleRadius: 1.5,
    flowNodes: 8,    // brighter "flow" nodes
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor(isFlow = false) {
      this.isFlow = isFlow;
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * CONFIG.speed * (this.isFlow ? 1.8 : 1);
      this.vy = (Math.random() - 0.5) * CONFIG.speed * (this.isFlow ? 1.8 : 1);
      this.alpha = this.isFlow ? 0.8 : (0.2 + Math.random() * 0.4);
      this.r = this.isFlow
        ? (2 + Math.random() * 2)
        : (0.5 + Math.random() * CONFIG.particleRadius);
      this.pulse = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.03;

      // Wrap around
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      const breathe = this.isFlow ? (0.6 + 0.4 * Math.sin(this.pulse)) : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * breathe, 0, Math.PI * 2);
      ctx.fillStyle = `${CONFIG.particleColor}${this.alpha * breathe})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle(i < CONFIG.flowNodes));
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDist) {
          const alpha = (1 - dist / CONFIG.connectionDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `${CONFIG.lineColor}${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // Radial gradient overlay to focus center
  function drawGradientOverlay() {
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.55);
    grd.addColorStop(0, 'rgba(7,9,14,0)');
    grd.addColorStop(0.6, 'rgba(7,9,14,0)');
    grd.addColorStop(1, 'rgba(7,9,14,0.85)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  let t = 0;
  function animate() {
    animId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);

    // Base dark fill
    ctx.fillStyle = 'rgba(7,9,14,0.05)';
    ctx.fillRect(0, 0, W, H);

    drawConnections();
    particles.forEach(p => { p.update(t); p.draw(); });
    drawGradientOverlay();
    t++;
  }

  const ro = new ResizeObserver(() => { resize(); init(); });
  ro.observe(canvas.parentElement);
  resize();
  init();
  animate();
})();


/* ============================================================
   3. INTERSECTION OBSERVER — entrance animations
   ============================================================ */
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve stagger parents so children cascade
        if (!entry.target.classList.contains('stagger')) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  $$('.fade-up, .fade-in, .stagger').forEach(el => observer.observe(el));
})();


/* ============================================================
   4. TYPEWRITER effect for hero subtitle
   ============================================================ */
(function initTypewriter() {
  const el = $('#hero-typewriter');
  if (!el) return;

  const text = el.textContent.trim();
  el.textContent = '';
  el.style.opacity = '1';

  let i = 0;
  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 40 + Math.random() * 20);
    }
  }

  // Start after page load delay
  setTimeout(type, 800);
})();


/* ============================================================
   5. REVOLUTION SECTION — chat message animated appearance
   ============================================================ */
(function initChatAnimation() {
  const chatBody = $('#wechat-body');
  if (!chatBody) return;

  const msgs = $$('.msg-row');
  msgs.forEach((m, i) => {
    m.style.opacity = '0';
    m.style.transform = 'translateY(12px)';
    m.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const chatObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      msgs.forEach((m, i) => {
        setTimeout(() => {
          m.style.opacity = '1';
          m.style.transform = 'translateY(0)';
        }, i * 400);
      });
      chatObserver.disconnect();
    }
  }, { threshold: 0.4 });

  chatObserver.observe(chatBody);
})();


/* ============================================================
   6. COUNTER animation for numeric elements
   ============================================================ */
(function initCounters() {
  $$('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 16);
    }, { threshold: 0.5 });
    obs.observe(el);
  });
})();


/* ============================================================
   7. SKILL CARDS — subtle cursor glow effect
   ============================================================ */
(function initCardGlow() {
  $$('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--gx', `${x}%`);
      card.style.setProperty('--gy', `${y}%`);
    });
  });
})();


/* ============================================================
   8. SMOOTH REVEAL for hardware device
   ============================================================ */
(function initHardwareReveal() {
  const hw = $('#hardware');
  if (!hw) return;

  const device = hw.querySelector('.device-body');
  if (!device) return;

  const hwObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(() => {
        device.style.transition = 'box-shadow 2s ease, border-color 2s ease';
        device.style.borderColor = 'rgba(0, 232, 122, 0.2)';
      }, 600);
      hwObs.disconnect();
    }
  }, { threshold: 0.3 });

  hwObs.observe(hw);
})();


/* ============================================================
   9. CTA hover ripple effect
   ============================================================ */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-primary');
  if (!btn) return;

  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${e.clientX - rect.left - size / 2}px;
    top: ${e.clientY - rect.top - size / 2}px;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-anim 0.6s ease-out forwards;
    pointer-events: none;
    z-index: 10;
  `;
  btn.style.position = 'relative';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// Inject ripple keyframe
const rStyle = document.createElement('style');
rStyle.textContent = `
  @keyframes ripple-anim {
    to { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(rStyle);


/* ============================================================
   10. COMING SOON TOAST — for data-coming-soon buttons
   ============================================================ */
(function initComingSoonToast() {
  // Create toast element once
  const toast = document.createElement('div');
  toast.className = 'coming-soon-toast';
  toast.innerHTML = `
    <span class="coming-soon-toast-icon">⏳</span>
    <span>即将上线，敬请期待</span>
  `;
  document.body.appendChild(toast);

  let hideTimer = null;

  function showToast() {
    clearTimeout(hideTimer);
    toast.classList.add('show');
    hideTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // Delegate click on all [data-coming-soon] elements
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-coming-soon]');
    if (btn) {
      e.preventDefault();
      showToast();
    }
  });
})();
