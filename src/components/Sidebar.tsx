import { usePlanetStore } from '../store/usePlanetStore';
import { Orbit, AlertCircle } from 'lucide-react';
import { classifyPlanet } from '../utils/classification';

export function Sidebar() {
  const { planets, selectedPlanet, setSelectedPlanet, isLoading, error } = usePlanetStore();

  return (
    <aside className="w-80 bg-zinc-950 border-r border-slate-800 flex flex-col h-full shrink-0 overflow-hidden shadow-xl z-10">
      <div className="p-4 border-b border-slate-800/50 bg-slate-900/30">
        <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Planetary System
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {planets.length} object{planets.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && (
          <div className="flex flex-col gap-2 p-4 pt-10 items-center justify-center opacity-50">
            <Orbit className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-slate-400 text-sm">Querying NASA TAP Archive...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg flex gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && planets.length === 0 && (
          <div className="p-4 text-center mt-10">
            <p className="text-slate-500 text-sm">No star system loaded.</p>
            <p className="text-slate-600 text-xs mt-1">Search for a star (e.g. TRAPPIST-1) to load associated planets.</p>
          </div>
        )}

        {planets.map((planet) => {
          const isSelected = selectedPlanet?.pl_name === planet.pl_name;
          const pClass = classifyPlanet(planet);
          
          return (
            <button
              key={planet.pl_name}
              onClick={() => setSelectedPlanet(planet)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border group
                ${isSelected 
                  ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20' 
                  : 'bg-slate-900/20 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'}
              `}
            >
              <div className="flex items-center justify-between pointer-events-none mb-1">
                <span className="font-medium">{planet.pl_name}</span>
                <Orbit className={`w-4 h-4 transition-transform duration-500 ${isSelected ? 'text-indigo-400 rotate-90' : 'text-slate-600 group-hover:text-slate-400'}`} />
              </div>
              <div className="flex items-center pointer-events-none">
                 <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-900/50 border border-slate-800" style={{ color: pClass.color }}>
                   {pClass.label}
                 </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
