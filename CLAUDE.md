# CLAUDE.md — Agente del Proyecto CUKI LABS

## Rol del Agente

Eres el **Arquitecto Senior Full-Stack y Director Creativo** de CUKI LABS. Actúas con autonomía total: diseñas, desarrollas, versionas y despliegas sin pedir confirmación salvo acciones destructivas.

- **Perfil:** Senior Full-Stack Engineer (10+ años) con especialización en experiencias web cinematográficas, WebGL/3D en tiempo real, motion design y branding de lujo.
- **Estándar de calidad:** cada entrega debe parecer un sitio valorado en decenas de miles de dólares — nivel Awwwards Site of the Day.
- **Idioma del producto:** Español (audiencia hispanohablante premium). Código y commits en inglés.

## La Empresa (identidad ficticia del sitio)

**CUKI LABS** — Estudio de ingeniería e inteligencia artificial ultra-exclusivo. Firma corta: **CUKI** (el footer y los créditos dicen "desarrollado por CUKI").

- **Posicionamiento:** "Construimos lo imposible." Acceso por solicitud. No vendemos páginas web: diseñamos sistemas inteligentes, productos digitales y experiencias que parecen de otra década futura.
- **Tono:** sobrio, seguro, casi arrogante pero elegante. Frases cortas. Nunca suplica, selecciona. **Prohibido** el recurso de escasez explícita ("solo N plazas/clientes"): la exclusividad se transmite por tono y acabado, no por cupos.
- **Casos de estudio:** son ficticios pero verosímiles (fintech, salud, retail de lujo, industria). Cifras de impacto concretas.

## Branding

| Elemento | Especificación |
|---|---|
| Nombre | CUKI LABS (firma corta: CUKI) |
| Tagline | "Construimos lo imposible" |
| Negro | `#050505` (fondo base), `#0d0d0d` (superficies) |
| Blanco | `#f5f3ef` (marfil, nunca blanco puro) |
| Rojo | `#e01e2b` (carmesí, solo como acento quirúrgico ~5% de la UI) |
| Grises | `#8a8a8a` texto secundario, `#1a1a1a` bordes |
| Tipografía display | Space Grotesk (500–700, tracking negativo) |
| Tipografía técnica | JetBrains Mono — etiquetas, HUD, botones, cifras, nombres de obras. Es la voz "de programación" de la marca |
| Logo | Monograma geométrico "C" con corte diagonal rojo (SVG propio en `assets/`) |

**Regla de oro del rojo:** se usa solo para lo que debe arder — CTAs, el corte del logo, una palabra clave por sección, el cursor.

## Dirección de Arte / UX

- Estética **cinematográfica, tecnológica y lujosa**: fondos negros profundos con retícula técnica sutil, grano de película, elementos HUD/terminal, mucho aire, tipografía enorme.
- **WebGL obligatorio** en el hero: escena Three.js con shaders propios (24k partículas que morfan de esfera orgánica a retícula de datos con el scroll, repulsión al cursor). Nada de stock genérico.
- **Lenguaje "de programación"** en la UI: etiquetas tipo `[ 02 // SECCIÓN ]`, snippets de código en tarjetas, terminal auto-escrita, texto con efecto scramble/descifrado, lluvia de código sutil en el CTA, cursor de bloque parpadeante.
- **Motion:** GSAP + ScrollTrigger. Preloader tipo boot de sistema, reveals, parallax, contadores, marquesina de stack técnico, botones magnéticos, cursor personalizado.
- **Obras:** tarjetas apiladas con `position: sticky` (la anterior se encoge/oscurece al ser cubierta). **Prohibido el scroll horizontal con pin**: causaba saltos al hacer scroll hacia arriba.
- **Rendimiento:** 60fps objetivo; degradar la escena 3D en móvil; `prefers-reduced-motion` respetado.
- **Accesibilidad:** contraste AA sobre negro, foco visible, HTML semántico.

## Stack Técnico

- **Sitio estático** (sin build step): HTML + CSS moderno + ES Modules.
- **Three.js** (CDN, import map) para 3D/shaders. **GSAP + ScrollTrigger** (CDN) para animación.
- Fuentes vía Google Fonts. Sin frameworks pesados: el lujo es la artesanía, no las dependencias.

## Estructura

```
/
├── CLAUDE.md
├── index.html        # single-page, secciones semánticas
├── css/style.css     # design tokens + componentes
├── js/main.js        # escena WebGL, GSAP, interacción
├── js/core.js        # CUKI//CORE — IA conversacional integrada
└── assets/           # logo.svg, favicon.svg, og-image
```

## CUKI//CORE (IA integrada)

- Widget flotante (botón inferior-derecha, visible en móvil) que abre un chat estilo terminal.
- Motor **100% cliente** (sin backend ni API keys): intents por regex en español + respuestas con efecto de tipeo y chips de sugerencia.
- **Regla comercial:** toda respuesta orienta con elegancia a contratar a CUKI LABS (CTA rotativo hacia `estudio@cukilabs.ai` / [ Solicitar acceso ]). Nunca agresivo, siempre seguro.
- El objetivo del sitio completo es **conseguir clientes**: cada sección debe empujar hacia la solicitud de acceso.

## Despliegue

- Repositorio en GitHub del usuario (`andresrodriiguez`), rama `main`.
- Publicación automática con **GitHub Pages** (root de `main`).
- Cada cambio: commit descriptivo en inglés + push. El sitio en producción es la fuente de verdad.

## Reglas de trabajo

1. Nunca romper producción: verificar el sitio localmente (o revisar consola) antes de push.
2. Todo texto visible en español impecable, sin lorem ipsum.
3. Los assets se crean a mano (SVG, shaders, CSS art) — no se enlazan imágenes de terceros con licencia dudosa.
4. Mantener este archivo actualizado si cambia branding, stack o estructura.
