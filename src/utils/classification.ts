export interface PlanetClass {
  label: string;
  color: string;
}

export function classifyPlanet(planet: any): PlanetClass {
  const m = planet.pl_bmasse; // Earth masses
  const r = planet.pl_rade;   // Earth radii
  const t = planet.pl_eqt;    // Temperature in Kelvin

  // Hot Jupiter
  if ((m > 50 || r > 6) && t > 1000) {
    return { label: 'Hot Jupiter', color: '#ef4444' }; // Red
  }
  // Cold Gas Giant
  if (m > 50 || r > 6) {
    return { label: 'Gas Giant', color: '#f59e0b' }; // Orange
  }
  // Ice Giant / Neptune-like
  if ((m >= 10 && m <= 50) || (r >= 3 && r <= 6)) {
    return { label: 'Ice Giant', color: '#06b6d4' }; // Cyan
  }
  // Hot Super-Earth / Lava World
  if (m < 10 && t > 1000) {
    return { label: 'Lava World', color: '#b91c1c' }; // Dark Red
  }
  // Super-Earth
  if ((m >= 2 && m < 10) || (r >= 1.25 && r < 3)) {
    return { label: 'Super-Earth', color: '#10b981' }; // Emerald Green
  }
  // Terrestrial / Rocky
  if ((m !== null && m < 2) || (r !== null && r < 1.25)) {
    return { label: 'Terrestrial', color: '#3b82f6' }; // Blue
  }
  
  // Fallback if data is missing or out of standard constraints
  return { label: 'Unknown Type', color: '#64748b' }; // Slate
}

export function getPlanetRadius(planet: any): { radius: number, isEstimated: boolean, isUnknown: boolean } {
  // If we already have the radius, use it.
  if (planet.pl_rade && planet.pl_rade > 0) {
    return { radius: planet.pl_rade, isEstimated: false, isUnknown: false };
  }

  const m = planet.pl_bmasse; // Earth masses

  // If mass is also null/0, we can't estimate. Return a default and mark as unknown.
  if (!m || m <= 0) {
    return { radius: 1.0, isEstimated: false, isUnknown: true };
  }

  // Estimation based on mass regimes
  let estimatedR: number;
  if (m < 2.0) {
    estimatedR = Math.pow(m, 0.27); // Terrestrial
  } else if (m < 10) {
    estimatedR = Math.pow(m, 0.35); // Super-Earth
  } else if (m < 100) {
    estimatedR = Math.pow(m, 0.4);  // Ice Giant / Neptune
  } else {
    estimatedR = 11.2;              // Gas Giant (Jovian plateau)
  }

  return { radius: Number(estimatedR.toFixed(2)), isEstimated: true, isUnknown: false };
}

export interface StarClass {
  label: string;
  color: string;
}

export function classifyStar(teff: number | null): StarClass {
  if (teff === null) {
    return { label: 'Unknown', color: '#cbd5e1' }; // Slate
  }
  
  if (teff >= 30000) {
    return { label: 'O-Type', color: '#93c5fd' }; // Blue
  } else if (teff >= 10000) {
    return { label: 'B-Type', color: '#bfdbfe' }; // Blue-white
  } else if (teff >= 7500) {
    return { label: 'A-Type', color: '#ffffff' }; // White
  } else if (teff >= 6000) {
    return { label: 'F-Type', color: '#fef08a' }; // Yellow-white
  } else if (teff >= 5200) {
    return { label: 'G-Type', color: '#fcd34d' }; // Yellow
  } else if (teff >= 3700) {
    return { label: 'K-Type', color: '#fb923c' }; // Orange
  } else {
    return { label: 'M-Type', color: '#ef4444' }; // Red
  }
}

export interface PlanetVisuals {
  textureUrl: string;
  tintColor: string;
}

export function getPlanetVisuals(planet: any): PlanetVisuals {
  const t = planet.pl_eqt;    // Temperature in Kelvin

  const baseClass = classifyPlanet(planet).label;
  
  let textureUrl = '/textures/mercury.jpg';
  let tintColor = '#ffffff';

  if (baseClass === 'Hot Jupiter') {
    textureUrl = '/textures/jupiter.jpg';
    tintColor = '#ef4444'; // Red tint
  } else if (baseClass === 'Gas Giant') {
    textureUrl = '/textures/jupiter.jpg';
    tintColor = (t !== null && t < 200) ? '#bfdbfe' : '#fcd34d'; // Frosty blue if cold, orange if normal
  } else if (baseClass === 'Ice Giant') {
    textureUrl = '/textures/neptune.jpg';
    tintColor = '#ffffff'; // Default neptune colors
  } else if (baseClass === 'Lava World') {
    textureUrl = '/textures/venus.jpg';
    tintColor = '#b91c1c'; // Dark red
  } else if (baseClass === 'Super-Earth' || baseClass === 'Terrestrial') {
    if (t !== null && t > 1000) {
       textureUrl = '/textures/venus.jpg';
       tintColor = '#fca5a5';
    } else if (t !== null && t < 200) {
       textureUrl = '/textures/mars.jpg'; 
       tintColor = '#e0f2fe'; // Frosty tint
    } else if (t !== null && t >= 200 && t <= 350) { 
       textureUrl = '/textures/earth.jpg';
       tintColor = '#ffffff'; // Habitable
    } else {
       textureUrl = '/textures/mars.jpg';
       tintColor = '#fca5a5'; // Warm rocky
    }
  }

  return { textureUrl, tintColor };
}
