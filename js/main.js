/* ═══════════════════════════════════════════════
   CUKI LABS — main.js
   WebGL (Three.js) + terminal + scramble + GSAP
   ═══════════════════════════════════════════════ */

import * as THREE from 'three';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 900px)').matches;

/* ═══════════ ESCENA WEBGL ═══════════
   24k partículas que morfan de esfera orgánica a
   retícula de datos (lattice cúbico), con brillo
   carmesí y repulsión al cursor. */
function initWebGL() {
  const canvas = document.getElementById('webgl');
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 7;

  const COUNT = isMobile ? 9000 : 24000;
  const spherePos = new Float32Array(COUNT * 3);
  const latticePos = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);

  // lattice: puntos ordenados en una retícula cúbica (estructura de datos 3D)
  const SIDE = Math.ceil(Math.cbrt(COUNT));
  const SPACING = 4.4 / SIDE;

  for (let i = 0; i < COUNT; i++) {
    // esfera orgánica (distribución fibonacci con ruido radial)
    const t = i / COUNT;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 2.2 + (Math.random() - 0.5) * 0.35;
    spherePos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    spherePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    spherePos[i * 3 + 2] = r * Math.cos(phi);

    // retícula cúbica
    const ix = i % SIDE;
    const iy = Math.floor(i / SIDE) % SIDE;
    const iz = Math.floor(i / (SIDE * SIDE));
    latticePos[i * 3]     = (ix - SIDE / 2) * SPACING;
    latticePos[i * 3 + 1] = (iy - SIDE / 2) * SPACING;
    latticePos[i * 3 + 2] = (iz - SIDE / 2) * SPACING;

    seeds[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(spherePos, 3));
  geo.setAttribute('aTarget', new THREE.BufferAttribute(latticePos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uTime:   { value: 0 },
    uMorph:  { value: 0 },   // 0 = esfera, 1 = retícula (lo controla el scroll)
    uMouse:  { value: new THREE.Vector2(0, 0) },
    uIvory:  { value: new THREE.Color('#f5f3ef') },
    uRed:    { value: new THREE.Color('#e01e2b') },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aTarget;
      attribute float aSeed;
      uniform float uTime;
      uniform float uMorph;
      uniform vec2 uMouse;
      varying float vGlow;

      void main() {
        // cada partícula viaja con un pequeño desfase: la morfosis "barre" la nube
        float m = clamp(uMorph * 1.35 - aSeed * 0.35, 0.0, 1.0);
        vec3 pos = mix(position, aTarget, m);

        // respiración orgánica (se congela al llegar a la retícula)
        float breath = sin(uTime * 0.6 + aSeed * 20.0) * 0.08 * (1.0 - m);
        pos += normalize(pos + 0.0001) * breath;

        // deriva individual
        float drift = 1.0 - m * 0.85;
        pos.x += sin(uTime * 0.4 + aSeed * 40.0) * 0.05 * drift;
        pos.y += cos(uTime * 0.3 + aSeed * 30.0) * 0.05 * drift;

        // repulsión sutil del cursor
        vec2 mo = uMouse * 3.0;
        float d = distance(pos.xy, mo);
        pos.xy += normalize(pos.xy - mo + 0.0001) * smoothstep(1.6, 0.0, d) * 0.45;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (aSeed * 2.2 + 0.8) * (300.0 / -mv.z) * 0.01 + 1.2;

        // en modo retícula se "encienden" nodos como datos activos
        float pulse = step(0.9, fract(aSeed * 7.31 + uTime * 0.22));
        vGlow = max(smoothstep(1.9, 2.6, length(pos)) * step(0.82, aSeed), pulse * m);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uIvory;
      uniform vec3 uRed;
      varying float vGlow;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.05, d);
        vec3 color = mix(uIvory, uRed, vGlow);
        gl_FragColor = vec4(color, alpha * 0.75);
      }
    `,
  });

  const points = new THREE.Points(geo, material);
  points.rotation.x = 0.35;
  scene.add(points);

  // núcleo carmesí volumétrico
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshBasicMaterial({ color: '#e01e2b', transparent: true, opacity: 0.06 })
  );
  scene.add(core);

  const mouse = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // el scroll morfa la geometría y aleja la cámara
  if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    gsap.to(uniforms.uMorph, {
      value: 1, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
    });
    gsap.to(camera.position, {
      z: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
    });
  }

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    mouse.lerp(target, 0.05);
    uniforms.uMouse.value.copy(mouse);
    points.rotation.y = t * 0.07 + mouse.x * 0.25;
    points.rotation.x = 0.35 + mouse.y * 0.15;
    core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.15);
    renderer.render(scene, camera);
  });
}

/* ═══════════ PRELOADER (boot de sistema) ═══════════ */
function initPreloader(onDone) {
  const pre = document.getElementById('preloader');
  const log = document.getElementById('preloaderLog');
  const count = document.getElementById('preloaderCount');
  const bar = document.getElementById('preloaderBar');
  if (!pre) { onDone(); return; }
  if (prefersReduced) { pre.remove(); onDone(); return; }

  const lines = [
    '<b>$</b> cuki --init',
    'cargando núcleo neuronal............ <span class="ok">OK</span>',
    'compilando shaders propietarios..... <span class="ok">OK</span>',
    'sincronizando 24.000 nodos.......... <span class="ok">OK</span>',
    '<b>sistema operativo. bienvenido.</b>',
  ];
  lines.forEach((html, i) => {
    setTimeout(() => { log.innerHTML += html + '\n'; }, 180 + i * 340);
  });

  const state = { v: 0 };
  gsap.to(state, {
    v: 100, duration: 2.1, ease: 'power2.inOut',
    onUpdate() {
      const n = Math.round(state.v);
      count.textContent = String(n).padStart(3, '0');
      bar.style.width = n + '%';
    },
    onComplete() {
      gsap.to(pre, {
        yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: 0.3,
        onComplete() { pre.remove(); onDone(); },
      });
    },
  });
}

/* ═══════════ TERMINAL AUTO-ESCRITA ═══════════ */
function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const script = [
    { t: '<span class="p">$</span> cuki deploy --target production', d: 30 },
    { t: '<span class="c">→ compilando modelo propietario......... OK</span>', d: 16 },
    { t: '<span class="c">→ 2.4M señales/segundo · latencia 11ms</span>', d: 16 },
    { t: '<span class="c">→ precisión: 99.1% · fallos: 0</span>', d: 16 },
    { t: '<span class="p">✓ sistema estrenado.</span>', d: 26 },
    { t: '', d: 0 },
    { t: '<span class="p">$</span> cuki metrics --clients', d: 30 },
    { t: '<span class="c">→ valor generado: $380M · países: 12</span>', d: 16 },
    { t: '<span class="p">✓ lo imposible, en producción.</span>', d: 26 },
  ];

  let started = false;
  function typeLine(i) {
    if (i >= script.length) {
      setTimeout(() => { body.innerHTML = ''; typeLine(0); }, 6000);
      return;
    }
    const { t, d } = script[i];
    if (!t) { body.innerHTML += '\n'; typeLine(i + 1); return; }
    const tmp = document.createElement('div');
    tmp.innerHTML = t;
    const span = tmp.firstChild;
    const text = span.textContent;
    span.textContent = '';
    body.appendChild(span);
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.textContent = '▌';
    body.appendChild(caret);
    let j = 0;
    (function tick() {
      if (j < text.length) {
        span.textContent += text[j++];
        setTimeout(tick, prefersReduced ? 0 : d);
      } else {
        caret.remove();
        body.appendChild(document.createTextNode('\n'));
        setTimeout(() => typeLine(i + 1), 140);
      }
    })();
  }

  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      typeLine(0);
      obs.disconnect();
    }
  }, { threshold: 0.4 }).observe(body);
}

/* ═══════════ SCRAMBLE (texto que se descifra) ═══════════ */
function initScramble() {
  const CHARS = '01<>/{}[]$#%&*+=_ABCDEF';
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    const nodes = [];
    (function collect(n) {
      n.childNodes.forEach((c) => {
        if (c.nodeType === 3) nodes.push({ node: c, final: c.textContent });
        else collect(c);
      });
    })(el);

    let done = false;
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting || done) return;
      done = true;
      obs.disconnect();
      if (prefersReduced) return;
      const start = performance.now();
      const DUR = 900;
      (function frame(now) {
        const p = Math.min((now - start) / DUR, 1);
        nodes.forEach(({ node, final }) => {
          const reveal = Math.floor(final.length * p);
          let out = final.slice(0, reveal);
          for (let i = reveal; i < final.length; i++) {
            out += final[i] === ' ' ? ' ' : CHARS[(Math.random() * CHARS.length) | 0];
          }
          node.textContent = out;
        });
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    }, { threshold: 0.5 }).observe(el);
  });
}

/* ═══════════ LLUVIA DE CÓDIGO (CTA) ═══════════ */
function initRain() {
  const canvas = document.getElementById('rain');
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext('2d');
  const CHARS = '01';
  let cols, drops, fontSize;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    fontSize = 13;
    cols = Math.floor(canvas.width / (fontSize * 1.6));
    drops = Array.from({ length: cols }, () => Math.random() * -60);
  }
  resize();
  window.addEventListener('resize', resize);

  let visible = false;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0 })
    .observe(canvas);

  let last = 0;
  (function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || now - last < 66) return;
    last = now;
    ctx.fillStyle = 'rgba(5,5,5,0.16)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px "JetBrains Mono", monospace';
    for (let i = 0; i < cols; i++) {
      const glow = Math.random() > 0.985;
      ctx.fillStyle = glow ? 'rgba(224,30,43,0.85)' : 'rgba(245,243,239,0.10)';
      ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * fontSize * 1.6, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  })(0);
}

/* ═══════════ ANIMACIONES GSAP ═══════════ */
function initAnimations() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero: entrada cinematográfica
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.hero__line > span', { y: 0, duration: 1.3, stagger: 0.14 })
    .to('.reveal-line', { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, '-=0.8')
    .from('.hero__actions .btn', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, '-=0.6')
    .from('.hero__meta, .hero__hud', { opacity: 0, duration: 1 }, '-=0.5');

  if (prefersReduced) return;

  // Barra de progreso de scroll (visible también en móvil)
  gsap.to('#progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 0.4 },
  });

  // Nav: se oculta al bajar
  let lastY = 0;
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    onUpdate(self) {
      const y = self.scroll();
      nav.classList.toggle('is-hidden', y > lastY && y > 200);
      lastY = y;
    },
  });

  // Marquees infinitas (la segunda en sentido contrario)
  [['marqueeTrack', -50, 24], ['marqueeTrack2', 50, 30]].forEach(([id, x, dur]) => {
    const track = document.getElementById(id);
    if (!track) return;
    track.innerHTML += track.innerHTML;
    if (x > 0) gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: dur, ease: 'none', repeat: -1 });
    else gsap.to(track, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 });
  });

  // Manifiesto: revelado palabra a palabra
  const mText = document.getElementById('manifestoText');
  if (mText) {
    mText.innerHTML = mText.innerHTML.replace(
      /(<em[^>]*>.*?<\/em>)|([^\s<]+)/g,
      (m) => `<span class="word">${m}</span>`
    );
    gsap.to(mText.querySelectorAll('.word'), {
      opacity: 1, stagger: 0.04, ease: 'none',
      scrollTrigger: { trigger: mText, start: 'top 78%', end: 'bottom 45%', scrub: true },
    });
  }

  // Contadores
  document.querySelectorAll('.stat__num').forEach((el) => {
    const end = +el.dataset.count;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    el.textContent = prefix + '0' + suffix;
    gsap.to(obj, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate() { el.textContent = prefix + Math.round(obj.v) + suffix; },
    });
  });

  // Reveals genéricos
  gsap.utils.toArray('.section-label, .section-title, .service, .process__step, .quote, .terminal, .ai__orb-wrap, .ai__lead, .ai__prompts, .cta__title, .cta__sub, .cta .btn').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 44, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Obras: apilado sticky — cada tarjeta se encoge y oscurece al ser cubierta
  const works = gsap.utils.toArray('[data-work]');
  works.forEach((card, i) => {
    if (i === works.length - 1) return;
    gsap.to(card, {
      scale: 0.94, opacity: 0.45, filter: 'brightness(0.55)',
      transformOrigin: 'center top', ease: 'none',
      scrollTrigger: {
        trigger: works[i + 1],
        start: 'top 90%',
        end: 'top 12%',
        scrub: true,
      },
    });
  });

  // Obras: parallax interno del visual (también en móvil)
  gsap.utils.toArray('.work__visual .work__orbit').forEach((el) => {
    gsap.fromTo(el, { y: 34 }, {
      y: -34, ease: 'none',
      scrollTrigger: { trigger: el.closest('.work'), start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
  });

  // Spotlight que sigue al cursor en las tarjetas de capacidades
  document.querySelectorAll('.service').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  // Footer: la palabra sube con parallax
  gsap.from('.footer__word', {
    yPercent: 55, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
  });
}

/* ═══════════ CURSOR + MAGNETISMO + TILT ═══════════ */
function initCursor() {
  if (isMobile || prefersReduced) return;
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!cursor) return;

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };

  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX; target.y = e.clientY;
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });

  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.16;
    pos.y += (target.y - pos.y) * 0.16;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%,-50%)`;
  });

  document.querySelectorAll('a, button, [data-hover]').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });

  // Botones magnéticos
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });

  // Tilt 3D en tarjetas (no en las obras apiladas: interfiere con su scale)
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
      gsap.to(el, { rotateX: rx, rotateY: ry, transformPerspective: 700, duration: 0.5, ease: 'power2.out' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out' });
    });
  });
}

/* ═══════════ CHISPAS AL TOCAR (móvil y escritorio) ═══════════ */
function initSparks() {
  if (prefersReduced) return;
  window.addEventListener('pointerdown', (e) => {
    // no sobre el chat, para no ensuciar la conversación
    if (e.target.closest('.core, .core-fab, .core-teaser')) return;
    const burst = document.createElement('div');
    burst.className = 'spark-burst';
    burst.style.left = e.clientX + 'px';
    burst.style.top = e.clientY + 'px';
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('i');
      const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.6;
      const d = 22 + Math.random() * 26;
      s.style.setProperty('--sx', Math.cos(a) * d + 'px');
      s.style.setProperty('--sy', Math.sin(a) * d + 'px');
      burst.appendChild(s);
    }
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 700);
  }, { passive: true });
}

/* ═══════════ TÍTULO DE PESTAÑA VIVO ═══════════ */
function initTitle() {
  const base = document.title;
  let dot = true;
  setInterval(() => {
    document.title = document.hidden ? 'CUKI//CORE sigue en línea_' : (dot ? base : 'CUKI LABS_');
    dot = !dot;
  }, 1600);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) document.title = base; });
}

/* ═══════════ ARRANQUE ═══════════ */
initWebGL();
initCursor();
initTerminal();
initScramble();
initRain();
initSparks();
initTitle();
initPreloader(() => initAnimations());

console.log('%c CUKI//CORE %c sistema operativo — ¿inspeccionando el código? nos gusta la gente curiosa. estudio@cukilabs.ai ',
  'background:#e01e2b;color:#f5f3ef;font-family:monospace;padding:4px 8px;',
  'background:#0d0d0d;color:#8a8a8a;font-family:monospace;padding:4px 8px;');
