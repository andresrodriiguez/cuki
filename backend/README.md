# CUKI//CORE — Backend real, 100% GRATIS (sin tarjeta)

El widget de IA de la web funciona en dos modos:

- **Motor local** (activo por defecto): respuestas predefinidas por intención. No necesita nada.
- **IA real (Llama 3.3 70B vía Groq)**: conversación libre sobre cualquier tema, siempre orientada a vender CUKI LABS.

Toda la cadena es gratuita y sin tarjeta de crédito:

| Pieza | Servicio | Coste |
|---|---|---|
| Modelo de IA | Groq (Llama 3.3 70B) | $0 — miles de peticiones/día |
| Backend | Cloudflare Workers | $0 — 100.000 peticiones/día |
| Web | GitHub Pages | $0 |

## Paso 1 — API key de Groq (gratis, ~2 min)

1. Entra a https://console.groq.com/ y regístrate (con Google o GitHub, sin tarjeta).
2. Ve a **API Keys** → **Create API Key**, nombre `cuki-core`, y **copia la key** (empieza por `gsk_`).

## Paso 2 — Cuenta de Cloudflare (gratis, ~2 min)

1. Entra a https://dash.cloudflare.com/sign-up y regístrate (sin tarjeta).

## Paso 3 — Desplegar el worker (desde el navegador, ~4 min)

1. En https://dash.cloudflare.com → **Workers & Pages** → **Create Worker**.
2. Nombre: `cuki-core` → **Deploy**.
3. **Edit code** → borra el contenido, pega el de [`worker.js`](worker.js) → **Deploy**.
4. Worker → **Settings** → **Variables and Secrets** → **Add**:
   - Tipo: **Secret** · Nombre: `GROQ_API_KEY` · Valor: tu key `gsk_...`
5. Copia la URL del worker (ej. `https://cuki-core.TUCUENTA.workers.dev`).

## Paso 4 — Conectar la web

En `index.html`, busca `window.CUKI_CORE_ENDPOINT = '';` y pon la URL del worker:

```js
window.CUKI_CORE_ENDPOINT = 'https://cuki-core.TUCUENTA.workers.dev';
```

Commit + push. Listo: CUKI//CORE responde con un LLM real.
Si el backend falla o se agota la cuota diaria, el widget cae automáticamente al motor local — la web nunca se queda muda.

## Producción

- En `worker.js`, cambia `Access-Control-Allow-Origin` de `*` al dominio real.
- Si algún día quieres máxima calidad de respuesta, el worker se puede apuntar a la API de Claude (de pago) cambiando solo la función `fetch` — pídeselo al agente.
