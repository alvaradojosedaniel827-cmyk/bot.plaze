/* =============================================
   NAVBAR — scroll + hamburger
   ============================================= */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* CAMBIO 6: hamburger usa is-active / is-open */
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  hamburger.classList.toggle('is-active', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* =============================================
   HERO PARTICLES — canvas de partículas doradas
   ============================================= */
(function heroParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = [
    'position:absolute',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:0',
  ].join(';');
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  const COUNT = 60;
  let W = 0, H = 0;
  let particles = [];
  let rafId;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle(fromBottom) {
    return {
      x:     Math.random() * W,
      y:     fromBottom ? H + Math.random() * 40 : Math.random() * H,
      r:     Math.random() * 1.6 + 0.3,
      vy:    Math.random() * 0.35 + 0.08,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.25,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => makeParticle(false));
  }

  function tick() {
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.y -= p.vy;
      p.x += Math.sin(t * 0.6 + p.phase) * 0.28 + p.drift * 0.05;

      const alpha = 0.12 + Math.sin(t * 0.9 + p.phase) * 0.12;

      if (p.y < -8) {
        Object.assign(p, makeParticle(true));
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,169,97,${Math.max(0.03, alpha)})`;
      ctx.fill();
    });

    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else tick();
  });

  window.addEventListener('resize', resize, { passive: true });
  init();
  tick();
})();

/* =============================================
   FONDO VELAS JAPONESAS — hero background
   ============================================= */
(function initCandlestickBg() {
  var canvas = document.getElementById('candlestickBg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var candles = [];
  var candleWidth = 18;
  var candleGap = 8;
  var speed = 0.3;
  var goldColor = '#22C55E';
  var bearColor = '#EF4444';

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function generateCandle(x) {
    var mid = canvas.height * 0.5;
    var range = canvas.height * 0.3;
    var open = mid + (Math.random() - 0.5) * range;
    var close = mid + (Math.random() - 0.5) * range;
    var high = Math.min(open, close) - Math.random() * 40;
    var low = Math.max(open, close) + Math.random() * 40;
    return { x: x, open: open, close: close, high: high, low: low, bull: close < open };
  }

  function init() {
    resize();
    candles = [];
    var count = Math.ceil(canvas.width / (candleWidth + candleGap)) + 5;
    for (var i = 0; i < count; i++) {
      candles.push(generateCandle(i * (candleWidth + candleGap)));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /* grid lines horizontales sutiles */
    ctx.strokeStyle = 'rgba(250, 250, 250, 0.03)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 8]);
    for (var y = canvas.height * 0.2; y < canvas.height * 0.8; y += canvas.height * 0.12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    /* velas */
    candles.forEach(function(c) {
      var color = c.bull ? goldColor : bearColor;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;
      var wickX = c.x + candleWidth / 2;
      ctx.beginPath();
      ctx.moveTo(wickX, c.high);
      ctx.lineTo(wickX, c.low);
      ctx.stroke();
      var bodyTop = Math.min(c.open, c.close);
      var bodyHeight = Math.abs(c.close - c.open) || 1;
      ctx.fillRect(c.x, bodyTop, candleWidth, bodyHeight);
    });
    /* cifras de precio flotantes */
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    candles.forEach(function(c, i) {
      if (i % 10 === 0 && c.x > 0 && c.x < canvas.width - 50) {
        var price = (2650 + Math.random() * 50).toFixed(2);
        ctx.fillStyle = 'rgba(250, 250, 250, 0.06)';
        ctx.fillText(price, c.x - 5, c.close);
      }
    });
    /* degradado horizontal: desvanece en los bordes */
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(10, 14, 23, 0.8)');
    gradient.addColorStop(0.3, 'rgba(10, 14, 23, 0)');
    gradient.addColorStop(0.7, 'rgba(10, 14, 23, 0)');
    gradient.addColorStop(1, 'rgba(10, 14, 23, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* degradado vertical: desvanece en top y bottom */
    var vGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    vGradient.addColorStop(0, 'rgba(10, 14, 23, 0.6)');
    vGradient.addColorStop(0.3, 'rgba(10, 14, 23, 0)');
    vGradient.addColorStop(0.7, 'rgba(10, 14, 23, 0)');
    vGradient.addColorStop(1, 'rgba(10, 14, 23, 0.6)');
    ctx.fillStyle = vGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function animate() {
    candles.forEach(function(c) { c.x -= speed; });
    if (candles.length > 0 && candles[0].x < -candleWidth * 2) {
      candles.shift();
    }
    var last = candles[candles.length - 1];
    if (last && last.x < canvas.width) {
      candles.push(generateCandle(last.x + candleWidth + candleGap));
    }
    draw();
    requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', init);
})();

/* =============================================
   SECTION DIVIDERS — línea animada entre secciones
   ============================================= */
(function injectDividers() {
  const secs = document.querySelectorAll('body > section, body > nav ~ section');
  secs.forEach(sec => {
    const hr = document.createElement('hr');
    hr.className = 'section-divider';
    hr.setAttribute('aria-hidden', 'true');
    sec.after(hr);
  });

  const divObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        divObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.section-divider').forEach(d => divObs.observe(d));
})();

/* =============================================
   SCROLL REVEAL — CAMBIO 1
   Observa elementos con clase .reveal y aplica
   .is-visible al entrar al viewport
   ============================================= */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  revealEls.forEach(el => observer.observe(el));
})();

/* =============================================
   SCROLL PROGRESS BAR — CAMBIO 5
   ============================================= */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  let ticking = false;
  function update() {
    const scrollTop    = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = progress + '%';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

/* =============================================
   CONTADORES ANIMADOS — valores de rentabilidad
   ============================================= */
(function animateCounters() {
  const rangeRe = /^(\d+)%\s*[–\-]\s*(\d+)%/;
  const counterEls = document.querySelectorAll('.rent-value');

  counterEls.forEach(el => {
    const text  = el.textContent.trim();
    const match = text.match(rangeRe);
    if (!match) return;

    const from   = parseInt(match[1], 10);
    const to     = parseInt(match[2], 10);
    const suffix = text.slice(match[0].length);

    el.innerHTML =
      `<span class="cn" data-target="${from}">0</span>` +
      `% &ndash; ` +
      `<span class="cn" data-target="${to}">0</span>%${suffix}`;
    el.dataset.ready = '1';
  });

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounter(span) {
    const target   = parseInt(span.dataset.target, 10);
    const duration = 1400;
    const start    = performance.now();

    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      span.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.dataset.ready) {
        e.target.querySelectorAll('.cn').forEach(runCounter);
        cObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => { if (el.dataset.ready) cObs.observe(el); });
})();

/* =============================================
   ACTIVE NAV LINK — resalta sección visible
   ============================================= */
(function activeNav() {
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a[href^="#"]');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAs.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + entry.target.id;
        a.style.color = isActive ? '#C9A961' : '';
      });
    });
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
})();

/* =============================================
   ESTADÍSTICAS — contadores animados
   ============================================= */
(function statsCounters() {
  const counters = [
    { el: document.getElementById('statClientes'), target: 500, duration: 1800 },
    { el: document.getElementById('statAnios'),    target: 2,   duration: 800  },
    { el: document.getElementById('statBots'),     target: 2,   duration: 800  },
  ].filter(c => c.el);

  if (!counters.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el, target, duration) {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsSection = document.getElementById('estadisticas');
  if (!statsSection) return;

  let fired = false;
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !fired) {
      fired = true;
      counters.forEach(c => animateCounter(c.el, c.target, c.duration));
      obs.disconnect();
    }
  }, { threshold: 0.4 });

  obs.observe(statsSection);
})();

/* =============================================
   FAQ ACCORDION
   ============================================= */
(function faqAccordion() {
  const items = document.querySelectorAll('.faq-btn');

  items.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const body   = btn.nextElementSibling;

      // Cierra todos
      document.querySelectorAll('.faq-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const bd = b.nextElementSibling;
        if (bd) bd.classList.remove('open');
      });

      // Abre el seleccionado si estaba cerrado
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        body.classList.add('open');
        setTimeout(() => {
          const rect = btn.getBoundingClientRect();
          if (rect.top < 90) {
            window.scrollTo({ top: window.scrollY + rect.top - 100, behavior: 'smooth' });
          }
        }, 50);
      }
    });
  });
})();

/* =============================================
   SMOOTH SCROLL — todos los links internos
   ============================================= */
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =============================================
   WHATSAPP FLOTANTE — visible desde el inicio
   ============================================= */
(function waFloat() {
  const btn = document.getElementById('waFloat');
  if (!btn) return;
  btn.classList.add('visible');
})();

/* =============================================
   STICKY CTA BAR — aparece a los 3 segundos en mobile
   ============================================= */
(function stickyBar() {
  const bar      = document.getElementById('stickyBar');
  const closeBtn = document.getElementById('stickyBarClose');
  const waBtn    = document.getElementById('waFloat');
  if (!bar || !closeBtn) return;

  const isMobile = () => window.innerWidth <= 768;
  let dismissed  = false;

  function showBar() {
    if (!isMobile() || dismissed) return;
    bar.classList.add('show');
    if (waBtn) waBtn.classList.add('sticky-active');
  }

  setTimeout(showBar, 3000);

  closeBtn.addEventListener('click', () => {
    dismissed = true;
    bar.classList.remove('show');
    if (waBtn) waBtn.classList.remove('sticky-active');
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) bar.classList.remove('show');
    else if (!dismissed) bar.classList.add('show');
  }, { passive: true });
})();

/* =============================================
   DEMO MODAL — apertura/cierre + pre-selección de bot
   ============================================= */
(function demoModal() {
  const overlay  = document.getElementById('demoModal');
  const closeBtn = document.getElementById('demoModalClose');

  if (!overlay) return;

  function openModal(triggerEl) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;

    /* Pre-selecciona el radio button correspondiente al bot */
    const radios = overlay.querySelectorAll('input[name="bot_interest"]');
    radios.forEach(r => { r.checked = false; });
    if (triggerEl) {
      const preselect = triggerEl.getAttribute('data-preselect-bot');
      if (preselect) {
        const radio = overlay.querySelector(`input[name="bot_interest"][value="${preselect}"]`);
        if (radio) radio.checked = true;
      }
    }

    setTimeout(() => closeBtn && closeBtn.focus(), 100);
  }

  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.demo-open-btn').forEach(btn => {
    btn.addEventListener('click', (e) => openModal(e.currentTarget));
  });

  closeBtn && closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(overlay.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
})();

/* =============================================
   FORMULARIO DEMO — envío a Netlify Function
   ============================================= */
(function demoForm() {
  var form = document.getElementById('demoForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var formName     = document.getElementById('fieldName').value;
    var formEmail    = document.getElementById('fieldEmail').value;
    var formWhatsapp = document.getElementById('fieldWhatsapp').value;
    var formBot      = (document.querySelector('input[name="bot_interest"]:checked') || {}).value || 'no_seleccionado';

    var submitBtn = form.querySelector('[type="submit"]');
    submitBtn.classList.add('is-loading');
    submitBtn.textContent = 'Enviando...';

    fetch('/.netlify/functions/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name:         formName,
        email:        formEmail,
        whatsapp:     formWhatsapp,
        bot_interest: formBot
      })
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log('Respuesta del servidor:', data);
      var isSubpage = window.location.pathname.includes('/bots/');
      window.location.href = isSubpage ? '../gracias.html' : 'gracias.html';
    })
    .catch(function(error) {
      console.error('Error:', error);
      var isSubpage = window.location.pathname.includes('/bots/');
      window.location.href = isSubpage ? '../gracias.html' : 'gracias.html';
    });
  });
})();
