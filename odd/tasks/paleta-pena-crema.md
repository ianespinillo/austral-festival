# Feature: paleta-pena-crema

## Objective
Rework the site palette from the dark wine/plum theme to a warm cream base with browns, themed as a family peña (folk gathering). Pleasant, warm, high-contrast.

## Problem / Why
Current theme is a dark plum ("wine") palette. User asked for a cream-based palette themed as a family peña, with browns and variations, applying good design theory.

## Scope
- `app/globals.css` — token layer: cream base, brown ramp, honey accent; rename plum tokens to cacao family (no consumers).
- The 7 UI files that hardcode the old dark plum hexes: `app/page.tsx`, `app/layout.tsx`, `app/validar/page.tsx`, `components/validar/login-form.tsx`, `components/validar/validation-panel.tsx`, `components/validar/ticket-card.tsx`, `components/purchase/purchase-form.tsx`, `app/compra/exito/page.tsx`.
- Out of scope: `lib/fulfillment.ts` (email template), `lib/qr.ts` (QR colors), `components/purchase/reconcile-poller.tsx` (already light-friendly amber), fonts.

## Design direction (good design theory)
- Warm analogous scheme (cream → tan → caramel/honey → cacao → espresso). One dominant neutral (cream), one accent (honey/caramel), deep espresso for text (AAA contrast ≈ 11.8:1 on cream).
- Dark cacao reserved ONLY for the hero photo overlay + the dark eyebrow chip over the photo (contrast anchors). Everything else light.
- Honey/gold gradient CTAs kept (already in the brown family); dark text on them shifts from purple-black to warm espresso.

## Tasks
### T1 — Retheme tokens + remap hardcoded hexes to cream/brown (writer: delegated general)
- [ ] Token layer in `app/globals.css` per spec handoff (exact values).
- [ ] Remap hexes and amber utilities in the 7 UI files per spec handoff.
- [ ] Verify: `pnpm build` succeeds; `pnpm lint` clean; no leftover old hexes.

## Authorized scope
Palette/UI-color changes only. No copy changes, no structural redesign, no backend changes.

## Acceptance criteria
- Cream base throughout; browns for text/surfaces; honey/caramel accents; AA/AAA contrast for text.
- No old plum hexes or low-contrast light-amber-on-cream text remain (except intended dark pocket: hero eyebrow chip).
- `pnpm build` passes.

## Checks
- `pnpm build` (prisma generate + next build)
- `pnpm lint` (eslint)
- Grep: no `#361E32|#2A1527|#42263D|#3D233B|#4A2C45|#52314E|#563452` left in UI files.

## Progress / Evidence
- T1: ✅ Delegated writer (`general`) applied token layer + remapped all 7 UI files.
  - Verification: `pnpm lint` PASS (eslint exit 0); `pnpm build` PASS (Next.js production build, TypeScript passed, 3 static pages).
  - Self-check: `git grep` old plum hexes → 0 matches; only intended dark pocket (hero eyebrow chip, page.tsx L91-92, L101) keeps light ambers.
  - Spot-check (orchestrator): re-ran leftover-hex grep → clean; 9 files, +184/−184; fixed stale comment page.tsx:76.
- Work-unit commit (branch feat/paleta-pena-crema): style(theme) message, base 1674513.

## Next step
Verify writer output, spot-check, work-unit commit on `feat/paleta-pena-crema`.