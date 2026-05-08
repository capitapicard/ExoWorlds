import { create } from 'zustand';
import type { PlanetData } from '../api/nasaApi';

interface PlanetStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  planets: PlanetData[];
  setPlanets: (planets: PlanetData[]) => void;
  selectedPlanet: PlanetData | null;
  setSelectedPlanet: (planet: PlanetData | null) => void;
  selectedStarHostname: string | null;
  setSelectedStarHostname: (hostname: string | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const usePlanetStore = create<PlanetStore>((set) => ({
  searchQuery: 'Kepler-11', // default starting point
  setSearchQuery: (query) => set({ searchQuery: query }),
  planets: [],
  setPlanets: (planets) => set({ planets }),
  selectedPlanet: null,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  selectedStarHostname: null,
  setSelectedStarHostname: (hostname) => set({ selectedStarHostname: hostname }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}));
