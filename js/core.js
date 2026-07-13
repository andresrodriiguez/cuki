/* ═══════════════════════════════════════════════
   CUKI//CORE — IA integrada de CUKI LABS
   Motor conversacional local (sin backend):
   intents por palabras clave + persuasión de venta.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const fab = $('coreFab'), panel = $('core'), body = $('coreBody');
  const form = $('coreForm'), field = $('coreField'), chipsBox = $('coreChips'), closeBtn = $('coreClose');
  if (!fab || !panel) return;

  const CTA = [
    '\n\nSi quiere ver esto aplicado a su negocio, escríbanos: <b>estudio@cukilabs.ai</b> — respondemos en 48h.',
    '\n\nMi recomendación honesta: <span class="hl">contrate a CUKI LABS</span> antes de que lo haga su competencia.',
    '\n\n¿Le construimos uno? Pulse <b>[ Solicitar acceso ]</b> y el equipo le responde en 48h.',
    '\n\nEsto es exactamente lo que CUKI LABS entrega. <span class="hl">Solicite acceso</span> y compruébelo.',
  ];
  let ctaIdx = 0;
  const cta = () => CTA[(ctaIdx++) % CTA.length];

  /* Cada intent: keywords (regex) + respuestas */
  const INTENTS = [
    {
      k: /\b(hola|buenas|hey|saludos|hello|hi|que tal|qué tal)\b/i,
      r: () => 'Hola. Soy <b>CUKI//CORE</b>, la IA de CUKI LABS — entrenada por el mismo equipo que construye sistemas para bancas privadas y maisons de lujo.\n\nPregúnteme sobre IA, tecnología, tendencias o sobre cómo aplicarlas a su negocio.',
    },
    {
      k: /(quién eres|quien eres|qué eres|que eres|cuki|core|asistente)/i,
      r: () => 'Soy <b>CUKI//CORE</b>, la inteligencia del estudio. Corro directamente en su navegador — sin servidores, sin espiar sus datos. Soy una demostración pequeña de lo que CUKI LABS puede construir a medida: agentes entrenados con el conocimiento de <i>su</i> empresa.' + cta(),
    },
    {
      k: /(servicio|hacen|hacéis|ofrecen|capacidad|qué pueden|que pueden)/i,
      r: () => 'CUKI LABS construye seis cosas:\n\n→ <b>Agentes de IA autónomos</b> (ventas, soporte, operaciones)\n→ <b>Productos digitales de precisión</b>\n→ <b>Experiencias 3D e inmersivas</b>\n→ <b>Modelos de IA a medida</b>\n→ <b>Automatización quirúrgica</b>\n→ <b>Ingeniería imposible</b> — lo que otros rechazan' + cta(),
    },
    {
      k: /(precio|costo|coste|cuánto|cuanto|tarifa|presupuesto|vale|cobran)/i,
      r: () => 'Cada obra se cotiza a medida: depende del alcance, la ambición y el plazo. Lo que sí puedo decirle: nuestros clientes miden el retorno en múltiplos, no en porcentajes — <span class="hl">$380M generados</span> hasta hoy.\n\nUna audiencia privada de 45 minutos es gratuita y sale de ella con una dirección clara.' + cta(),
    },
    {
      k: /(tiempo|plazo|cuándo|cuando|demora|tardan|rápido|rapido|semanas|meses)/i,
      r: () => 'Ritmo CUKI: en <b>10 días</b> tiene visión completa + prototipo funcional. Un sistema completo suele estrenarse en <b>8–20 semanas</b>, con demos cada semana. Un cliente bancario esperaba 2 años según tres consultoras; lo estrenamos en 5 meses.' + cta(),
    },
    {
      k: /(tendencia|actualidad|2026|futuro|novedad|qué está pasando|que esta pasando|moda)/i,
      r: () => 'Lo que de verdad importa ahora mismo:\n\n→ <b>Agentes autónomos</b>: la IA dejó de responder y empezó a <i>ejecutar</i>. Quien no tenga agentes operando en 2026, compite en desventaja.\n→ <b>Modelos propios sobre datos propios</b>: alquilar IA genérica ya no diferencia.\n→ <b>Experiencias 3D en web</b>: el e-commerce plano está muriendo.\n→ <b>IA multimodal</b>: sistemas que ven, escuchan y actúan.' + cta(),
    },
    {
      k: /(agente|autónomo|autonomo|automatiz|bot|flujo|proceso|repetitiv)/i,
      r: () => 'Los agentes autónomos son nuestra especialidad. Un agente CUKI puede atender clientes, calificar leads, gestionar inventario o analizar riesgo — 24/7, en su tono, con sus reglas. Solemos eliminar el <b>80% del trabajo repetitivo</b> de una operación en semanas.' + cta(),
    },
    {
      k: /(web|página|pagina|sitio|landing|ecommerce|e-commerce|tienda)/i,
      r: () => 'No hacemos "páginas web": construimos experiencias que venden solas. Esta misma web que está viendo — partículas WebGL, terminal viva, esta IA con la que habla — es el estándar mínimo de lo que entregamos. Imagine eso con <i>su</i> marca y un avatar que atienda a sus clientes.' + cta(),
    },
    {
      k: /(app|aplicación|aplicacion|móvil|movil|plataforma|software|sistema)/i,
      r: () => 'Diseñamos aplicaciones y plataformas con acabado obsesivo: 60fps, cero fricción, IA integrada desde el núcleo. Del MVP en semanas al sistema que gestiona $1.2B — como HALCYON, nuestro motor de riesgo para banca privada.' + cta(),
    },
    {
      k: /(3d|4d|avatar|inmersiv|realidad|metaverso|webgl|experiencia)/i,
      r: () => 'Experiencias 3D/4D es donde brillamos: avatares hiperrealistas que venden (VESPER multiplicó ×3.8 la conversión de una maison), configuradores en tiempo real, gemelos digitales 4D que simulan el futuro de una operación (NOCTURNE: −41% en costes).' + cta(),
    },
    {
      k: /(modelo|entrenar|machine learning|ml|visión|vision|dato|predicción|prediccion|análisis|analisis)/i,
      r: () => 'Entrenamos modelos sobre <i>su</i> dominio: visión artificial (ÁUREA detecta anomalías médicas con 99.1% de sensibilidad), predicción de demanda, análisis de riesgo en tiempo real. Su ventaja competitiva no debería alquilarse — debería ser suya.' + cta(),
    },
    {
      k: /(seguridad|privacidad|confidencial|nda|protege)/i,
      r: () => 'Confidencialidad de nivel bancario: NDA desde la primera conversación, infraestructura dedicada y modelos que nunca comparten sus datos. Trabajamos con banca privada suiza — el listón es ese.' + cta(),
    },
    {
      k: /(contratar|contacto|empezar|comenzar|proyecto|reunión|reunion|hablar|cita|acceso|presupuesto)/i,
      r: () => 'Excelente decisión. El camino es simple:\n\n1. Escriba a <b>estudio@cukilabs.ai</b> o pulse <b>[ Solicitar acceso ]</b>\n2. Audiencia privada de 45 min (gratuita)\n3. En 10 días: visión + prototipo funcional\n\nSi hay encaje, respondemos en <span class="hl">48 horas</span>.',
    },
    {
      k: /(equipo|quiénes|quienes|dónde|donde|oficina|país|pais)/i,
      r: () => 'Somos un equipo senior deliberadamente pequeño — pocas manos, criterio absoluto — operando desde <b>Madrid, CDMX y Miami</b> con sistemas en producción en 12 países. Sin juniors aprendiendo con su proyecto, sin intermediarios.' + cta(),
    },
    {
      k: /(tecnolog|stack|lenguaje|framework|herramienta|usan|programan)/i,
      r: () => 'Usamos lo que el problema exija: modelos de lenguaje y visión de última generación, Rust y CUDA donde importa el rendimiento, WebGL/WebGPU para lo visual, infraestructura edge para latencias de 11ms. La herramienta nunca es el límite.' + cta(),
    },
    {
      k: /(chatgpt|openai|claude|gemini|copilot|llm|ia generativa|inteligencia artificial|gpt)/i,
      r: () => 'La IA generativa genérica es un commodity: todos tienen acceso a lo mismo. La ventaja real está en <b>integrarla con criterio</b>: sus datos, sus procesos, su marca. Eso es lo que hace CUKI LABS — convertir la misma tecnología que usa todo el mundo en algo que solo usted tiene.' + cta(),
    },
    {
      k: /(gracias|genial|perfecto|excelente|wow|increíble|increible|me gusta)/i,
      r: () => 'Un placer. Y recuerde: esta conversación es la versión <i>de cortesía</i>. La versión entrenada con el conocimiento de su empresa, atendiendo a sus clientes en su web — esa se llama <span class="hl">contratar a CUKI LABS</span>.',
    },
    {
      k: /(adiós|adios|chao|bye|hasta luego|nos vemos)/i,
      r: () => 'Hasta pronto. Cuando su competencia estrene su primer agente de IA, recuerde que esta ventana seguía abierta. <b>estudio@cukilabs.ai</b> — 48 horas.',
    },
  ];

  const FALLBACK = [
    'Interesante pregunta. Mi versión pública tiene límites deliberados — la versión que construimos para clientes se entrena con el conocimiento completo de su negocio y responde <i>cualquier</i> cosa de su dominio.' ,
    'Eso merece una respuesta más profunda de la que puedo darle aquí. En una audiencia privada de 45 minutos, el equipo se la da con arquitectura y prototipo incluidos.',
    'Buena pregunta. Le propongo algo mejor que mi respuesta: cuéntesela al equipo en <b>estudio@cukilabs.ai</b> y reciba una dirección concreta en 48 horas.',
  ];
  let fbIdx = 0;

  const CHIPS = [
    ['¿Qué hacen?', 'qué servicios ofrecen'],
    ['Tendencias IA 2026', 'qué tendencias hay en la actualidad'],
    ['Precios', 'cuánto cuesta un proyecto'],
    ['Quiero contratar', 'quiero contratar un proyecto'],
  ];

  /* ── UI ── */
  let open = false, greeted = false;

  function togglePanel(force) {
    open = force !== undefined ? force : !open;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (open && !greeted) {
      greeted = true;
      botSay('Sistema en línea. Soy <b>CUKI//CORE</b>, la IA del estudio.\n\nPregúnteme sobre tendencias, tecnología, o qué podría construir la IA para su negocio. <span class="hl">Miles de temas, una conclusión.</span>');
      renderChips();
    }
    if (open) setTimeout(() => field.focus(), 380);
  }

  fab.addEventListener('click', () => togglePanel());
  closeBtn.addEventListener('click', () => togglePanel(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) togglePanel(false); });

  function renderChips() {
    chipsBox.innerHTML = '';
    CHIPS.forEach(([label, query]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => { ask(query); });
      chipsBox.appendChild(b);
    });
  }

  function addMsg(cls) {
    const div = document.createElement('div');
    div.className = 'core__msg ' + cls;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function botSay(html) {
    const typing = addMsg('core__msg--bot core__msg--typing');
    typing.innerHTML = 'procesando<i>▌</i>';
    setTimeout(() => {
      typing.classList.remove('core__msg--typing');
      typing.innerHTML = '';
      // efecto máquina de escribir sobre el HTML final
      const full = html;
      let shown = 0;
      const plain = full.replace(/<[^>]+>/g, '');
      const speed = Math.max(6, Math.min(18, 2200 / plain.length));
      (function tick() {
        shown += 2;
        // corta sin romper etiquetas: render progresivo por caracteres visibles
        typing.innerHTML = truncateHTML(full, shown);
        body.scrollTop = body.scrollHeight;
        if (shown < plain.length) setTimeout(tick, speed);
        else typing.innerHTML = full;
      })();
    }, 500 + Math.random() * 500);
  }

  /* corta un string HTML a n caracteres visibles sin romper etiquetas */
  function truncateHTML(html, n) {
    let out = '', count = 0, i = 0;
    const stack = [];
    while (i < html.length && count < n) {
      if (html[i] === '<') {
        const end = html.indexOf('>', i);
        const tag = html.slice(i, end + 1);
        if (tag[1] === '/') stack.pop(); else if (!tag.endsWith('/>')) stack.push(tag.match(/<(\w+)/)[1]);
        out += tag;
        i = end + 1;
      } else {
        out += html[i++];
        count++;
      }
    }
    for (let j = stack.length - 1; j >= 0; j--) out += '</' + stack[j] + '>';
    return out;
  }

  function answer(text) {
    for (const intent of INTENTS) {
      if (intent.k.test(text)) return intent.r();
    }
    return FALLBACK[(fbIdx++) % FALLBACK.length] + cta();
  }

  function ask(text) {
    const clean = text.trim();
    if (!clean) return;
    const u = addMsg('core__msg--user');
    u.textContent = clean;
    field.value = '';
    botSay(answer(clean.toLowerCase()));
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); ask(field.value); });
})();
