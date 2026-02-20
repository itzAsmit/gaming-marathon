
## Changes Required

Two files need to be updated:

### 1. `src/components/VideoBackground.tsx` — Top-right nav bar

**Current state:** Only an "ADMIN" glass button in the top-right corner.

**New state:** Add "MEET PLAYERS" and "LEADERBOARD" as plain text links (no button styling) to the left of the ADMIN button. They scroll to their respective sections on click.

The nav bar will read:  `MEET PLAYERS   LEADERBOARD   ADMIN`

- MEET PLAYERS and LEADERBOARD: plain text, `hsl(var(--cream))`, Cinzel font, small tracking, hover underline/opacity effect, `cursor: none` safe (custom cursor handles pointer).
- ADMIN: stays as the existing glass-card pill button.

---

### 2. `src/components/sections/HeroSection.tsx` — Hero CTA buttons

**Current state:** "VIEW LEADERBOARD" (gold button) + "MEET PLAYERS" (glass button).

**New state:**
- Row 1: **APPLY NOW** — large golden button (same gradient gold style as the current VIEW LEADERBOARD button, same glow). This is the primary CTA. Clicking it can open a link or scroll — since no URL was specified, it will open a placeholder `#` link styled as a button.
- Row 2 (below, smaller gap): **JOIN WHATSAPP** (glass card, WhatsApp green tint icon) + **JOIN DISCORD** (glass card, Discord purple tint icon) side by side.

Layout:
```text
         [ APPLY NOW ]
  [ JOIN WHATSAPP ]  [ JOIN DISCORD ]
```

Both social buttons will use a glass-card style with small brand-colored left-border accent and matching icon from lucide-react (MessageCircle for WhatsApp, since lucide has no brand icons — or just text labels with colored dots).

---

### Technical Details

**VideoBackground.tsx changes:**
- Add two `<button>` elements before the ADMIN `<Link>` that call `document.getElementById(...).scrollIntoView(...)` on click.
- Style: `text-xs font-cinzel tracking-widest` with `color: hsl(var(--cream) / 0.8)`, hover `opacity-100`, no background, no border.

**HeroSection.tsx changes:**
- Replace the existing two-button flex row with:
  - A single golden APPLY NOW button (full-width on mobile, auto on desktop), linking to `#apply`.
  - Below it, a flex row with JOIN WHATSAPP and JOIN DISCORD glass buttons.
- APPLY NOW inherits the gold gradient + glow from the old VIEW LEADERBOARD button.
- JOIN WHATSAPP will have a subtle green glow/border on hover.
- JOIN DISCORD will have a subtle indigo glow/border on hover.
- Both social buttons have placeholder `href` (`#`) that can be updated later with real links.
