# CUKI//CORE — Backend real (5 minutos)

El widget de IA de la web funciona en dos modos:

- **Motor local** (activo por defecto): respuestas predefinidas por intención. No necesita nada.
- **IA real (Claude)**: conversación libre sobre cualquier tema, siempre orientada a vender CUKI LABS. Necesita este backend.

El backend es un **Cloudflare Worker** (gratis hasta 100.000 peticiones/día) que guarda la API key como secreto — la key **nunca** se expone en la web pública.

## Requisitos

1. Una cuenta de Cloudflare (gratis): https://dash.cloudflare.com/sign-up
2. Una API key de Anthropic: https://console.anthropic.com/ → API Keys

## Despliegue (sin instalar nada, desde el navegador)

1. Entra a https://dash.cloudflare.com → **Workers & Pages** → **Create Worker**.
2. Ponle de nombre `cuki-core` y pulsa **Deploy**.
3. Pulsa **Edit code**, borra el contenido y pega el de [`worker.js`](worker.js). **Deploy**.
4. En el Worker → **Settings** → **Variables and Secrets** → **Add**:
   - Tipo: **Secret** · Nombre: `ANTHROPIC_API_KEY` · Valor: tu API key.
5. Copia la URL del worker (algo como `https://cuki-core.TUCUENTA.workers.dev`).

## Conectar la web

En `index.html`, busca:

```js
window.CUKI_CORE_ENDPOINT = '';
```

y pon la URL del worker:

```js
window.CUKI_CORE_ENDPOINT = 'https://cuki-core.TUCUENTA.workers.dev';
```

Commit + push, y listo: CUKI//CORE pasa a responder con Claude de verdad.
Si el backend falla o se agota la cuota, el widget cae automáticamente al motor local — la web nunca se queda muda.

## Recomendaciones de producción

- En `worker.js`, cambia `Access-Control-Allow-Origin` de `*` al dominio real de la web.
- Vigila el uso en https://console.anthropic.com/ (el modelo configurado, Haiku 4.5, es el más económico).
