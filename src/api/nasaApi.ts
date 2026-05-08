export interface PlanetData {
  pl_name: string;
  hostname: string;
  pl_orbper: number | null;
  pl_orbeccen: number | null;
  pl_orbsmax: number | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  st_teff: number | null;
  st_rad: number | null;
  st_lum: number | null;
  st_mass: number | null;
  ra: number | null;
  dec: number | null;
  sy_dist: number | null;
}

export const searchStarSystem = async (starName: string): Promise<PlanetData[]> => {
  // Using the Vite proxy we configured earlier
  const baseUrl = '/TAP/sync';
  
  // Query NASA Exoplanet archive with ADQL
  // Using default_flag = 1 to get the widely accepted parameters and avoid duplicates
  // Using lower(hostname) like '%...%' to fetch clusters
  const query = `select pl_name,hostname,pl_orbper,pl_orbeccen,pl_orbsmax,pl_rade,pl_bmasse,pl_eqt,st_teff,st_rad,st_lum,st_mass,ra,dec,sy_dist from ps where lower(hostname) like '%${starName.toLowerCase()}%' and default_flag = 1`;
  
  const params = new URLSearchParams({
    query: query,
    format: 'json'
  });

  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as PlanetData[];
  } catch (error) {
    console.error('Failed to fetch from NASA TAP:', error);
    throw error;
  }
};

export const searchStarsByDistanceRange = async (fromLy: number, toLy: number): Promise<PlanetData[]> => {
  const baseUrl = '/TAP/sync';
  const LY_TO_PC = 3.26156;
  const fromPc = fromLy / LY_TO_PC;
  const toPc = toLy / LY_TO_PC;

  // SELECT TOP 100 for performance as requested
  const query = `select top 100 pl_name,hostname,pl_orbper,pl_orbeccen,pl_orbsmax,pl_rade,pl_bmasse,pl_eqt,st_teff,st_rad,st_lum,st_mass,ra,dec,sy_dist from ps where sy_dist between ${fromPc} and ${toPc} and default_flag = 1 order by sy_dist`;
  
  const params = new URLSearchParams({
    query: query,
    format: 'json'
  });

  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as PlanetData[];
  } catch (error) {
    console.error('Failed to fetch distance range from NASA TAP:', error);
    throw error;
  }
};

export const searchByPreset = async (index: number): Promise<PlanetData[]> => {
  const baseUrl = '/TAP/sync';

  // Math logic for the habitable zone query
  const hzPart = "(pl_orbsmax >= SQRT((st_rad * st_rad * POWER(st_teff / 5778.0, 4)) / 1.1) AND pl_orbsmax <= SQRT((st_rad * st_rad * POWER(st_teff / 5778.0, 4)) / 0.53))";

  let whereClause = "";
  switch (index) {
    case 1:
      whereClause = "sy_dist <= 15.33"; // Nearby (< 50 ly)
      break;
    case 2:
      whereClause = hzPart; // Habitable Zone
      break;
    case 3:
      whereClause = "sy_pnum >= 4"; // Rich Systems
      break;
    case 4:
      whereClause = "pl_bmasse > 100 AND pl_orbper < 10"; // Hot Jupiters
      break;
    case 5:
      whereClause = `${hzPart} AND pl_rade BETWEEN 0.8 AND 1.25`; // Earth 2.0
      break;
    default:
      throw new Error("Invalid preset index");
  }

  // SELECT TOP 100 for performance as requested
  const query = `select top 100 pl_name,hostname,pl_orbper,pl_orbeccen,pl_orbsmax,pl_rade,pl_bmasse,pl_eqt,st_teff,st_rad,st_lum,st_mass,ra,dec,sy_dist from ps where ${whereClause} and default_flag = 1`;
  
  const params = new URLSearchParams({
    query: query,
    format: 'json'
  });

  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as PlanetData[];
  } catch (error) {
    console.error('Failed to fetch preset from NASA TAP:', error);
    throw error;
  }
};
