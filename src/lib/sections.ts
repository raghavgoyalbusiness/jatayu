/**
 * Single source of truth for the scroll narrative.
 *
 * Every section owns a camera keyframe. The rig interpolates between adjacent
 * keyframes as scroll progress moves through section space (0 → N-1), so the
 * DOM rail, the annotations and the camera never disagree about where we are.
 */

export type Vec3 = [number, number, number]

export interface CameraKeyframe {
  /** Camera position in world space. */
  position: Vec3
  /** Point the camera looks at. */
  target: Vec3
  /** Vertical FOV in degrees. */
  fov: number
}

export interface Annotation {
  id: string
  /**
   * Which space `anchor` is expressed in. `airframe` anchors ride the primary
   * airframe's rotation; `hostile` anchors ride the intruder.
   */
  frame: 'airframe' | 'hostile'
  /** Anchor point in the chosen local space. */
  anchor: Vec3
  /** Offset of the label from the anchor, in local units. */
  offset: Vec3
  label: string
  value: string
}

export interface SectionDef {
  id: string
  /** Two-digit index used by the rail and the section headers. */
  index: string
  /** Short label for the progress rail. */
  rail: string
  camera: CameraKeyframe
  annotations: Annotation[]
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'hero',
    index: '01',
    rail: 'Overview',
    camera: {
      position: [4.6, 1.5, 6.4],
      target: [0, 0, 0],
      fov: 34,
    },
    annotations: [
      {
        id: 'hero-airframe',
        frame: 'airframe',
        anchor: [0, 0.24, -0.35],
        offset: [1.15, 0.95, 0],
        label: '[AIRFRAME DESIGNATION]',
        value: 'HYBRID VTOL / FIXED-WING',
      },
      {
        id: 'hero-state',
        frame: 'airframe',
        anchor: [0, -0.14, 1.5],
        offset: [-0.55, -1.15, 0],
        label: 'STATE',
        value: 'LOITER — AUTONOMOUS',
      },
    ],
  },
  {
    id: 'platform',
    index: '02',
    rail: 'Platform',
    camera: {
      position: [3.9, 1.05, 5.1],
      target: [0.1, -0.05, 0.2],
      fov: 32,
    },
    annotations: [
      {
        id: 'plat-bay',
        frame: 'airframe',
        anchor: [0, -0.22, 0.32],
        offset: [0.62, -0.5, 0],
        label: 'PAYLOAD BAY',
        value: '[X.X] KG / MODULAR',
      },
      {
        id: 'plat-rotor',
        frame: 'airframe',
        anchor: [1.02, 0.06, 0.62],
        offset: [-0.3, 1.45, 0],
        label: 'LIFT ROTOR — FWD STBD',
        value: 'ONE OF FOUR',
      },
      {
        id: 'plat-comms',
        frame: 'airframe',
        anchor: [0, 0.3, -0.9],
        offset: [1.05, 0.32, 0],
        label: 'COMMS MAST',
        value: '[BAND] MESH / [BAND] SATCOM',
      },
    ],
  },
  {
    id: 'navigation',
    index: '03',
    rail: 'Nav (GPS-denied)',
    camera: {
      position: [2.4, -1.15, 5.0],
      target: [0, 0.15, -0.5],
      fov: 40,
    },
    annotations: [
      {
        id: 'nav-vio',
        frame: 'airframe',
        anchor: [0, -0.3, 0.95],
        offset: [0.62, 1.0, 0],
        label: 'VIO SENSOR HEAD',
        value: 'STEREO + IMU, [XXX] HZ',
      },
      {
        id: 'nav-terrain',
        frame: 'airframe',
        anchor: [0, -0.34, -0.25],
        offset: [1.35, -0.55, 0],
        label: 'TERRAIN CORRELATOR',
        value: 'DEM MATCH / NO GNSS',
      },
    ],
  },
  {
    id: 'counter-autonomy',
    index: '04',
    rail: 'Counter-autonomy',
    camera: {
      position: [6.6, 3.6, 7.2],
      target: [0.95, 0.55, -1.2],
      fov: 42,
    },
    annotations: [
      {
        id: 'ca-sensor',
        frame: 'airframe',
        anchor: [0, 0.16, 1.35],
        offset: [1.5, 2.0, 0],
        label: 'DETECTION APERTURE',
        value: 'RF + EO/IR FUSION',
      },
      {
        id: 'ca-track',
        frame: 'hostile',
        anchor: [0, 0.06, -0.1],
        offset: [-1.5, 1.5, 0],
        label: 'TRACK [NNNN]',
        value: 'UNCOOPERATIVE — CLASSIFIED HOSTILE',
      },
    ],
  },
  {
    id: 'deployment',
    index: '05',
    rail: 'Deployment',
    camera: {
      position: [10.5, 4.2, 12.5],
      target: [0, 0, 0],
      fov: 40,
    },
    annotations: [],
  },
  {
    id: 'contact',
    index: '06',
    rail: 'Contact',
    camera: {
      position: [13.5, 5.6, 15.5],
      target: [0, 0, 0],
      fov: 38,
    },
    annotations: [],
  },
]

export const SECTION_COUNT = SECTIONS.length
