# 海那边 frontend architecture

## Implementation plan

1. Establish locale-prefixed routing and message loading.
2. Define global visual tokens and shared layouts.
3. Keep editable lesson formats, prices, testimonials, and site facts in typed content files.
4. Compose every route from reusable cards, headings, calls to action, and integration boundaries.
5. Verify localization, responsive navigation, keyboard interaction, forms, lint, types, and production build.

## Locale routing

`next-intl` owns `/zh` and `/en`. Chinese is the default and `/` redirects to `/zh`. Locale-aware links come from `src/i18n/navigation.ts`, so switching languages preserves the current pathname. Messages live in `src/messages`.

## Content separation

Interface labels and page copy are JSON messages. Repeated business content lives in `src/content` with localized fields and TypeScript types. Prices have one source: `src/content/pricing.ts`.

## Replaceable components

Image placeholders, pricing cards, testimonials, the header, and the footer can be replaced independently. Page composition and locale routing should remain stable.

## Design system

Palette, spacing, shadows, radius, and font stacks are CSS variables in `src/app/globals.css` and exposed to Tailwind. Chinese system sans-serif fallbacks prioritize legibility; the wordmark uses a restrained serif stack. Ink influence comes from whitespace, fine rules, and one abstract mark rather than themed imagery.
