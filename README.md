# Jatayu — single-page marketing site

Autonomous aerial systems and counter-autonomy, for allied government customers.

React + Vite + TypeScript + Tailwind v4 + `@react-three/fiber` / `drei` /
`postprocessing`. No backend. One static build.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
```

`dist/` is fully static — any file host will serve it. `base` is `./`, so it
also works from a subdirectory.

---

## Everything you need to replace

All placeholder copy is wrapped in `[BRACKETS]`. To find every one:

```bash
grep -rn "\[[A-Z]" src index.html
```

The ones that matter most:

| Placeholder | Where | What it is |
| --- | --- | --- |
| `[AIRFRAME DESIGNATION]` | `src/lib/sections.ts`, `sections/Platform.tsx` | Product name |
| `[JURISDICTION]`, `[YYYY]`, `CAGE [XXXXX]` | `sections/Hero.tsx` | Registration strap |
| `[XX] h`, `[X.X] kg`, `[BAND]`, `[XXXX] m MSL` … | `sections/Platform.tsx` | Spec table |
| `[XXX] Hz`, `[X.X] %`, `[TERRAIN TYPE]` | `sections/Navigation.tsx` | Nav figures |
| `[DESCRIBE ONLY WHAT YOU ARE LICENSED TO DESCRIBE.]` | `sections/CounterAutonomy.tsx` | Effects row |
| `[AUTHORITY]`, `[SECOND AUTHORITY]` | `sections/Deployment.tsx` | Licensing bodies |
| `[SITE 01…06]` + lat/lon | `components/WorldMap.tsx` → `NODES` | Map markers |
| `[contact@example.com]` | `sections/Contact.tsx` → `EMAIL` | The only contact route |
| `[REGISTERED ADDRESS]`, `CO. NO. [XXXXXXXX]` | `sections/Contact.tsx` | Footer |

### Two disclosures that are load-bearing

Both of these are stated on the page itself, not only here. If you edit these
components, keep them.

- **The map markers are not real sites.** `NODES` in `components/WorldMap.tsx`
  sits at round-number graticule intersections chosen so that nothing lands on
  a capital or a known installation. An earlier draft used real city
  coordinates, which reads as a factual claim about where a defence company
  operates however you label it. The chart header says `ILLUSTRATIVE` and the
  caption disclaims the positions outright.
- **The telemetry readout is simulated.** `lib/useTelemetry.ts` generates it
  from a fixed formula in the browser. The panel is labelled "Simulated
  downlink — not a live feed" and its caption sits *before* the numbers in DOM
  order, so a screen reader and a skim-reader both meet the caveat first.

---

## How it is put together

### One source of truth for the narrative

`src/lib/sections.ts` holds the six sections: id, rail label, camera keyframe
(position / target / fov), and the 3D annotation callouts. The rail, the camera
rig and the callouts all read from it, so they cannot disagree about where the
page is. **Retune the camera by editing that file** — nothing else needs to
change.

### Scroll

`src/lib/scrollStore.ts` is a module-level store, deliberately outside React.
It publishes a continuous `progress` in section space (0 → 5) that the 3D reads
every frame, and only the integer active section to React. Re-rendering the
component tree at 60fps to move a camera would be indefensible.

Each section dwells on its own keyframe for the first 55% of its scroll span,
then eases into the next. The camera is then critically damped toward that —
a fast flick still arrives smoothly, a slow scroll tracks one-to-one, and
nothing ever snaps.

### The airframe

`src/three/geometry.ts` builds everything from primitives — extruded planforms,
hex bodies, cones, torus rotor rings. There is no GLTF and nothing to fetch.
Local frame is +Z forward, +Y up, +X starboard, roughly 1:1 with metres.

Each part renders twice: a flat-shaded matte fill and a hairline `EdgesGeometry`
overlay. That is what produces the schematic look rather than a product render.

### Composition

On wide viewports the copy occupies a narrow left column and the camera applies
a 15% horizontal frustum offset (`camera.setViewOffset`) so the subject sits in
the free space on the right. Doing it on the projection instead of the camera
target keeps the framing identical wherever the camera is orbiting.

Callout anchors ride the model's transform, but their labels are offset along
the *camera's* right and up axes — otherwise a label anchored in model space
swings across the copy once per revolution.

---

## Performance and accessibility

These were treated as requirements, not settings.

**`prefers-reduced-motion`** (`lib/useEnvironment.ts`, live — no reload needed):
the scroll rig is replaced by static renders. The camera snaps to whole-section
keyframes, the frame loop drops to `demand` and only renders when the section
changes, idle drift and rotor spin stop, the terrain sweep freezes to a static
band, and film grain is removed.

**Low-end / mobile** (coarse pointer, ≤900px, ≤4 cores, or ≤4GB): DPR pinned to
1, no `EffectComposer` at all, the globe stops rotating, the grid halves its
line count, the camera dollies back 1.6× so the airframe is atmosphere behind
the copy rather than a competitor for it, and the 3D callouts are dropped —
every one duplicates text already in the DOM.

**Loading**: the entire 3D payload is behind `React.lazy` + `Suspense`. Initial
JS is ~30 kB (~11 kB gzipped); three/r3f is a separate ~1.16 MB chunk that never
blocks first paint. The fallback is a monospace boot readout. If WebGL context
creation fails, an error boundary shows a notice and the page below is
completely unaffected.

**Keyboard and screen readers**: the rail is a `<nav>` of real buttons with
`aria-current` and arrow/Home/End roving focus; there is a skip link; the map is
a labelled `<figure>` with a text description of every node; all copy is real
DOM text. The cursor crosshair yields to the native cursor over anything
readable or interactive, and is disabled entirely on touch.

---

## Design tokens

In `src/index.css` under `@theme`. Near-black ground, four steps of grey, one
accent.

| Token | Value | Use |
| --- | --- | --- |
| `--color-ground` | `#08090A` | Page |
| `--color-g1` … `--color-g5` | `#101215` → `#DFE3E7` | Surface, hairline, muted label, body, heading |
| `--color-accent` | `#FFB020` | **Live/active data only** |

The accent rule is load-bearing. On the page it appears on: the active rail
tick, section numbers, live telemetry values, callout anchor dots, the terrain
scan sweep, the detection cone and track reticle, and the map nodes. Nothing
decorative. `PALETTE` in `src/three/materials.ts` mirrors these so the canvas
and the DOM cannot drift.

Type is Inter Tight (headings, one weight above body) and JetBrains Mono (every
numeral, label and readout), both self-hosted via `@fontsource-variable` — no
external font requests. Everything eases on
`cubic-bezier(0.16, 1, 0.3, 1)`; nothing bounces.
