# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # install deps
npm run dev               # astro dev — fast static iteration, does NOT exercise Cloudflare bindings (EMAIL, Turnstile secret, etc.)
wrangler dev               # full-stack local dev with Cloudflare bindings — required to test /api/contact, Turnstile, email
npm run check              # astro check — type-check (also run in CI before build)
npm run build               # astro build — production build via the Cloudflare adapter
npm run preview              # astro preview
wrangler deploy               # manual deploy (CI normally handles this on push to main)
```

There is no test suite/framework configured in this repo.

Local dev requires a `.dev.vars` file (see `.dev.vars.example`) with `TURNSTILE_SECRET_KEY`, `CONTACT_FROM_ADDRESS`, `OWNER_NOTIFICATION_ADDRESS`. Use Cloudflare's published Turnstile test keys for local testing: always-pass `1x00000000000000000000AA`, always-block `2x00000000000000000000AB`.

CI (`.github/workflows/deploy.yml`) runs `npm run check` + `npm run build` on every push/PR to `main`, then deploys via `wrangler-action` on push to `main` (needs `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` repo secrets).

## Architecture

Astro (`output: "server"`, `@astrojs/cloudflare` adapter) deployed as a Cloudflare Worker. Individual pages opt into static prerendering (`export const prerender = true`); only `src/pages/api/contact.ts` is server-rendered (`prerender = false`), so this is a hybrid app even though the adapter is in "server" mode.

**i18n is per-locale duplicated pages, not dynamic routing.** `src/pages/index.astro` (en), `src/pages/es/index.astro`, and `src/pages/gl/index.astro` are three separate files that each hardcode `const locale = 'en'|'es'|'gl' as const`, call `getDictionary(locale)` from `src/i18n/utils.ts`, and assemble the same component tree (`Header`, `Hero`, `ContactSection`, `Footer`). There is no shared `[locale]` dynamic route. **Any structural or markup change to the landing page must be applied to all three files by hand** — copy text lives in `src/i18n/{en,es,gl}.ts`, but layout/component wiring does not flow from one source of truth. The language switcher in `Header` uses real `<a href>` locale links (not client-side state) so each language stays a crawlable URL.

**Cloudflare bindings/env vars are read via the `cloudflare:env` virtual module** (`import { env } from 'cloudflare:env'` in `api/contact.ts`), not via `context.locals.runtime.env` — this is the Astro v6+ / current `@astrojs/cloudflare` pattern (see commit "Fix Cloudflare environment variable access for Astro v6+"). The shape of `env` (the `EMAIL` binding, `TURNSTILE_SECRET_KEY`, etc.) is declared in `src/env.d.ts`. Because prerendered pages have no request-time runtime env, the Turnstile **site key** (public) is read separately at build time via `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` in each `index.astro`, while the **secret key** is read at request time through `cloudflare:env` inside `api/contact.ts`.

**Contact form flow** (`ContactForm.astro` → `POST /api/contact`):
1. Client validates required fields/email format, solves Turnstile widget, `fetch`es `/api/contact` with `{ name, gender?, age, email, locale, turnstileToken }`.
2. Server (`api/contact.ts`) re-validates via `src/lib/validate.ts`, then verifies the Turnstile token server-side via `src/lib/turnstileVerify.ts` (calls Cloudflare's siteverify endpoint directly — no SDK).
3. On success it sends two emails through the `EMAIL` binding: a localized confirmation to the submitter (`src/emails/confirmationEmail.ts`) and an always-English notification to the owner (`src/emails/notificationEmail.ts`).
4. **Deliberate asymmetry in error handling**: Turnstile failures return `400 { success: false }` and block sending. Email send failures (e.g. domain not yet onboarded to Cloudflare Email Sending, or missing `EMAIL` binding) are caught, logged, and swallowed — the route still returns `200 { success: true }`, since the submission itself was received. Don't "fix" this into a hard failure without checking with the user first.

**Styling is Tailwind v4, CSS-first — `tailwind.config.mjs` is dead code.** `astro.config.mjs` only wires up `@tailwindcss/vite`; `@astrojs/tailwind` is an unused package.json leftover and nothing reads `tailwind.config.mjs` (no `@config` directive anywhere). The real source of truth is the `@theme` block in `src/styles/global.css` — all color/font tokens must be defined there, and `tailwind.config.mjs` should be treated as vestigial (safe to delete, not to edit). Note the theme tokens are bare (`--cream`, `--dark-text`, `--gold-light`, ...) rather than namespaced `--color-*`, so Tailwind v4 does NOT auto-generate `bg-*`/`text-*`/`border-*` utilities for them; where those utilities are needed (`text-dark-text`, `text-gold-light`, `border-gold-light`, `border-gold`), they're hand-declared via `@utility` blocks in the same file instead of relying on the theme's automatic utility generation.

## Known-incomplete setup

The app builds and deploys as-is, but several things are placeholder/manual-setup-only (see README "Manual Prerequisites" section for full steps): the domain isn't yet onboarded to Cloudflare Email Sending (emails silently no-op until then), `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` in `wrangler.jsonc`/`.dev.vars` are placeholders, GitHub Actions deploy secrets aren't configured, and the Hero background image at `public/images/hero-door.jpg` is a placeholder.

## Misc

- `design/Grace and Wise Words - Landing Page.html` is a Claude Design export used as a visual reference only; it's gitignored and not part of the build.
- `pnpm-workspace.yaml` sets `allowBuilds` for `esbuild`/`workerd` — relevant if installing with pnpm, though `npm` is the documented/CI package manager.
