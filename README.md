# lendalore — Galicia Reading Retreats

A single-page, fully responsive marketing site for lendalore, offering mystical reading retreats in Galicia, Spain. Built with Astro, Tailwind CSS, and Cloudflare Workers.

## Tech Stack

- **Framework**: Astro (v5) with server output
- **Hosting**: Cloudflare Workers (via `@astrojs/cloudflare` adapter)
- **Styling**: Tailwind CSS
- **Internationalization**: English, Spanish, Galician (via Astro i18n routing)
- **Email**: Cloudflare Email Service
- **Spam Protection**: Cloudflare Turnstile

## Development

### Prerequisites

- Node.js 20+
- npm or package manager of choice

### Installation

```bash
npm install
```

### Running Locally

**Option 1: Static development** (no bindings)
```bash
npm run dev
```
This starts a fast local dev server for layout/styling iterations. Doesn't exercise Cloudflare bindings.

**Option 2: Full-stack with bindings** (requires wrangler)
```bash
wrangler dev
```
This lets you test the contact form API route, Turnstile verification, and email functionality locally. You'll need `.dev.vars` configured (see below).

### Build

```bash
npm run build
```

Type-check before building:
```bash
npm run check
```

## Configuration

### Environment Variables

Create a `.dev.vars` file in the project root for local development (see `.dev.vars.example`):

```
TURNSTILE_SECRET_KEY=1x00000000000000000000AA
CONTACT_FROM_ADDRESS=hello@gracewisewords.com
OWNER_NOTIFICATION_ADDRESS=owner@gracewisewords.com
```

For production, secrets should be managed via `wrangler secret put`.

## Manual Prerequisites (Blocking for Email & Turnstile)

The code is fully built and deployable now, but email sending and Turnstile verification won't work until these are set up:

### 1. Domain Setup (Cloudflare Email Sending)

Email sending requires a domain to be onboarded to Cloudflare Email Sending. Until this is done, `env.EMAIL.send()` calls will fail silently (see Error Handling below).

**Steps:**
1. Register or transfer your domain to Cloudflare (or add it to an existing Cloudflare account)
2. Run the CLI command to enable Email Sending (exact command varies by version — verify with current wrangler docs):
   ```bash
   npx wrangler email sending enable yourdomain.com
   ```
3. Update `wrangler.jsonc` to use your real domain:
   ```jsonc
   "vars": {
     "CONTACT_FROM_ADDRESS": "hello@yourdomain.com",
     "OWNER_NOTIFICATION_ADDRESS": "owner@yourdomain.com"
   }
   ```

### 2. Turnstile Widget Setup

Turnstile provides bot protection on the contact form.

**Steps:**
1. Go to Cloudflare Dashboard → Turnstile
2. Create a new site, select "Managed" mode
3. Get your Site Key (public) and Secret Key (private)
4. Add the Site Key to `wrangler.jsonc`:
   ```jsonc
   "vars": {
     "TURNSTILE_SITE_KEY": "your_site_key"
   }
   ```
5. Add the Secret Key as a Worker secret:
   ```bash
   wrangler secret put TURNSTILE_SECRET_KEY
   ```
   For local dev, add it to `.dev.vars`:
   ```
   TURNSTILE_SECRET_KEY=your_secret_key
   ```

**For testing before a real widget exists:** Use Cloudflare's published test keys:
- Always-pass: `1x00000000000000000000AA`
- Always-block: `2x00000000000000000000AB`

### 3. GitHub Secrets (for CI/CD)

Set up these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN`: A Cloudflare API token with Workers Edit scope
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

The GitHub Actions workflow will use these to deploy on push to `main`.

### 4. Hero Background Image

The hero section uses a placeholder for the background image at `public/images/hero-door.jpg`. 

**To add the real image:**
1. Source or download a suitable image (weathered wood door framed by ivy, moody/atmospheric aesthetic)
2. Optimize it for web (e.g., WebP, ~1-2MB max)
3. Save it as `public/images/hero-door.jpg`
4. (Optional) Configure responsive images in the Hero component if using very high resolution

## Deployment

### To Cloudflare Workers

#### Option 1: GitHub Actions (Automated)
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys (if secrets are configured)
3. Check the Actions tab for deploy status

#### Option 2: Manual via wrangler CLI
```bash
wrangler deploy
```

## Project Structure

```
src/
├── pages/
│   ├── index.astro           # English (default, unprefixed)
│   ├── es/index.astro        # Spanish
│   ├── gl/index.astro        # Galician
│   └── api/contact.ts        # Contact form API route
├── components/
│   ├── Header.astro          # Sticky header with language switcher
│   ├── Hero.astro            # Full-bleed hero section
│   ├── ContactSection.astro  # Contact/waitlist section
│   ├── ContactForm.astro     # Contact form with Turnstile
│   └── Footer.astro          # Footer with social links
├── layouts/
│   └── BaseLayout.astro      # Main page layout
├── i18n/
│   ├── en.ts / es.ts / gl.ts # Translated copy
│   └── utils.ts              # i18n helper
├── emails/
│   ├── confirmationEmail.ts  # Confirmation email builder
│   └── notificationEmail.ts  # Owner notification email builder
├── lib/
│   ├── validate.ts           # Form validation
│   └── turnstileVerify.ts    # Turnstile verification
└── styles/
    └── global.css            # Global Tailwind + custom styles
```

## Locales & Routing

The site uses Astro's built-in i18n routing:
- `/` → English (default, unprefixed)
- `/es/` → Spanish
- `/gl/` → Galician

Each locale is fully prerendered as a static page for optimal performance and SEO.

The header language switcher uses real locale links (`<a href>`) rather than client-side JS state swaps, so each language has its own crawlable URL.

## Contact Form Flow

1. **Client-side:**
   - User fills form (name, optional gender, age, email)
   - Client-side validation checks required fields and email format
   - Turnstile widget is solved
   - Form is submitted via `fetch` to `/api/contact`
   - On success, form is replaced with success message (no page reload)

2. **Server-side:**
   - Re-validates all form data (never trust client)
   - Verifies Turnstile token via siteverify API
   - Sends confirmation email to the user (in their language)
   - Sends notification email to the owner (always in English)
   - Returns `{ success: true }` JSON

3. **Email Delivery:**
   - Confirmation: warm, on-theme thank-you (locale-specific)
   - Notification: structured data dump for internal use, tagged with the visitor's locale

## Error Handling

### Email Sending Failures

If the domain isn't yet onboarded to Cloudflare Email Sending, the API route will catch the error and:
- Log the failure to the console (visible via `wrangler tail`)
- Still return `success: true` to the user (since we received the submission)

This is a deliberate trade-off: email failures shouldn't block form submissions. Once the domain is onboarded, emails will start arriving automatically.

### Turnstile Verification Failures

If Turnstile verification fails, the form will:
- Return a `400` response with `success: false`
- Display a retryable error message in the UI
- Not send any emails

## Design Reference

The visual design and layout specifications are documented in `design/Grace and Wise Words - Landing Page.html` (a Claude Design export). This file is **not** part of the production build and can be deleted or archived once the frontend is complete.

## Testing

### Local with Test Keys

1. Use Turnstile's always-pass test key in `.dev.vars` for development
2. Form validation works client- and server-side
3. Email sends fail gracefully if domain isn't onboarded (expected behavior)

### End-to-End After Prerequisites

Once domain + Turnstile are set up:
1. Visit each locale (`/`, `/es/`, `/gl/`)
2. Submit the form and confirm:
   - User receives a confirmation email in their language
   - Owner receives a notification email with all submitted data
   - Both emails have proper formatting and no placeholder text

## Future Enhancements

- Multi-language switcher as a client-side JS toggle (instead of real URLs) for faster perceived performance
- CRM integration to store submissions
- Advanced rate limiting beyond Turnstile
- Analytics integration
- Social media link management
- Support for additional locales

## License

All rights reserved © 2026 lendalore
