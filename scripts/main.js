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


/* ============================================================
   11. I18N — bilingual ZH / EN switcher
   ============================================================ */
(function initI18n() {
  const translations = {
    zh: {
      'nav.home': '首页', 'nav.engine': '核心引擎', 'nav.skills': 'Skill 生态',
      'nav.enterprise': '企业方案', 'nav.hardware': '智能终端', 'nav.about': '关于我们',
      'nav.modelHub': '模型广场', 'nav.bookDemo': '预约演示',
      'hero.badge': 'OpenClaw Engine · Agentic AI · 全球首发',
      'hero.h1a': '跨越屏幕，', 'hero.h1b': '干预现实。',
      'hero.h2': '从思考，到行动。',
      'hero.body': '过去十年，AI 学会了像人一样交谈；现在，PowerMatrix 赋予它改变物理世界的权限。我们的使命，是终结无穷尽的对话框，击穿 AI 与生活的最后 1 厘米——让智慧止于思考，始于执行。',
      'hero.bodyEn': 'From Conversational AI to Agentic Action.',
      'hero.cta1': '驱动 OpenClaw 引擎', 'hero.cta2': '部署数字员工',
      'rev.overline': '核心引擎', 'rev.title': '消息即指令，沟通即执行。',
      'rev.body1': '真正的技术革命，是让交互界面消失。',
      'rev.body2': 'OpenClaw 颠覆了"打开后台、键入 Prompt"的旧石器范式。它潜伏于微信、飞书及您的协作关系中，通过极致的拟人化感知，将跨平台调度简化为一句话的托付。',
      'rev.body3': '这不再是对话。这是', 'rev.auth': '授权', 'rev.body3end': '。',
      'rev.chatTitle': 'OpenClaw 数字助理',
      'rev.msg1': '帮我整理上周所有客户的跟进邮件，并生成一份总结报告，发到群里。',
      'rev.msg2': '收到，正在调用邮件感知、文档智理和飞书推送三项 Skill，预计 40 秒完成…',
      'rev.msgStatus': '任务已闭环 ✓',
      'rev.msg3': '共整理 23 封邮件，报告已推送至《客户周报》群。',
      'rev.h1': '零门槛接入', 'rev.h1b': '告别后台迷宫，微信即中控。无需培训，无需部署经验，开箱即用。',
      'rev.h2': '全时域响应', 'rev.h2b': '7×24h 待命，无界协作。数字员工永不请假，永不疲劳，毫秒级唤醒。',
      'rev.h3': '类人级交互', 'rev.h3b': '如同与最默契的助理共事。理解上下文，记住偏好，主动汇报进度。',
      'skills.overline': 'Skill 生态', 'skills.title': '可生长的数字肌体。',
      'skills.body1': 'OpenClaw 是大脑，Skill 即为其连接万物的神经与肌肉。',
      'skills.body2': '它不是死板的代码插件，而是被蒸馏后的执行基因。通过排列组合 Skill，AI 得以完成跨平台的精密"连招"。',
      'skills.s1name': '全域感知', 'skills.s1desc': '像人一样检索、甄别并抓取全网流动数据。实时监控行业动态、竞品信息与市场信号，信息差永不存在。',
      'skills.s2name': '界面跨越', 'skills.s2desc': '模拟触碰与点击，击穿软件间的数据高墙。从 CRM 到 ERP，任何界面皆可操控，数据孤岛彻底消除。',
      'skills.s3name': '文档智理', 'skills.s3desc': '自动化读写与结构转换，终结机械劳动。Excel、Word、PDF、数据库一键互通，报告自动生成。',
      'skills.s4name': 'GEO 内容营销引擎', 'skills.s4desc': '针对小红书、抖音等平台的生成式引擎优化方案。从关键词策略、爆款选题生成到内容分发执行，一站定制品牌社交搜索占位能力。',
      'skills.tag1': '小红书', 'skills.tag2': '抖音', 'skills.tag3': '搜索占位',
      'skills.geoBadge': '🔥 热门方案上线', 'skills.geoTitle': '小红书 & 抖音 GEO Skill 套件',
      'skills.geoDesc': '流量红利消退，搜索权重崛起。PowerMatrix 推出针对社交平台的生成式引擎优化 (GEO) 专用 Skill。让 AI 理解平台算法，批量生成高权重内容，抢占用户搜索结果第一屏。',
      'skills.geoCta': '查看营销增长方案',
      'ent.overline': '企业方案', 'ent.title': '重构生产力底层逻辑。',
      'ent.body': '我们交付的不是软件，而是属于企业的智能基础设施。通过私有化部署 OpenClaw 与专属 Skill 矩阵，让 AI 从"陪聊"进化为"能干活"的核心资产。',
      'ent.v1title': '业务飞轮自动化', 'ent.v1body': '蒸馏复杂流程，打造永不疲劳、毫秒级响应的数字员工集群。让重复性工作彻底从人类日程中消失。',
      'ent.v2title': '算力与数据主权', 'ent.v2body': '本地化封装部署，数据永不出域，让商业秘密在绝对安全的环境中变现。符合等保、GDPR 及行业合规要求。',
      'ent.v3title': '零边际扩展成本', 'ent.v3body': '一次买断式交付，彻底告别 Token 计费焦虑与持续运维负担。规模扩大 10 倍，成本增量趋近于零。',
      'ent.cta': '获取企业定制方案',
      'hw.overline': '即将上线 · 敬请期待', 'hw.title': '算力，从此以实体的形态进驻现场。',
      'hw.body': '这是 PowerMatrix 首款面向政府与关键行业的 AI 智能终端，它不仅是一台机器，更是您私有域内的',
      'hw.bodyBold': '智能安全边界', 'hw.cta': '获取优先内测资格',
      'hw.body2a': '我们将 OpenClaw 核心引擎、经严格筛选的企业级 Skill 矩阵，以及全球顶尖的开源大模型，完整封装于这台物理设备之中。',
      'hw.body2b': '数据绝不出域，Token 成本归零。',
      'hw.body2c': '无需连接外网，无需上传数据，一切智慧的产生与执行皆在您完全掌控的方寸之间闭环。',
      'uni.overline': '算力生态', 'uni.title': '让前沿算力，触手可及。',
      'uni.body': '顶尖的开源模型不应只是实验室里的标本。OpenClaw 支持灵活的热插拔式换脑，借助 PowerMatrix 的分布式调度，让每个个体与企业都能以极低成本，驾驭全球顶级的模型算力。',
      'uni.tagline': '加入进化，定义您的第一批数字部署。', 'uni.cta': '理解体验最新模型',
      'footer.desc': '企业级 AI Agent 定制化解决方案。基于 OpenClaw 引擎，终结 AI 的对话时代，开启 AI 的物理执行时代。',
      'footer.qrLabel': '扫码添加企业微信', 'footer.qrSub': '咨询企业定制化方案',
    },
    en: {
      'nav.home': 'Home', 'nav.engine': 'Core Engine', 'nav.skills': 'Skill Hub',
      'nav.enterprise': 'Enterprise', 'nav.hardware': 'AI Terminal', 'nav.about': 'About',
      'nav.modelHub': 'Model Hub', 'nav.bookDemo': 'Book a Demo',
      'hero.badge': 'OpenClaw Engine · Agentic AI · Global Launch',
      'hero.h1a': 'Beyond Screens,', 'hero.h1b': 'Into Reality.',
      'hero.h2': 'From Thinking to Acting.',
      'hero.body': 'For a decade, AI learned to talk like humans. Now, PowerMatrix gives it the power to reshape the physical world. Our mission: end the era of endless chat boxes and bridge the last gap between AI and real life — where intelligence stops thinking and starts executing.',
      'hero.bodyEn': 'From Conversational AI to Agentic Action.',
      'hero.cta1': 'Launch OpenClaw Engine', 'hero.cta2': 'Deploy Digital Employees',
      'rev.overline': 'Core Engine', 'rev.title': 'Every Message is a Command.',
      'rev.body1': 'The true tech revolution makes the interface disappear.',
      'rev.body2': 'OpenClaw dismantles the old paradigm of "open a backend, type a prompt." It lives inside WeChat, Feishu, and your collaboration channels — translating complex cross-platform tasks into a single sentence of delegation.',
      'rev.body3': 'This is no longer a conversation. This is ', 'rev.auth': 'authorization', 'rev.body3end': '.',
      'rev.chatTitle': 'OpenClaw Digital Assistant',
      'rev.msg1': 'Summarize all client follow-up emails from last week, generate a report, and post it to the group.',
      'rev.msg2': 'Understood. Invoking Email Perception, Doc Intelligence, and Feishu Push skills. ETA: 40 seconds…',
      'rev.msgStatus': 'Task Complete ✓',
      'rev.msg3': '23 emails processed. Report sent to "Weekly Client Update" group.',
      'rev.h1': 'Zero-Friction Onboarding', 'rev.h1b': 'No backend maze. WeChat is the control center. No training, no DevOps experience needed — works out of the box.',
      'rev.h2': 'Always-On Response', 'rev.h2b': '7×24h standby, boundless collaboration. Digital employees never take leave, never tire, millisecond wake-up.',
      'rev.h3': 'Human-Level Interaction', 'rev.h3b': 'Like working with the most intuitive assistant. Understands context, remembers preferences, proactively reports progress.',
      'skills.overline': 'Skill Hub', 'skills.title': 'A Growing Digital Workforce.',
      'skills.body1': 'OpenClaw is the brain; Skills are the nerves and muscles connecting everything.',
      'skills.body2': 'Not rigid code plugins, but distilled execution genes. Combine Skills to perform precision multi-platform tasks.',
      'skills.s1name': 'Global Perception', 'skills.s1desc': 'Search, filter, and extract data flowing across the entire web — just like a human. Monitor industry trends, competitor intelligence, and market signals in real time.',
      'skills.s2name': 'UI Traversal', 'skills.s2desc': 'Simulate clicks and interactions to break through data silos between applications. From CRM to ERP, any interface is controllable — data islands eliminated.',
      'skills.s3name': 'Doc Intelligence', 'skills.s3desc': 'Automate reading, writing, and structural conversion — ending mechanical labor. Excel, Word, PDF, databases all interconnected. Reports generated automatically.',
      'skills.s4name': 'GEO Content Marketing Engine', 'skills.s4desc': 'Generative Engine Optimization for Xiaohongshu, Douyin, and beyond. From keyword strategy and trending topic generation to content distribution — custom social search domination.',
      'skills.tag1': 'Xiaohongshu', 'skills.tag2': 'Douyin', 'skills.tag3': 'Search Ranking',
      'skills.geoBadge': '🔥 Hot Solution Live', 'skills.geoTitle': 'Xiaohongshu & Douyin GEO Skill Suite',
      'skills.geoDesc': 'Traffic dividends are fading; search weight is rising. PowerMatrix launches GEO Skills for social platforms. Let AI decode platform algorithms, generate high-ranking content at scale, and dominate the first page of results.',
      'skills.geoCta': 'View Growth Marketing Plan',
      'ent.overline': 'Enterprise', 'ent.title': 'Rebuild the Foundation of Productivity.',
      'ent.body': 'We don\'t deliver software — we deliver intelligent infrastructure that belongs to your enterprise. Private deployment of OpenClaw with a custom Skill matrix elevates AI from "chatbot" to core productive asset.',
      'ent.v1title': 'Business Flywheel Automation', 'ent.v1body': 'Distill complex processes into a tireless, millisecond-response digital workforce. Make repetitive work permanently disappear from the human agenda.',
      'ent.v2title': 'Compute & Data Sovereignty', 'ent.v2body': 'Fully local deployment. Data never leaves your domain. Monetize proprietary knowledge in an absolutely secure environment. Compliant with GB/T 22239, GDPR, and industry regulations.',
      'ent.v3title': 'Zero Marginal Scaling Cost', 'ent.v3body': 'One-time delivery model. Eliminate token billing anxiety and ongoing maintenance burden forever. Scale 10x — with near-zero incremental cost.',
      'ent.cta': 'Get Enterprise Plan',
      'hw.overline': 'Coming Soon · Stay Tuned', 'hw.title': 'AI Power, Now in Physical Form.',
      'hw.body': 'PowerMatrix\'s first AI terminal for government and critical industries. Not just a machine — it\'s the ',
      'hw.bodyBold': 'intelligent security perimeter', 'hw.cta': 'Request Early Access',
      'hw.body2a': 'We have fully integrated the OpenClaw core engine, a rigorously curated enterprise Skill matrix, and the world\'s top open-source models into this physical device.',
      'hw.body2b': 'Data never leaves your domain. Token costs drop to zero.',
      'hw.body2c': 'No internet connection required, no data uploads needed — all intelligence is generated and executed within the boundaries you fully control.',
      'uni.overline': 'AI Ecosystem', 'uni.title': 'Frontier AI, Within Reach.',
      'uni.body': 'Top open-source models shouldn\'t be laboratory specimens. OpenClaw supports hot-swappable model upgrades. With PowerMatrix\'s distributed scheduling, every individual and enterprise can harness world-class AI at minimal cost.',
      'uni.tagline': 'Join the evolution. Define your first digital deployment.', 'uni.cta': 'Explore Latest Models',
      'footer.desc': 'Enterprise-grade AI Agent solutions. Powered by OpenClaw — ending the era of conversational AI, opening the era of physical execution.',
      'footer.qrLabel': 'Scan to Connect on WeChat', 'footer.qrSub': 'Inquire about enterprise solutions',
    }
  };

  let currentLang = localStorage.getItem('pm-lang') || 'zh';

  function applyLang(lang) {
    const dict = translations[lang];
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] === undefined) return;
      // Skip elements that contain child elements — let their children translate individually
      if (el.children.length > 0) return;
      el.textContent = dict[key];
    });
    // Update lang switcher active state
    document.querySelectorAll('.lang-opt').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
    // Update coming-soon toast text
    const toastSpan = document.querySelector('.coming-soon-toast span:last-child');
    if (toastSpan) toastSpan.textContent = lang === 'zh' ? '即将上线，敬请期待' : 'Coming Soon — Stay Tuned';
    // Update meta
    document.title = lang === 'zh' ? 'PowerMatrix 官方网站' : 'PowerMatrix — Official Website';
    currentLang = lang;
    localStorage.setItem('pm-lang', lang);
  }

  function switchLang() {
    const next = currentLang === 'zh' ? 'en' : 'zh';
    document.body.classList.add('lang-transitioning');
    setTimeout(() => {
      applyLang(next);
      document.body.classList.remove('lang-transitioning');
    }, 150);
  }

  // Init on load
  applyLang(currentLang);

  // Bind button
  const btn = document.getElementById('lang-switcher');
  if (btn) btn.addEventListener('click', switchLang);
})();
