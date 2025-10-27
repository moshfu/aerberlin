# aer berlin Design System – Brutalist refresh

## Palette
- **Background** `#050505` – base canvas
- **Surface** `#0C0C0C` / Elevated `#131313`
- **Border** `#1E1E1E`
- **Foreground** `#F5F5F5`
- **Muted** `#9B9B9B` (labels) + soft overlay `rgba(245,245,245,0.14)`
- **Accent** `#FF1230`
- **Semantic** success `#63D471`, warning `#F2C94C`, danger `#FF3B3B`

## Typography
- **Display**: Bebas Neue (400) – uppercase, tracking −0.02em
- **Body/UI**: Inter (400–700) – tracking 0.02em, line-height 1.6
- Heading scale: H1 72/0.95, H2 48, H3 32

## Rhythm
- Grid container max 1320px, base gutters 20px
- Section spacing 64–80px
- Card radius 6px, small elements 2px
- Thin hairline dividers 1px @ 24% opacity

## Motion
- Global ease `cubic-bezier(0.22,1,0.36,1)`
- Entrance `opacity 0 → 1`, `y 10px → 0` in 240ms, 40ms stagger
- `.spin-slow` mark rotates 360° / 18s, pausing on hover; wobble on reduced motion

## Components
| Component | Before | After |
|-----------|--------|-------|
| Header | rounded neon pill nav | stark top bar, accent tickets, spinning mark |
| Buttons | pill, heavy shadow | square, pixel snap on retro mode, accent glint |
| Cards | soft blur, rounded 24px | hard-edge flyers, thin borders, poster-first |
| Event Card | muted gradient | poster grid, bold date stack, sold-out badge |
| Ticket Tier | soft panels | price-led grid, availability chips |
| Footer | multi-column with icons | editorial stack, Retro Mode toggle, legal strip |

## Retro Mode
- Toggle in footer: adds screen overlay + green dot matrix
- Desaturates imagery 20%, button hover snaps to 2px grid
- CTA buttons fire diagonal glint once per viewport entry

## Motion Notes
- All page lists use Framer Motion staggered entrances
- Hover states limited to subtle scale / translation under 2px
- Prefers-reduced-motion keeps minimal wobble (spin mark) and disables glint
