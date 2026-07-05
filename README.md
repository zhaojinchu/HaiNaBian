# 海那边 frontend prototype

A bilingual, responsive frontend for a private Chinese tutoring service in Dubai. Chinese is the default language. Booking, payment, and contact delivery are intentionally simulated.

## Requirements

- Node.js 20.9 or newer (Node 24 LTS recommended)
- npm

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`; the root redirects to `/zh`.

Quality commands:

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

## Localization

Routes are locale-prefixed under `src/app/[locale]`. Interface and page copy live in:

- `src/messages/zh.json`
- `src/messages/en.json`

The locale switch uses `next-intl` navigation and preserves the current page. Add translated interface copy to both message files using matching keys.

## Editable content

Repeated, structured content is centralized in `src/content`:

- `lessons.ts` — lesson descriptions, tags, formats, durations
- `pricing.ts` — the only price source
- `testimonials.ts` — explicitly marked placeholders
- `site.ts` — brand descriptor, audiences, contact placeholders, process

Unknown facts remain labelled as pending. Replace them only with teacher-approved content.

## Images

`PlaceholderImage` reserves responsive spaces without remote dependencies. Add approved images to `public/images`, use `next/image`, and replace each placeholder with meaningful localized alt text. `public/favicon.svg` and `public/og-image.svg` are editable brand placeholders.

## Design tokens

Palette and typography variables are at the top of `src/app/globals.css`. Tailwind theme aliases map to those variables, so changing a token updates utilities and custom styles together.

## Future integrations

Replace the internals of these boundary components without changing page composition:

- `src/components/integrations/BookingProvider.tsx`
- `src/components/integrations/PaymentProvider.tsx`
- `src/components/integrations/ContactFormProvider.tsx`

Do not collect or transmit data until privacy copy, policy details, provider configuration, and server-side validation are complete.

## Deploy to Vercel

1. Import the repository in Vercel.
2. Keep the detected Next.js build settings.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin (without a trailing slash).
4. Deploy and verify both locale trees, sitemap, metadata, and form simulation.

No database or secret environment variables are required for this prototype.
