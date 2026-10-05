export interface Satellite {
  name: string;
  distKm: number;
  radius: number;
  color: string;
  inclinationDeg: number;
  periodDays: number;
  diameterKm: number;
  massKg: string;
  massNum: number;
}

export interface SolarPlanet {
  name: string;
  distAU: number;
  radius: number;
  textureUrl: string;
  color: string;
  speed: number;
  hasRings?: boolean;
  satellites: Satellite[];
}

export interface TerrestrialBody {
  name: string;
  diameterKm: number;
  massKg: string;
  massNum: number;
  textureUrl: string;
  color: string;
}

export const TERRESTRIAL_BODIES: TerrestrialBody[] = [
  { name: 'Tierra', diameterKm: 12742, massKg: '5.972 × 10²⁴ kg', massNum: 5.972e24, textureUrl: '/textures/earth.jpg', color: '#3b82f6' },
  { name: 'Venus', diameterKm: 12104, massKg: '4.867 × 10²⁴ kg', massNum: 4.867e24, textureUrl: '/textures/venus.jpg', color: '#fcd34d' },
  { name: 'Marte', diameterKm: 6779, massKg: '6.417 × 10²³ kg', massNum: 6.417e23, textureUrl: '/textures/mars.jpg', color: '#ef4444' },
  { name: 'Mercurio', diameterKm: 4879, massKg: '3.301 × 10²³ kg', massNum: 3.301e23, textureUrl: '/textures/mercury.jpg', color: '#a3a3a3' },
  { name: 'Luna', diameterKm: 3475, massKg: '7.342 × 10²² kg', massNum: 7.342e22, textureUrl: '/textures/mercury.jpg', color: '#e2e8f0' },
];

export const SOLAR_SYSTEM_PLANETS: SolarPlanet[] = [
  {
    name: 'Mercurio',
    distAU: 0.387,
    radius: 0.5,
    textureUrl: '/textures/mercury.jpg',
    color: '#a3a3a3',
    speed: 0.4,
    satellites: [],
  },
  {
    name: 'Venus',
    distAU: 0.723,
    radius: 0.8,
    textureUrl: '/textures/venus.jpg',
    color: '#fcd34d',
    speed: 0.25,
    satellites: [],
  },
  {
    name: 'Tierra',
    distAU: 1.000,
    radius: 0.9,
    textureUrl: '/textures/earth.jpg',
    color: '#3b82f6',
    speed: 0.18,
    satellites: [
      { name: 'Luna', distKm: 384400, radius: 0.27, color: '#e2e8f0', inclinationDeg: 5.14, periodDays: 27.3, diameterKm: 3475, massKg: '7.342 × 10²² kg', massNum: 7.342e22 },
    ],
  },
  {
    name: 'Marte',
    distAU: 1.524,
    radius: 0.65,
    textureUrl: '/textures/mars.jpg',
    color: '#ef4444',
    speed: 0.12,
    satellites: [
      { name: 'Fobos', distKm: 9377, radius: 0.14, color: '#a8a29e', inclinationDeg: 1.09, periodDays: 0.32, diameterKm: 22.5, massKg: '1.066 × 10¹⁶ kg', massNum: 1.066e16 },
      { name: 'Deimos', distKm: 23460, radius: 0.11, color: '#78716c', inclinationDeg: 0.93, periodDays: 1.26, diameterKm: 12.4, massKg: '1.476 × 10¹⁵ kg', massNum: 1.476e15 },
    ],
  },
  {
    name: 'Júpiter',
    distAU: 5.204,
    radius: 2.2,
    textureUrl: '/textures/jupiter.jpg',
    color: '#fdba74',
    speed: 0.07,
    satellites: [
      { name: 'Ío', distKm: 421700, radius: 0.26, color: '#fef08a', inclinationDeg: 0.05, periodDays: 1.77, diameterKm: 3643, massKg: '8.932 × 10²² kg', massNum: 8.932e22 },
      { name: 'Europa', distKm: 670900, radius: 0.23, color: '#e0f2fe', inclinationDeg: 0.47, periodDays: 3.55, diameterKm: 3122, massKg: '4.800 × 10²² kg', massNum: 4.800e22 },
      { name: 'Ganímedes', distKm: 1070400, radius: 0.38, color: '#cbd5e1', inclinationDeg: 0.20, periodDays: 7.15, diameterKm: 5268, massKg: '1.482 × 10²³ kg', massNum: 1.482e23 },
      { name: 'Calisto', distKm: 1882700, radius: 0.35, color: '#94a3b8', inclinationDeg: 0.28, periodDays: 16.69, diameterKm: 4821, massKg: '1.076 × 10²³ kg', massNum: 1.076e23 },
      { name: 'Himalia', distKm: 11460000, radius: 0.15, color: '#a1a1aa', inclinationDeg: 27.5, periodDays: 250.6, diameterKm: 140, massKg: '4.200 × 10¹⁸ kg', massNum: 4.2e18 },
      { name: 'Elara', distKm: 11740000, radius: 0.13, color: '#71717a', inclinationDeg: 26.6, periodDays: 259.6, diameterKm: 86, massKg: '8.700 × 10¹⁷ kg', massNum: 8.7e17 },
      { name: 'Pasífae', distKm: 23620000, radius: 0.12, color: '#78716c', inclinationDeg: 151.4, periodDays: 743.6, diameterKm: 60, massKg: '3.000 × 10¹⁷ kg', massNum: 3.0e17 },
      { name: 'Carme', distKm: 23400000, radius: 0.12, color: '#a8a29e', inclinationDeg: 164.9, periodDays: 734.2, diameterKm: 46, massKg: '1.300 × 10¹⁷ kg', massNum: 1.3e17 },
      { name: 'Ananke', distKm: 21280000, radius: 0.11, color: '#52525b', inclinationDeg: 148.9, periodDays: 629.8, diameterKm: 28, massKg: '3.000 × 10¹⁶ kg', massNum: 3.0e16 },
      { name: 'Sinope', distKm: 23930000, radius: 0.11, color: '#a3a3a3', inclinationDeg: 158.1, periodDays: 758.9, diameterKm: 38, massKg: '7.500 × 10¹⁶ kg', massNum: 7.5e16 },
      { name: 'Lisitea', distKm: 11720000, radius: 0.11, color: '#d4d4d8', inclinationDeg: 28.3, periodDays: 259.2, diameterKm: 36, massKg: '6.300 × 10¹⁶ kg', massNum: 6.3e16 },
      { name: 'Metis', distKm: 128000, radius: 0.13, color: '#fef08a', inclinationDeg: 0.06, periodDays: 0.29, diameterKm: 43, massKg: '3.600 × 10¹⁶ kg', massNum: 3.6e16 },
    ],
  },
  {
    name: 'Saturno',
    distAU: 9.582,
    radius: 1.8,
    textureUrl: '/textures/saturn.jpg',
    color: '#fde047',
    speed: 0.04,
    hasRings: true,
    satellites: [
      { name: 'Mimas', distKm: 185520, radius: 0.16, color: '#e2e8f0', inclinationDeg: 1.57, periodDays: 0.94, diameterKm: 396, massKg: '3.750 × 10¹⁹ kg', massNum: 3.75e19 },
      { name: 'Encélado', distKm: 238020, radius: 0.18, color: '#ffffff', inclinationDeg: 0.02, periodDays: 1.37, diameterKm: 504, massKg: '1.080 × 10²⁰ kg', massNum: 1.08e20 },
      { name: 'Tetis', distKm: 294660, radius: 0.22, color: '#cbd5e1', inclinationDeg: 1.12, periodDays: 1.89, diameterKm: 1062, massKg: '6.170 × 10²⁰ kg', massNum: 6.17e20 },
      { name: 'Dione', distKm: 377400, radius: 0.23, color: '#94a3b8', inclinationDeg: 0.02, periodDays: 2.74, diameterKm: 1123, massKg: '1.095 × 10²¹ kg', massNum: 1.095e21 },
      { name: 'Rea', distKm: 527040, radius: 0.28, color: '#cbd5e1', inclinationDeg: 0.35, periodDays: 4.52, diameterKm: 1527, massKg: '2.306 × 10²¹ kg', massNum: 2.306e21 },
      { name: 'Titán', distKm: 1221830, radius: 0.42, color: '#fde047', inclinationDeg: 0.35, periodDays: 15.95, diameterKm: 5150, massKg: '1.345 × 10²³ kg', massNum: 1.345e23 },
      { name: 'Hiperión', distKm: 1481100, radius: 0.15, color: '#d97706', inclinationDeg: 0.57, periodDays: 21.28, diameterKm: 270, massKg: '5.600 × 10¹⁸ kg', massNum: 5.6e18 },
      { name: 'Jápeto', distKm: 3561300, radius: 0.27, color: '#64748b', inclinationDeg: 15.47, periodDays: 79.33, diameterKm: 1469, massKg: '1.805 × 10²¹ kg', massNum: 1.805e21 },
      { name: 'Febe', distKm: 12955700, radius: 0.14, color: '#475569', inclinationDeg: 175.3, periodDays: 550.3, diameterKm: 213, massKg: '8.290 × 10¹⁸ kg', massNum: 8.29e18 },
      { name: 'Jano', distKm: 151470, radius: 0.13, color: '#94a3b8', inclinationDeg: 0.16, periodDays: 0.69, diameterKm: 179, massKg: '1.890 × 10¹⁸ kg', massNum: 1.89e18 },
      { name: 'Epimeteo', distKm: 151410, radius: 0.12, color: '#64748b', inclinationDeg: 0.35, periodDays: 0.69, diameterKm: 116, massKg: '5.260 × 10¹⁷ kg', massNum: 5.26e17 },
      { name: 'Pan', distKm: 133580, radius: 0.11, color: '#fef08a', inclinationDeg: 0.0, periodDays: 0.58, diameterKm: 28, massKg: '4.950 × 10¹⁵ kg', massNum: 4.95e15 },
    ],
  },
  {
    name: 'Urano',
    distAU: 19.201,
    radius: 1.3,
    textureUrl: '/textures/uranus.jpg',
    color: '#7dd3fc',
    speed: 0.025,
    satellites: [
      { name: 'Miranda', distKm: 129390, radius: 0.17, color: '#cbd5e1', inclinationDeg: 4.23, periodDays: 1.41, diameterKm: 471, massKg: '6.590 × 10¹⁹ kg', massNum: 6.59e19 },
      { name: 'Ariel', distKm: 191020, radius: 0.24, color: '#e2e8f0', inclinationDeg: 0.26, periodDays: 2.52, diameterKm: 1158, massKg: '1.353 × 10²¹ kg', massNum: 1.353e21 },
      { name: 'Umbriel', distKm: 266000, radius: 0.23, color: '#64748b', inclinationDeg: 0.20, periodDays: 4.14, diameterKm: 1169, massKg: '1.220 × 10²¹ kg', massNum: 1.22e21 },
      { name: 'Titania', distKm: 435910, radius: 0.32, color: '#94a3b8', inclinationDeg: 0.34, periodDays: 8.71, diameterKm: 1578, massKg: '3.527 × 10²¹ kg', massNum: 3.527e21 },
      { name: 'Oberón', distKm: 583520, radius: 0.31, color: '#475569', inclinationDeg: 0.05, periodDays: 13.46, diameterKm: 1523, massKg: '3.014 × 10²¹ kg', massNum: 3.014e21 },
      { name: 'Puck', distKm: 86000, radius: 0.13, color: '#334155', inclinationDeg: 0.31, periodDays: 0.76, diameterKm: 162, massKg: '2.900 × 10¹⁸ kg', massNum: 2.9e18 },
      { name: 'Cordelia', distKm: 49800, radius: 0.11, color: '#94a3b8', inclinationDeg: 0.08, periodDays: 0.33, diameterKm: 40, massKg: '4.400 × 10¹⁶ kg', massNum: 4.4e16 },
      { name: 'Ofelia', distKm: 53800, radius: 0.11, color: '#cbd5e1', inclinationDeg: 0.10, periodDays: 0.38, diameterKm: 43, massKg: '5.300 × 10¹⁶ kg', massNum: 5.3e16 },
      { name: 'Bianca', distKm: 59200, radius: 0.11, color: '#e2e8f0', inclinationDeg: 0.19, periodDays: 0.43, diameterKm: 51, massKg: '9.200 × 10¹⁶ kg', massNum: 9.2e16 },
      { name: 'Crésida', distKm: 61800, radius: 0.12, color: '#cbd5e1', inclinationDeg: 0.04, periodDays: 0.46, diameterKm: 80, massKg: '3.400 × 10¹⁷ kg', massNum: 3.4e17 },
      { name: 'Desdémona', distKm: 62700, radius: 0.12, color: '#94a3b8', inclinationDeg: 0.11, periodDays: 0.47, diameterKm: 64, massKg: '1.800 × 10¹⁷ kg', massNum: 1.8e17 },
      { name: 'Julieta', distKm: 64400, radius: 0.12, color: '#e2e8f0', inclinationDeg: 0.06, periodDays: 0.49, diameterKm: 94, massKg: '5.600 × 10¹⁷ kg', massNum: 5.6e17 },
    ],
  },
  {
    name: 'Neptuno',
    distAU: 30.047,
    radius: 1.25,
    textureUrl: '/textures/neptune.jpg',
    color: '#2563eb',
    speed: 0.015,
    satellites: [
      { name: 'Tritón', distKm: 354759, radius: 0.36, color: '#bae6fd', inclinationDeg: 156.8, periodDays: 5.88, diameterKm: 2707, massKg: '2.140 × 10²² kg', massNum: 2.14e22 },
      { name: 'Proteo', distKm: 117647, radius: 0.20, color: '#64748b', inclinationDeg: 0.52, periodDays: 1.12, diameterKm: 420, massKg: '4.400 × 10¹⁹ kg', massNum: 4.4e19 },
      { name: 'Nereida', distKm: 5513818, radius: 0.18, color: '#94a3b8', inclinationDeg: 7.23, periodDays: 360.1, diameterKm: 340, massKg: '3.100 × 10¹⁹ kg', massNum: 3.1e19 },
      { name: 'Larisa', distKm: 73548, radius: 0.13, color: '#475569', inclinationDeg: 0.20, periodDays: 0.55, diameterKm: 194, massKg: '4.900 × 10¹⁸ kg', massNum: 4.9e18 },
      { name: 'Galatea', distKm: 61953, radius: 0.13, color: '#cbd5e1', inclinationDeg: 0.05, periodDays: 0.43, diameterKm: 176, massKg: '2.100 × 10¹⁸ kg', massNum: 2.1e18 },
      { name: 'Despina', distKm: 52526, radius: 0.12, color: '#94a3b8', inclinationDeg: 0.07, periodDays: 0.33, diameterKm: 156, massKg: '2.100 × 10¹⁸ kg', massNum: 2.1e18 },
      { name: 'Talasa', distKm: 50075, radius: 0.11, color: '#e2e8f0', inclinationDeg: 0.21, periodDays: 0.31, diameterKm: 82, massKg: '3.500 × 10¹⁷ kg', massNum: 3.5e17 },
      { name: 'Náyade', distKm: 48227, radius: 0.11, color: '#cbd5e1', inclinationDeg: 4.75, periodDays: 0.29, diameterKm: 66, massKg: '1.900 × 10¹⁷ kg', massNum: 1.9e17 },
      { name: 'Halimede', distKm: 15728000, radius: 0.11, color: '#38bdf8', inclinationDeg: 134.1, periodDays: 1879.7, diameterKm: 62, massKg: '1.600 × 10¹⁷ kg', massNum: 1.6e17 },
      { name: 'Sao', distKm: 22422000, radius: 0.11, color: '#7dd3fc', inclinationDeg: 48.5, periodDays: 2914.1, diameterKm: 44, massKg: '6.700 × 10¹⁶ kg', massNum: 6.7e16 },
      { name: 'Laomedeia', distKm: 23571000, radius: 0.11, color: '#0284c7', inclinationDeg: 34.7, periodDays: 3161.4, diameterKm: 42, massKg: '5.800 × 10¹⁶ kg', massNum: 5.8e16 },
      { name: 'Psámate', distKm: 46695000, radius: 0.11, color: '#0369a1', inclinationDeg: 137.4, periodDays: 9115.9, diameterKm: 38, massKg: '4.500 × 10¹⁶ kg', massNum: 4.5e16 },
    ],
  },
];
