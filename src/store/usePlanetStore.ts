import { create } from 'zustand';
import type { PlanetData } from '../api/nasaApi';
import type { SolarPlanet, Satellite } from '../data/solarSystemData';

export type ViewMode = 'exoplanets' | 'inner-solar' | 'outer-solar';

interface PlanetStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  planets: PlanetData[];
  setPlanets: (planets: PlanetData[]) => void;
  selectedPlanet: PlanetData | null;
  setSelectedPlanet: (planet: PlanetData | null) => void;
  selectedSolarPlanet: SolarPlanet | null;
  setSelectedSolarPlanet: (planet: SolarPlanet | null) => void;
  selectedSatellite: Satellite | null;
  setSelectedSatellite: (satellite: Satellite | null) => void;
  selectedStarHostname: string | null;
  setSelectedStarHostname: (hostname: string | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const usePlanetStore = create<PlanetStore>((set) => ({
  viewMode: 'exoplanets',
  setViewMode: (mode) => set({ viewMode: mode }),
  searchQuery: 'Kepler-11', // default starting point
  setSearchQuery: (query) => set({ searchQuery: query }),
  planets: [],
  setPlanets: (planets) => set({ planets }),
  selectedPlanet: null,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  selectedSolarPlanet: null,
  setSelectedSolarPlanet: (planet) => set({ selectedSolarPlanet: planet, selectedSatellite: planet && planet.satellites.length > 0 ? planet.satellites[0] : null }),
  selectedSatellite: null,
  setSelectedSatellite: (satellite) => set({ selectedSatellite: satellite }),
  selectedStarHostname: null,
  setSelectedStarHostname: (hostname) => set({ selectedStarHostname: hostname }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}));
