/* =========================================================
   Jeram Kraskens — Portfolio interactions
   All motion respects prefers-reduced-motion.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;

  /* ---------------------------------------------------------
     1. Preloader
     --------------------------------------------------------- */
  var loader = $('#loader');
  var fill = $('#loaderFill');
  var pct = $('#loaderPct');
  var progress = 0;

  document.body.classList.add('is-loading');

  function finishLoad() {
    if (fill) fill.style.width = '100%';
    if (pct) pct.textContent = '100%';
    setTimeout(function () {
      if (loader) loader.classList.add('done');
      document.body.classList.remove('is-loading');
      document.body.classList.add('ready');
      startTyping();
    }, reduced ? 0 : 320);
  }

  if (reduced) {
    finishLoad();
  } else {
    var tick = setInterval(function () {
      progress += Math.random() * 16 + 6;
      if (progress >= 96) progress = 96;
      if (fill) fill.style.width = progress + '%';
      if (pct) pct.textContent = Math.floor(progress) + '%';
    }, 120);

    window.addEventListener('load', function () { clearInterval(tick); finishLoad(); });
    setTimeout(function () {
      if (document.body.classList.contains('is-loading')) { clearInterval(tick); finishLoad(); }
    }, 3500);
  }

  /* ---------------------------------------------------------
     2. Typewriter role line
     --------------------------------------------------------- */
  var roles = [
    'Software Engineer',
    'Front-End Developer',
    'UI/UX Designer'
  ];
  var typedEl = $('#typed');
  var typingStarted = false;

  function startTyping() {
    if (!typedEl || typingStarted) return;
    typingStarted = true;

    if (reduced) { typedEl.textContent = roles.join('  //  '); return; }

    var r = 0, c = 0, deleting = false;

    (function loop() {
      var word = roles[r];
      typedEl.textContent = word.slice(0, c);

      var delay = deleting ? 34 : 62;

      if (!deleting && c === word.length) {
        deleting = true; delay = 1900;
      } else if (deleting && c === 0) {
        deleting = false; r = (r + 1) % roles.length; delay = 380;
      } else {
        c += deleting ? -1 : 1;
      }
      setTimeout(loop, delay);
    })();
  }

  /* ---------------------------------------------------------
     3. Scroll reveal
     --------------------------------------------------------- */
  var revealEls = $$('.reveal');

  if (!hasIO || reduced) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 80) + 'ms';
      revealObs.observe(el);
    });
  }

  /* ---------------------------------------------------------
     4. Count-up stats
     --------------------------------------------------------- */
  function runCount(el) {
    var target = parseInt(el.dataset.to, 10) || 0;
    var suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suffix; return; }

    var start = performance.now(), dur = 1500;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = $$('.count');
  if (hasIO) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); countObs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* ---------------------------------------------------------
     5. Skill bars — fill + percentage count-up
     --------------------------------------------------------- */
  function runBar(bar, delay) {
    var level = parseInt(bar.dataset.level, 10) || 0;
    var fillEl = bar.querySelector('.bar-track i');
    var pctEl = bar.querySelector('.bar-pct');

    if (reduced) {
      if (fillEl) fillEl.style.width = level + '%';
      if (pctEl) pctEl.textContent = level + '%';
      return;
    }

    setTimeout(function () {
      if (fillEl) fillEl.style.width = level + '%';

      var start = performance.now(), dur = 1400;
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        if (pctEl) pctEl.textContent = Math.round(level * eased) + '%';
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, delay);
  }

  var groups = $$('.skillgroup');
  if (hasIO && !reduced) {
    var barObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$('.bar', en.target).forEach(function (bar, i) { runBar(bar, i * 110); });
        barObs.unobserve(en.target);
      });
    }, { threshold: 0.25 });
    groups.forEach(function (g) { barObs.observe(g); });
  } else {
    $$('.bar').forEach(function (bar) { runBar(bar, 0); });
  }

  /* ---------------------------------------------------------
     6. Nav: sticky, active link, progress bar, mobile menu
     --------------------------------------------------------- */
  var nav = $('#nav');
  var burger = $('#burger');
  var mobileMenu = $('#mobileMenu');
  var progressBar = $('#scrollProgress');
  var navLinks = $$('[data-nav]');
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('stuck', y > 20);

    if (progressBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }

    var active = -1;
    sections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.38) active = i;
    });
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === active); });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('[data-close]', mobileMenu).forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------------------------------------------------
     7. Cursor glow (desktop only)
     --------------------------------------------------------- */
  var glow = $('#cursorGlow');
  if (glow && finePointer && !reduced) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy;
    window.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY; glow.classList.add('on');
    }, { passive: true });
    (function follow() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(follow);
    })();
  }

  /* ---------------------------------------------------------
     8. Spotlight follow on project cards
     --------------------------------------------------------- */
  $$('.spotlight').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------------------------------------------------------
     9. 3D tilt cards
     --------------------------------------------------------- */
  if (finePointer && !reduced) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(800px) rotateX(' + (-py * 7).toFixed(2) +
          'deg) rotateY(' + (px * 7).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     10. Magnetic buttons
     --------------------------------------------------------- */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.22 + 'px,' + y * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .45s cubic-bezier(.22,.75,.28,1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 460);
      });
    });
  }

  /* ---------------------------------------------------------
     11. Portrait parallax
     --------------------------------------------------------- */
  var portrait = $('#portrait');
  if (portrait && finePointer && !reduced) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 16;
      var y = (e.clientY / window.innerHeight - 0.5) * 12;
      portrait.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     12. Ambient particle field
     --------------------------------------------------------- */
  var canvas = $('#particles');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var dots = [], dpr = Math.min(window.devicePixelRatio || 1, 2), W, H;

    function size() {
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    function seed() {
      var count = window.innerWidth < 640 ? 26 : 54;
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22 * dpr,
          vy: (Math.random() - 0.5) * 0.22 * dpr,
          r: (Math.random() * 1.5 + 0.6) * dpr,
          a: Math.random() * 0.4 + 0.15
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52,211,153,' + d.a + ')';
        ctx.fill();

        for (var j = i + 1; j < dots.length; j++) {
          var o = dots[j], dx = d.x - o.x, dy = d.y - o.y;
          var dist = Math.sqrt(dx * dx + dy * dy), max = 130 * dpr;
          if (dist < max) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = 'rgba(16,185,129,' + (0.12 * (1 - dist / max)) + ')';
            ctx.lineWidth = dpr * 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    size(); seed(); draw();

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); seed(); }, 200);
    });
  }

  /* ---------------------------------------------------------
     13. Contact form
     Static site: opens the visitor's mail client, prefilled.
     Swap the action for Formspree/Netlify Forms to receive
     messages directly — see README.
     --------------------------------------------------------- */
  var form = $('#contactForm');
  var note = $('#formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = $('#fName').value.trim();
      var email = $('#fEmail').value.trim();
      var msg = $('#fMessage').value.trim();

      if (!name || !email || !msg) {
        note.textContent = 'Please fill in all three fields before sending.';
        note.classList.add('err');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = 'That email address doesn\u2019t look right — check it and try again.';
        note.classList.add('err');
        return;
      }

      note.classList.remove('err');
      note.textContent = 'Opening your email app…';

      var subject = 'Portfolio enquiry from ' + name;
      var body = msg + '\n\n—\n' + name + '\n' + email;

      window.location.href = 'mailto:jeramperera2006@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      setTimeout(function () {
        note.textContent = 'If nothing opened, email jeramperera2006@gmail.com directly.';
      }, 2500);
    });
  }

  /* ---------------------------------------------------------
     14. Footer year
     --------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
