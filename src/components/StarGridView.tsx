import { useMemo } from 'react';
import type { PlanetData } from '../api/nasaApi';
import { classifyStar } from '../utils/classification';

const PC_TO_LY = 3.26156;
const MAX_SPHERE_PX = 56; // size of the largest star in the result set
const MIN_SPHERE_PX = 4;  // keep the smallest dwarfs visible next to giants

interface GridStar {
  hostname: string;
  distPc: number | null;
  teff: number | null;
  radiusSolar: number | null;
  planetCount: number;
}

function formatDistanceLy(distPc: number | null): string {
  if (distPc == null) return 'Unknown distance';
  const ly = distPc * PC_TO_LY;
  return ly < 100 ? `${ly.toFixed(1)} ly` : `${Math.round(ly).toLocaleString()} ly`;
}

function StarSphere({ color, sizePx, isSelected, isUnknown }: { color: string; sizePx: number; isSelected: boolean; isUnknown: boolean }) {
  // CSS-shaded sphere: one WebGL canvas per cell would exceed the browser's context limit
  return (
    <div
      className="rounded-full transition-transform duration-200 group-hover:scale-110 flex items-center justify-center text-white font-bold"
      style={{
        width: sizePx,
        height: sizePx,
        fontSize: sizePx * 0.5,
        opacity: isUnknown ? 0.6 : 1,
        textShadow: '0 0 3px #000000',
        background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${color} 35%, color-mix(in srgb, ${color} 35%, #000000) 100%)`,
        boxShadow: isSelected
          ? `0 0 0 2px #ffffff, 0 0 24px 6px ${color}99`
          : `0 0 18px 2px ${color}55`,
      }}
    >
      {isUnknown && '?'}
    </div>
  );
}

export function StarGridView({ planets, selectedHostname, onSelectStar }: {
  planets: PlanetData[];
  selectedHostname: string | null;
  onSelectStar: (hostname: string) => void;
}) {
  const stars = useMemo<GridStar[]>(() => {
    const map = new Map<string, GridStar>();
    for (const p of planets) {
      const entry = map.get(p.hostname);
      if (entry) {
        entry.planetCount++;
        entry.distPc ??= p.sy_dist;
        entry.teff ??= p.st_teff;
        entry.radiusSolar ??= p.st_rad;
      } else {
        map.set(p.hostname, { hostname: p.hostname, distPc: p.sy_dist, teff: p.st_teff, radiusSolar: p.st_rad, planetCount: 1 });
      }
    }
    // Nearest first; stars without a known distance go last
    return Array.from(map.values()).sort((a, b) => (a.distPc ?? Infinity) - (b.distPc ?? Infinity));
  }, [planets]);

  // Stars without a known radius are drawn as 1 R☉ (same fallback as the data desk) and marked with "?"
  const maxRadius = useMemo(
    () => Math.max(...stars.map(s => s.radiusSolar ?? 1)),
    [stars]
  );

  return (
    <div className="absolute inset-0 overflow-y-auto pt-14 pb-4 px-4">
      <div className="grid grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
        {stars.map(star => {
          const starClass = classifyStar(star.teff);
          const isSelected = star.hostname === selectedHostname;
          const isUnknownRadius = star.radiusSolar == null;
          const sizePx = Math.max(MIN_SPHERE_PX, ((star.radiusSolar ?? 1) / maxRadius) * MAX_SPHERE_PX);
          return (
            <button
              key={star.hostname}
              onClick={() => onSelectStar(star.hostname)}
              title={`${star.hostname} · ${starClass.label} · ${isUnknownRadius ? 'radius unknown' : `${star.radiusSolar} R☉`} · ${star.planetCount} planet${star.planetCount !== 1 ? 's' : ''}`}
              className={`group flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'bg-indigo-900/40 border-indigo-500/50'
                  : 'bg-slate-900/20 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* Fixed-height slot so names and distances stay aligned across rows */}
              <div className="flex items-center justify-center" style={{ height: MAX_SPHERE_PX }}>
                <StarSphere color={starClass.color} sizePx={sizePx} isSelected={isSelected} isUnknown={isUnknownRadius} />
              </div>
              <div className="flex flex-col items-center min-w-0 w-full">
                <span className={`text-xs font-medium truncate w-full text-center ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {star.hostname}
                </span>
                <span className="text-[10px] text-slate-500">{formatDistanceLy(star.distPc)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
