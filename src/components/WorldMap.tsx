/**
 * Plate-carrée deployment chart.
 *
 * The landmasses are a deliberately coarse generalisation — this is a plotting
 * chart, not a survey product. Node coordinates are placeholders; replace the
 * NODES table with real ones (or with nothing) before this goes anywhere near
 * a customer.
 */

const W = 720
const H = 360
/** Side margin in the viewBox so leader labels are never clipped. */
const PAD = 56

/** Plate carrée: longitude -180..180 → 0..W, latitude 90..-90 → 0..H. */
const px = (lon: number) => ((lon + 180) / 360) * W
const py = (lat: number) => ((90 - lat) / 180) * H

const path = (pts: [number, number][]) =>
  pts.map(([lon, lat], i) => `${i ? 'L' : 'M'}${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`).join('') +
  'Z'

const LAND: [number, number][][] = [
  // North America
  [
    [-168, 65], [-160, 71], [-140, 70], [-125, 70], [-110, 68], [-95, 68],
    [-82, 73], [-64, 60], [-56, 51], [-66, 45], [-70, 42], [-75, 35],
    [-81, 25], [-90, 29], [-97, 26], [-105, 20], [-110, 23], [-115, 30],
    [-124, 40], [-125, 49], [-135, 58], [-150, 59], [-165, 55],
  ],
  // Greenland
  [[-45, 60], [-20, 70], [-20, 82], [-45, 83], [-58, 76], [-55, 66]],
  // South America
  [
    [-81, 8], [-70, 12], [-60, 10], [-50, 0], [-35, -5], [-38, -15],
    [-48, -25], [-58, -35], [-62, -42], [-65, -55], [-72, -52], [-75, -45],
    [-73, -35], [-71, -20], [-76, -10], [-81, -4],
  ],
  // Africa
  [
    [-17, 15], [-16, 22], [-10, 31], [0, 36], [11, 37], [25, 32], [34, 31],
    [35, 22], [39, 15], [43, 11], [51, 12], [48, 2], [41, -2], [40, -10],
    [35, -19], [33, -26], [26, -34], [18, -34], [14, -23], [12, -16],
    [9, -1], [3, 6], [-8, 4], [-13, 9],
  ],
  // Europe + western Russia
  [
    [-10, 36], [-9, 43], [-2, 43], [0, 49], [4, 52], [8, 54], [10, 57],
    [18, 55], [21, 56], [24, 60], [30, 60], [30, 45], [28, 41], [23, 40],
    [19, 42], [14, 38], [12, 45], [6, 44], [-2, 36],
  ],
  // Scandinavia
  [[5, 58], [10, 64], [15, 68], [25, 71], [30, 70], [31, 62], [21, 60], [12, 59]],
  // Britain and Ireland
  [[-6, 50], [-3, 54], [-4, 58], [-6, 58], [-6, 55], [-10, 54], [-8, 51]],
  // Asia
  [
    [30, 45], [40, 45], [50, 45], [60, 55], [70, 72], [90, 76], [110, 77],
    [130, 73], [145, 70], [160, 70], [170, 66], [163, 60], [155, 52],
    [140, 46], [130, 43], [127, 35], [122, 31], [120, 23], [110, 20],
    [105, 10], [100, 6], [95, 16], [90, 22], [80, 15], [77, 8], [72, 20],
    [68, 24], [60, 25], [57, 25], [50, 30], [44, 38], [36, 36], [30, 41],
  ],
  // Japan
  [[130, 32], [135, 34], [140, 36], [142, 42], [145, 44], [141, 45], [138, 37], [133, 34]],
  // Indonesian archipelago, heavily generalised
  [[95, 5], [105, 0], [115, -3], [130, -3], [140, -8], [130, -9], [115, -9], [105, -7]],
  // Australia
  [
    [114, -22], [114, -33], [118, -35], [129, -32], [137, -35], [141, -38],
    [146, -39], [150, -37], [153, -28], [145, -15], [137, -12], [130, -12],
    [125, -14], [117, -20],
  ],
  // New Zealand
  [[172, -34], [174, -37], [178, -38], [176, -41], [172, -44], [168, -47], [166, -45], [170, -42]],
]

interface Node {
  id: string
  label: string
  detail: string
  lon: number
  lat: number
  /**
   * Leader direction and length, in chart units. Set per node rather than
   * derived, because nearby sites (western Europe) collide otherwise.
   */
  dx: number
  dy: number
}

/**
 * ============================ REPLACE THIS TABLE ============================
 *
 * These are NOT real sites, and the coordinates are NOT real locations. They
 * are round-number graticule intersections chosen so that no marker lands on a
 * capital or a known installation — an earlier draft used real city
 * coordinates, which reads as a factual claim about where a defence company
 * operates whatever the label says.
 *
 * Keep it that way until you have sites you are licensed to disclose. When you
 * replace them, replace `ILLUSTRATIVE` in the chart header too.
 * ===========================================================================
 */
const NODES: Node[] = [
  { id: 'n1', label: '[SITE 01]', detail: 'PRIME CONTRACT / ASSEMBLY', lon: -90, lat: 40, dx: -26, dy: 26 },
  { id: 'n2', label: '[SITE 02]', detail: 'INTEGRATION & TEST', lon: -10, lat: 50, dx: -30, dy: -34 },
  { id: 'n3', label: '[SITE 03]', detail: 'SUSTAINMENT PARTNER', lon: 20, lat: 50, dx: 26, dy: -16 },
  { id: 'n4', label: '[SITE 04]', detail: 'REGIONAL SUPPORT', lon: 40, lat: 20, dx: 22, dy: 30 },
  { id: 'n5', label: '[SITE 05]', detail: 'CO-DEVELOPMENT', lon: 130, lat: 30, dx: 24, dy: -28 },
  { id: 'n6', label: '[SITE 06]', detail: 'TRIALS RANGE', lon: 140, lat: -30, dx: -26, dy: 28 },
]

const GRATICULE_LON = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]
const GRATICULE_LAT = [-60, -30, 0, 30, 60]

export function WorldMap({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <figure className="m-0">
      <svg
        viewBox={`${-PAD} 0 ${W + PAD * 2} ${H}`}
        className="w-full"
        role="img"
        aria-labelledby="deployment-map-title deployment-map-desc"
      >
        <title id="deployment-map-title">
          Illustrative deployment chart — placeholder positions
        </title>
        <desc id="deployment-map-desc">
          A generalised world chart in plate-carrée projection. The six markers are
          placeholders at notional coordinates and do not represent real sites:{' '}
          {NODES.map((n) => `${n.label} ${n.detail}`).join('; ')}.
        </desc>

        {/* Graticule */}
        <g stroke="var(--color-g2)" strokeWidth="1" fill="none" shapeRendering="crispEdges">
          {GRATICULE_LON.map((lon) => (
            <line key={lon} x1={px(lon)} y1={0} x2={px(lon)} y2={H} />
          ))}
          {GRATICULE_LAT.map((lat) => (
            <line key={lat} x1={0} y1={py(lat)} x2={W} y2={py(lat)} />
          ))}
        </g>

        {/* Equator, drawn one step brighter as the datum line. */}
        <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="var(--color-g3)" strokeWidth="1" strokeDasharray="2 4" />

        {/* Landmasses */}
        <g
          fill="var(--color-g1)"
          stroke="var(--color-g3)"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.9"
        >
          {LAND.map((poly, i) => (
            <path key={i} d={path(poly)} />
          ))}
        </g>

        {/* Frame */}
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="none" stroke="var(--color-g2)" />

        {/* Nodes */}
        <g>
          {NODES.map((n, i) => {
            const x = px(n.lon)
            const y = py(n.lat)
            // Elbow first, then a horizontal run the label sits on.
            const ex = x + n.dx
            const ey = y + n.dy
            const run = n.dx < 0 ? -22 : 22
            const left = n.dx < 0
            return (
              <g key={n.id}>
                {!reducedMotion && (
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    className="map-pulse"
                    style={{ animationDelay: `${i * 0.62}s` }}
                  />
                )}
                <circle cx={x} cy={y} r="2.4" fill="var(--color-accent)" />
                <path
                  d={`M${x} ${y}L${ex} ${ey}h${run}`}
                  fill="none"
                  stroke="var(--color-g3)"
                  strokeWidth="1"
                />
                <text
                  x={ex + run + (left ? -5 : 5)}
                  y={ey - 4}
                  textAnchor={left ? 'end' : 'start'}
                  className="map-label"
                >
                  {n.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      <figcaption className="mt-4 border-t border-g2 pt-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {NODES.map((n) => (
            <span key={n.id} className="tick-label">
              <span className="text-g4">{n.label}</span>
              <span className="ml-2">{n.detail}</span>
            </span>
          ))}
        </div>
        {/* Stated on the artefact, not just in the repo. A chart of dots on a
            world map reads as a claim about where a defence company operates,
            and the labels alone are not enough to withdraw it. */}
        <p className="mt-4 mb-0 font-mono text-[0.6875rem] leading-relaxed text-g3">
          Marker positions are notional and do not identify any real facility,
          partner or country. Nothing on this chart should be read as a statement
          of where Jatayu operates.
        </p>
      </figcaption>
    </figure>
  )
}
