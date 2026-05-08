import { useState, useRef, useEffect, type FormEvent } from 'react';
import { usePlanetStore } from '../store/usePlanetStore';
import { searchStarSystem, searchStarsByDistanceRange, searchByPreset } from '../api/nasaApi';
import { Search, Loader2, ChevronDown, Filter } from 'lucide-react';

const PRESET_SEARCHES = [
  "-- Select Preset --",
  "Nearby Systems (< 50 ly)",
  "Habitable Zone (Goldilocks)",
  "Rich Systems (4+ Planets)",
  "Hot Jupiters (Exotic Giants)",
  "Earth 2.0 (Rocky Habitable)"
];

const PRESET_STARS = [
  "-- Select Star --",
  "TRAPPIST-1",
  "Proxima Centauri",
  "Kepler-186",
  "Kepler-90",
  "55 Cancri",
  "WASP-12",
  "Kepler-16",
  "HD 189733",
  "GJ 667 C",
  "K2-18"
];

export function Header() {
  const { searchQuery, setSearchQuery, setPlanets, setIsLoading, isLoading, setError, setSelectedStarHostname, setSelectedPlanet } = usePlanetStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromLy, setFromLy] = useState('0');
  const [toLy, setToLy] = useState('25');
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setIsLoading(true);
    setError(null);
    setSelectedPlanet(null);
    
    try {
      const results = await searchStarSystem(query);
      setPlanets(results);
      if (results.length > 0) {
        setSelectedStarHostname(results[0].hostname);
      } else {
        setSelectedStarHostname(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPlanets([]);
      setSelectedStarHostname(null);
    } finally {
      setIsLoading(false);
    }
  };

  const performPresetSearch = async (index: number, label: string) => {
    setSearchQuery(`Preset: ${label}`);
    setLocalQuery(`Preset: ${label}`);
    setIsLoading(true);
    setError(null);
    setSelectedPlanet(null);
    
    try {
      const results = await searchByPreset(index);
      setPlanets(results);
      if (results.length > 0) {
        setSelectedStarHostname(results[0].hostname);
      } else {
        setSelectedStarHostname(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPlanets([]);
      setSelectedStarHostname(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await performSearch(localQuery);

  };

  const handleFilterSearch = async () => {
    setIsFilterOpen(false);
    setIsLoading(true);
    setError(null);
    setSelectedPlanet(null);
    setSearchQuery(`Distance: ${fromLy}-${toLy} Ly`);

    try {
      const results = await searchStarsByDistanceRange(Number(fromLy), Number(toLy));
      setPlanets(results);
      if (results.length > 0) {
        setSelectedStarHostname(results[0].hostname);
      } else {
        setSelectedStarHostname(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPlanets([]);
      setSelectedStarHostname(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
        </div>
        <h1 className="text-xl font-bold text-slate-200 tracking-wide">
          Exoplanet Explorer
        </h1>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end max-w-4xl">
        <div className="flex items-center gap-2 mr-2">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Notable:</label>
          <select 
            onChange={(e) => {
              const star = e.target.value;
              if (star !== "-- Select Star --") {
                setLocalQuery(star);
                performSearch(star);
              }
            }}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500 font-medium shadow-sm transition-all hover:border-slate-600"
          >
            {PRESET_STARS.map(star => (
              <option key={star} value={star}>{star}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mr-2">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Presets:</label>
          <select 
            onChange={(e) => {
              const label = e.target.value;
              const index = PRESET_SEARCHES.indexOf(label);
              if (index > 0) {
                performPresetSearch(index, label);
              }
            }}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500 font-medium shadow-sm transition-all hover:border-slate-600"
          >
            {PRESET_SEARCHES.map(preset => (
              <option key={preset} value={preset}>{preset}</option>
            ))}
          </select>
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all border ${
              isFilterOpen 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Distance Range (Ly)</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 mb-1 ml-1">From</label>
                  <input
                    type="number"
                    value={fromLy}
                    onChange={(e) => setFromLy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 mb-1 ml-1">To</label>
                  <input
                    type="number"
                    value={toLy}
                    onChange={(e) => setToLy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFilterSearch}
                  className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Ok
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter star name..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center min-w-[100px] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Render'}
          </button>
        </form>
      </div>
    </header>
  );
}
