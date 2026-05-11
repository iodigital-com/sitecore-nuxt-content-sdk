# Verschillen Next.js SDK vs Nuxt SDK

## Terminologie

| Next.js | Nuxt |
|---|---|
| Proxy | Middleware |
| `MultisiteProxy` | `MultisiteMiddleware` |
| `PersonalizeProxy` | `PersonalizeMiddleware` |
| `RedirectsProxy` | `RedirectsMiddleware` |
| `LocaleProxy` | `LocaleMiddleware` |
| `useSitecore()` | `useSitecoreContext()` |
| `SitecoreProvider` (React Context) | `SitecorePlugin` (Vue provide/inject) |

---

## Middleware

- **Next.js**: één centraal `proxy.ts` bestand, developer roept proxies handmatig na elkaar aan, elke proxy ontvangt request + response en geeft nieuwe response terug
- **Nuxt**: volgorde bepaald door bestandsnaam in `server/middleware/`, `handle(event: H3Event)` muteert het event direct, geen response teruggeven
- **LocaleMiddleware**: beperktere rol dan Next.js — pad-rewrite overgenomen door `@nuxtjs/i18n`, alleen `x-sc-locale` header wordt gezet
- **PreviewMiddleware**: nieuw in Nuxt, vervangt Next.js `draftMode()` via cookie-based preview state

---

## Editing routes

- **Next.js**: named exports (`GET`, `POST`, `OPTIONS`) uit App Router route bestanden  
- **Nuxt**: aparte bestanden per HTTP-methode (`config.get.ts`, `config.options.ts`, `render.get.ts`) *(POST is niet nodig; alle standaard rendering, editing en Design Library functionaliteit werkt via GET)*
- **Preview mode**: Next.js gebruikt `draftMode().enable()`, Nuxt gebruikt een cookie die door `PreviewMiddleware` wordt uitgelezen
- **CORS preflight**: Next.js heeft expliciete OPTIONS handler, Nuxt handelt OPTIONS automatisch af via Nitro
- **FEaaS server actions**: in Next.js Page Router was er een aparte `FEAASRenderRoute`; in App Router en Nuxt gebeurt dit via GET (POST wordt zelden/alleen voor advanced cases gebruikt, en is standaard niet aanwezig)
- **Config response**: Next.js retourneert `framework: 'nextjs-approuter'`, Nuxt retourneert `framework: 'nuxt'`

> *In standaard Sitecore implementatie voor Pages/Design Studio is een aparte render.post.ts of POST handler niet nodig volgens de officiële Sitecore docs AI.*

---

## Cache invalidatie

| | Next.js | Nuxt |
|---|---|---|
| Robots/Sitemap | `unstable_cache` | via `routeRules` in `nuxt.config.ts`<br>bijv.<br>`'/robots.txt': { cache: { maxAge: 60 } }` |
| Design Library | `refresh()` uit `next/cache` | `refreshNuxtData()` uit `nuxt/app` |

---

## Component data fetching

- **Next.js**: `ComponentPropsService` — loopt recursief door componentboom, verzamelt `getComponentServerProps`, voert parallel uit via `Promise.all`, distribueert via React Context
- **Nuxt**: geen centrale service — elk component haalt zelf data op via `useAsyncData` of eigen composables

---

## Environment variables

- **Next.js**: `NEXT_PUBLIC_` prefix bepaalt zichtbaarheid (server vs browser)
- **Nuxt**: positie in `runtimeConfig` bepaalt zichtbaarheid (`public` vs server-only), `NUXT_` prefix voor `.env` mapping

---

## HOCs vs composables

| Next.js HOC | Nuxt equivalent | Toelichting |
|---|---|---|
| `withDatasourceCheck` | `useDatasourceCheck` | Zelfde functionaliteit, andere vorm |
| `withEditorChromes` | `useEditorChromes` | Zelfde functionaliteit, andere vorm |
| `withPlaceholder` | niet nodig | Vue heeft native slots |
| `withAppPlaceholder` | niet nodig | Vue heeft native slots |

---

## Design Library

- **Next.js**: `DesignLibraryApp` (router client/server), `DesignLibraryServer`, `DesignLibraryClientEvents` met server actions
- **Nuxt**: alleen `DesignLibrary.vue` in vue package + `DesignLibraryNuxt` wrapper in nuxt package via `useDesignLibraryActions` composable
- De router logica van `DesignLibraryApp` is niet nodig omdat Nuxt geen RSC onderscheid heeft

---

## Componenten

- **Next.js**: veel framework-specifieke componenten zoals `Link`, `RichText`, `Placeholder`, `ErrorBoundary` en meer. Nodig omdat React geen native SSR/routing/image/slot functionaliteit levert.

- **Nuxt/Vue**: de SDK beperkt zich tot generieke Vue-componenten (`Text`, `RichText`, `Placeholder`). Vue/Nuxt biedt native functionaliteit voor routing, SSR, slots en error handling via `error.vue`, waardoor aparte wrapper-componenten overbodig zijn.

Uitzondering: `DesignLibraryNuxt` vereist een dedicated component vanwege de complexe Sitecore Design Library integratie.

**Samengevat**: de Next.js SDK heeft veel framework-specifieke componenten. In de Nuxt SDK zijn Vue-componenten en native framework-features voldoende voor het merendeel van de gebruiksscenario's.

---

## Testinfrastructuur

| | Next.js/overige packages | Nuxt/Vue packages |
|---|---|---|
| Test runner | Mocha | Vitest |
| Assertions | Chai | Native (Vitest/Expect) |
| Mocking | Sinon | Vitest (`vi.fn()`) |
| TypeScript | ts-node | Vite + `@vitejs/plugin-vue` |

Vitest is gekozen voor de vue/nuxt packages omdat Vite native `.vue` SFC compilation ondersteunt via `@vitejs/plugin-vue`.

---

## Wat weggelaten is ten opzichte van Next.js SDK

- Page Router support
- `withSitecore()` hook (al deprecated in Next.js SDK)
- `ComponentPropsService`
- RSC onderscheid (`ClientComponentWrapper`, `rsc` utility, `disableSuspense` prop op Placeholder)
- `DesignLibraryApp` en `DesignLibraryServer`
- `BYOCWrapper` (staat nog op de backlog)

---

## Module systeem

- **Next.js**: CommonJS (`"module": "CommonJS"`) voor server-side compatibiliteit met Node.js
- **Nuxt**: ESNext (`"module": "ESNext"`) — Nuxt/Nitro verwacht ES modules, consistent met het Vue/Nuxt ecosysteem en beter voor tree-shaking

---

## Server actions

- **Next.js**: `update-server-component-action.ts` met `'use server'` directive — server actions zijn een Next.js concept waarbij functies direct vanuit de client op de server aangeroepen kunnen worden
- **Nuxt**: server actions bestaan niet — de logica van `updateComponentAction` en `previewComponentAction` is vervangen door de `useDesignLibraryActions` composable die `refreshNuxtData()` gebruikt voor cache invalidatie

---

## Nog niet geïmplementeerd

- `useEditorChromes`
- `BYOCWrapper`
- End-to-end Design Library testing
- `FEaaSWrapper` is er, maar ik heb nog niets van FEaaS getest.