# Lions MMA — Website

Vancouver's premier MMA and BJJ gym. Two locations on Granville Street.

Built with Astro + TypeScript, deployed on Vercel via GitHub.

---

## Development

```bash
npm install
npm run dev        # starts at localhost:4321
npm run build      # production build
npm run preview    # preview production build locally
```

---

## How to edit the schedule

Open `src/data/schedule.ts`. The entire schedule is a single flat array of `ClassSession` objects.

**Add a class:**
```ts
{ day: 'mon', start: '18:00', end: '19:00', discipline: 'muay-thai', location: '1256', level: 'all', coach: 'Amir Ghassemi' },
```

**Remove a class:** Delete the line.

**Change a time:** Edit the `start` and `end` values. Use 24h format (`'06:00'`, `'18:30'`).

**Valid values:**
- `day`: `'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'`
- `discipline`: `'muay-thai' | 'boxing' | 'bjj-gi' | 'nogi' | 'wrestling' | 'mma' | 'womens' | 'kids' | 'private'`
- `location`: `'1256' | '1133'`
- `level` (optional): `'all' | 'fundamentals' | 'advanced' | 'competition' | 'kids' | 'womens'`
- `coach` (optional): any string

TypeScript will error at build time if you use an invalid value. Push to GitHub and Vercel redeploys automatically.

---

## How to add a blog post

Create a `.md` file in `src/content/blog/`:

```md
---
title: "Your Post Title"
description: "A one-sentence summary."
pubDate: 2025-12-01
author: "Lions MMA"
category: "Training"
---

Your post content here in Markdown.
```

The file name becomes the URL slug: `my-post.md` → `/blog/my-post`.

---

## How to change pricing

Open `src/data/pricing.ts`. Edit the `price` field on any plan object. To add an add-on, push a new object to the `addOns` array.

---

## How to set the free trial form destination

Set the `TRIAL_FORM_EMAIL` environment variable in your Vercel project settings (or in `.env.local` for local dev). The form uses Resend — set `RESEND_API_KEY` as well.

---

## How to add or update coaches

Open `src/data/team.ts`. Add, remove, or edit coach entries. When photos are supplied, place them in `public/images/team/` named by the coach's `id` field (e.g. `amir-ghassemi.jpg`) and set `photoPlaceholder: false`.

---

## Placeholder items to fill before launch

- [ ] Real class schedule — replace placeholder data in `src/data/schedule.ts`
- [ ] Coach photos → `public/images/team/[id].jpg`
- [ ] Hero photography → `public/images/hero.jpg` (replace placeholder div in `src/components/Hero.astro`)
- [ ] Program page hero images → `public/images/programs/[slug].jpg`
- [ ] Confirmed pricing tiers — verify against current rates in `src/data/pricing.ts`
- [ ] Free trial form destination email (`TRIAL_FORM_EMAIL` env var on Vercel)
- [ ] Resend API key (`RESEND_API_KEY` env var on Vercel)
- [ ] Blog posts — 41 posts on current site, confirm whether to migrate
- [ ] Hours of operation per location
