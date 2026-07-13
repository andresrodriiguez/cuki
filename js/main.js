/* ═══════════════════════════════════════════════
   AXIOMA — main.js
   Escena WebGL (Three.js) + coreografía GSAP
   ═══════════════════════════════════════════════ */

import * as THREE from 'three';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 900px)').matches;

/* ═══════════ ESCENA WEBGL ═══════════
   Nube de 24k partículas que morfa entre una esfera
   y un toroide, con brillo carmesí y parallax al mouse. */
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
  const torusPos = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    // esfera (distribución fibonacci con ruido radial)
    const t = i / COUNT;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 2.2 + (Math.random() - 0.5) * 0.35;
    spherePos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    spherePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    spherePos[i * 3 + 2] = r * Math.cos(phi);

    // toroide
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const R = 2.1, tube = 0.65 + Math.random() * 0.25;
    torusPos[i * 3]     = (R + tube * Math.cos(v)) * Math.cos(u);
    torusPos[i * 3 + 1] = (R + tube * Math.cos(v)) * Math.sin(u);
    torusPos[i * 3 + 2] = tube * Math.sin(v);

    seeds[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(spherePos, 3));
  geo.setAttribute('aTarget', new THREE.BufferAttribute(torusPos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uTime:   { value: 0 },
    uMorph:  { value: 0 },   // 0 = esfera, 1 = toroide (lo controla el scroll)
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
        vec3 pos = mix(position, aTarget, uMorph);

        // respiración orgánica
        float breath = sin(uTime * 0.6 + aSeed * 20.0) * 0.08;
        pos += normalize(pos) * breath;

        // deriva individual
        pos.x += sin(uTime * 0.4 + aSeed * 40.0) * 0.05;
        pos.y += cos(uTime * 0.3 + aSeed * 30.0) * 0.05;

        // repulsión sutil del mouse
        vec2 m = uMouse * 3.0;
        float d = distance(pos.xy, m);
        pos.xy += normalize(pos.xy - m + 0.0001) * smoothstep(1.6, 0.0, d) * 0.45;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (aSeed * 2.2 + 0.8) * (300.0 / -mv.z) * 0.01 + 1.2;

        vGlow = smoothstep(1.9, 2.6, length(pos)) * step(0.82, aSeed);
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

/* ═══════════ PRELOADER ═══════════ */
function initPreloader(onDone) {
  const pre = document.getElementById('preloader');
  const count = document.getElementById('preloaderCount');
  const bar = document.getElementById('preloaderBar');
  if (!pre) { onDone(); return; }

  if (prefersReduced) { pre.remove(); onDone(); return; }

  const state = { v: 0 };
  gsap.to(state, {
    v: 100, duration: 1.9, ease: 'power2.inOut',
    onUpdate() {
      const n = Math.round(state.v);
      count.textContent = String(n).padStart(2, '0');
      bar.style.width = n + '%';
    },
    onComplete() {
      gsap.to(pre, {
        yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: 0.25,
        onComplete() { pre.remove(); onDone(); },
      });
    },
  });
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
    .from('.hero__meta', { opacity: 0, duration: 1 }, '-=0.5');

  if (prefersReduced) return;

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

  // Marquee infinito
  const track = document.getElementById('marqueeTrack');
  if (track) {
    track.innerHTML += track.innerHTML;
    gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
  }

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
  gsap.utils.toArray('.section-label, .section-title, .service, .process__step, .quote, .cta__title, .cta__sub, .cta .btn').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 44, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Obras: scroll horizontal con pin
  const worksTrack = document.getElementById('worksTrack');
  const worksPin = document.getElementById('worksPin');
  if (worksTrack && worksPin) {
    const getDistance = () => worksTrack.scrollWidth - window.innerWidth;
    gsap.to(worksTrack, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: worksPin,
        start: 'top 12%',
        end: () => '+=' + getDistance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }

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

  // Tilt 3D en tarjetas
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

/* ═══════════ ARRANQUE ═══════════ */
initWebGL();
initCursor();
initPreloader(() => initAnimations());
