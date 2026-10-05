import { usePlanetStore } from '../store/usePlanetStore';
import type { PlanetData } from '../api/nasaApi';
import { classifyPlanet, getPlanetRadius, classifyStar, getPlanetVisuals } from '../utils/classification';
import { Info, Loader2 } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import { useRef, useState, Suspense } from 'react';
import * as THREE from 'three';

const SOLAR_SYSTEM = [
  { pl_name: 'Mercury', pl_orbsmax: 0.387, pl_orbper: 88, pl_bmasse: 0.055, pl_eqt: 440, pl_rade: 0.383, color: '#a3a3a3', textureUrl: '/textures/mercury.jpg' },
  { pl_name: 'Venus', pl_orbsmax: 0.723, pl_orbper: 224.7, pl_bmasse: 0.815, pl_eqt: 737, pl_rade: 0.949, color: '#fcd34d', textureUrl: '/textures/venus.jpg' },
  { pl_name: 'Earth', pl_orbsmax: 1.000, pl_orbper: 365.2, pl_bmasse: 1.0, pl_eqt: 288, pl_rade: 1.0, color: '#3b82f6', textureUrl: '/textures/earth.jpg' },
  { pl_name: 'Mars', pl_orbsmax: 1.524, pl_orbper: 687, pl_bmasse: 0.107, pl_eqt: 210, pl_rade: 0.532, color: '#ef4444', textureUrl: '/textures/mars.jpg' },
  { pl_name: 'Jupiter', pl_orbsmax: 5.204, pl_orbper: 4331, pl_bmasse: 317.8, pl_eqt: 165, pl_rade: 11.209, color: '#fdba74', textureUrl: '/textures/jupiter.jpg' },
  { pl_name: 'Saturn', pl_orbsmax: 9.582, pl_orbper: 10747, pl_bmasse: 95.16, pl_eqt: 134, pl_rade: 9.449, color: '#fde047', textureUrl: '/textures/saturn.jpg' },
  { pl_name: 'Uranus', pl_orbsmax: 19.201, pl_orbper: 30589, pl_bmasse: 14.54, pl_eqt: 76, pl_rade: 4.007, color: '#7dd3fc', textureUrl: '/textures/uranus.jpg' },
  { pl_name: 'Neptune', pl_orbsmax: 30.047, pl_orbper: 59800, pl_bmasse: 17.15, pl_eqt: 72, pl_rade: 3.883, color: '#2563eb', textureUrl: '/textures/neptune.jpg' }
];

function PlanetModel({ radius, color, showQuestionMark }: { radius: number, color: string, showQuestionMark?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.2}
          transparent={showQuestionMark}
          opacity={showQuestionMark ? 0.6 : 1.0}
        />
      </mesh>
      {showQuestionMark && (
        <Text
          position={[0, 0, radius + 0.05]}
          fontSize={radius * 1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          ?
        </Text>
      )}
    </group>
  );
}

function TexturedPlanetModel({ radius, textureUrl, color = "#ffffff", showQuestionMark }: { radius: number, textureUrl: string, color?: string, showQuestionMark?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureMap = useTexture(textureUrl, (tex) => {
    if (Array.isArray(tex)) {
      tex.forEach(t => { t.colorSpace = THREE.SRGBColorSpace; });
    } else {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
  });

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={color}
          map={textureMap}
          roughness={0.6}
          metalness={0.2}
          transparent={showQuestionMark}
          opacity={showQuestionMark ? 0.6 : 1.0}
        />
      </mesh>
      {showQuestionMark && (
        <Text
          position={[0, 0, radius + 0.05]}
          fontSize={radius * 1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          ?
        </Text>
      )}
    </group>
  );
}

function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm">Querying Archive...</p>
      </div>
    </div>
  );
}

export function BottomPane() {
  const { selectedPlanet, selectedStarHostname, planets, isLoading } = usePlanetStore();
  const [comparePlanetName, setComparePlanetName] = useState('Earth');

  const formatVal = (val: number | null | undefined, unit: string) => {
    return val !== null && val !== undefined ? `${val.toLocaleString()} ${unit}` : 'Unknown';
  };

  // If a planet is selected, show Planetary Comparison
  if (selectedPlanet) {
    const comparePlanet = SOLAR_SYSTEM.find(p => p.pl_name === comparePlanetName) || SOLAR_SYSTEM[2];

    const exoClass = classifyPlanet(selectedPlanet);
    const exoVisuals = getPlanetVisuals(selectedPlanet);
    const solarClass = classifyPlanet(comparePlanet);

    const { radius: exoRade, isEstimated: exoIsEstimated, isUnknown: exoIsUnknown } = getPlanetRadius(selectedPlanet);
    const solarRade = comparePlanet.pl_rade;
    const maxRade = Math.max(exoRade, solarRade);

    const MAX_VR = 2.2;
    const exoVisualRadius = (exoRade / maxRade) * MAX_VR;
    const solarVisualRadius = (solarRade / maxRade) * MAX_VR;

    const halfFovRad = (45 / 2) * (Math.PI / 180);
    const sharedCameraZ = (MAX_VR / Math.tan(halfFovRad)) * 1.5;

    return (
      <div className="h-full bg-zinc-950/95 backdrop-blur border-t border-slate-800 flex flex-col z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <LoadingOverlay isLoading={isLoading} />
        <div className="px-6 py-1.5 flex items-center justify-between z-20 bg-slate-900/40 border-b border-slate-800/50">
          <h2 className="text-xs font-bold text-slate-300 tracking-[0.15em] flex items-center gap-2 uppercase">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            Planetary Analysis: {selectedPlanet.pl_name}
          </h2>

          <div className="flex items-center gap-3">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reference Body:</label>
            <select
              value={comparePlanetName}
              onChange={(e) => setComparePlanetName(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-indigo-500 font-medium shadow-sm transition-all hover:border-slate-600"
            >
              {SOLAR_SYSTEM.map(p => (
                <option key={p.pl_name} value={p.pl_name}>{p.pl_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-row bg-black divide-x divide-slate-800/40">
          {/* Exoplanet Half (Left) */}
          <div className="w-1/2 flex flex-row items-center p-4 gap-4">
            <div className="w-1/2 flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[240px]">
                <Canvas camera={{ position: [0, 0, sharedCameraZ], fov: 45 }} style={{ width: '100%', height: '100%' }}>
                  <ambientLight intensity={0.9} />
                  <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
                  <pointLight position={[-10, -10, -10]} intensity={2} color={exoVisuals.tintColor} />
                  <Suspense fallback={<PlanetModel radius={exoVisualRadius} color={exoVisuals.tintColor} showQuestionMark={exoIsUnknown} />}>
                    <TexturedPlanetModel radius={exoVisualRadius} textureUrl={exoVisuals.textureUrl} color={exoVisuals.tintColor} showQuestionMark={exoIsUnknown} />
                  </Suspense>
                </Canvas>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-800/60 pb-1.5">
                <div className="text-sm font-bold tracking-tight" style={{ color: exoClass.color }}>{selectedPlanet.pl_name}</div>
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-800/50 border leading-none" style={{ borderColor: `${exoClass.color}40`, color: exoClass.color }}>
                  {exoClass.label}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Distance:</span>
                  <span className="font-medium">{formatVal(selectedPlanet.pl_orbsmax, 'AU')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Period:</span>
                  <span className="font-medium">{formatVal(selectedPlanet.pl_orbper, 'Days')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Mass:</span>
                  <span className="font-medium">{formatVal(selectedPlanet.pl_bmasse, 'M⊕')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Temperature:</span>
                  <span className="font-medium">{formatVal(selectedPlanet.pl_eqt, 'K')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Radius:</span>
                  <span className="font-medium inline-flex items-center gap-2">
                    {formatVal(selectedPlanet.pl_rade || (exoIsEstimated ? exoRade : null), 'R⊕')}
                    {exoIsEstimated && (
                      <span className="text-[8px] text-indigo-400 font-bold tracking-tighter uppercase px-1 py-px bg-indigo-500/10 rounded border border-indigo-500/20 leading-none">
                        est.
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Solar System Half (Right) */}
          <div className="w-1/2 flex flex-row items-center p-4 gap-4">
            <div className="w-1/2 flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[240px]">
                <Canvas camera={{ position: [0, 0, sharedCameraZ], fov: 45 }} style={{ width: '100%', height: '100%' }}>
                  <ambientLight intensity={0.7} />
                  <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
                  <pointLight position={[-10, -10, -10]} intensity={2} color={comparePlanet.color} />
                  <Suspense fallback={<PlanetModel radius={solarVisualRadius} color={comparePlanet.color} />}>
                    <TexturedPlanetModel radius={solarVisualRadius} textureUrl={comparePlanet.textureUrl} />
                  </Suspense>
                </Canvas>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-800/60 pb-1.5">
                <div className="text-sm font-bold text-slate-100 tracking-tight">{comparePlanet.pl_name}</div>
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-800/80 text-slate-400 border border-slate-700 leading-none">
                  {solarClass.label}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Distance:</span>
                  <span className="font-medium">{formatVal(comparePlanet.pl_orbsmax, 'AU')}</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Period:</span>
                  <span className="font-medium">{formatVal(comparePlanet.pl_orbper, 'Days')}</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Mass:</span>
                  <span className="font-medium">{formatVal(comparePlanet.pl_bmasse, 'M⊕')}</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Temperature:</span>
                  <span className="font-medium">{formatVal(comparePlanet.pl_eqt, 'K')}</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Radius:</span>
                  <span className="font-medium">{formatVal(comparePlanet.pl_rade, 'R⊕')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If a star is selected (but no specific planet), show Stellar Comparison
  if (selectedStarHostname && (planets.length > 0 || selectedStarHostname === 'Sun')) {
    let starPlanet;
    if (selectedStarHostname === 'Sun') {
      starPlanet = {
        hostname: 'The Sun',
        st_teff: 5778,
        st_rad: 1.0,
        st_mass: 1.0,
        sy_dist: 0
      } as Partial<PlanetData>;
    } else {
      starPlanet = planets.find(p => p.hostname === selectedStarHostname) || planets[0];
    }

    const exoStarClass = classifyStar(starPlanet.st_teff ?? null);
    const sunClass = classifyStar(5778);

    const exoRad = starPlanet.st_rad || 1.0; // fallback to 1 solar radius if missing
    const sunRad = 1.0;
    const maxRad = Math.max(exoRad, sunRad);

    const MAX_VR = 2.2;
    const exoVisualRadius = (exoRad / maxRad) * MAX_VR;
    const sunVisualRadius = (sunRad / maxRad) * MAX_VR;

    const halfFovRad = (45 / 2) * (Math.PI / 180);
    const sharedCameraZ = (MAX_VR / Math.tan(halfFovRad)) * 1.5;

    return (
      <div className="h-full bg-zinc-950/95 backdrop-blur border-t border-slate-800 flex flex-col z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <LoadingOverlay isLoading={isLoading} />
        <div className="px-6 py-1.5 flex items-center justify-between z-20 bg-slate-900/40 border-b border-slate-800/50">
          <h2 className="text-xs font-bold text-slate-300 tracking-[0.15em] flex items-center gap-2 uppercase">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            Stellar Analysis: {selectedStarHostname}
          </h2>
        </div>

        <div className="flex-1 overflow-hidden flex flex-row bg-black divide-x divide-slate-800/40">
          {/* Exostar Half (Left) */}
          <div className="w-1/2 flex flex-row items-center p-4 gap-4">
            <div className="w-1/2 flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[240px]">
                <Canvas camera={{ position: [0, 0, sharedCameraZ], fov: 45 }} style={{ width: '100%', height: '100%' }}>
                  <ambientLight intensity={0.7} />
                  <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
                  <PlanetModel radius={exoVisualRadius} color={exoStarClass.color} showQuestionMark={starPlanet.st_rad == null} />
                </Canvas>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-800/60 pb-1.5">
                <div className="text-sm font-bold tracking-tight" style={{ color: exoStarClass.color }}>{starPlanet.hostname}</div>
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-800/50 border leading-none" style={{ borderColor: `${exoStarClass.color}40`, color: exoStarClass.color }}>
                  {exoStarClass.label}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Radius:</span>
                  <span className="font-medium">{formatVal(starPlanet.st_rad, 'R⊙')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Mass:</span>
                  <span className="font-medium">{formatVal(starPlanet.st_mass, 'M⊙')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Temperature:</span>
                  <span className="font-medium">{formatVal(starPlanet.st_teff, 'K')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Distance:</span>
                  <span className="font-medium">{formatVal(starPlanet.sy_dist, 'pc')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sun Half (Right) */}
          <div className="w-1/2 flex flex-row items-center p-4 gap-4">
            <div className="w-1/2 flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[240px]">
                <Canvas camera={{ position: [0, 0, sharedCameraZ], fov: 45 }} style={{ width: '100%', height: '100%' }}>
                  <ambientLight intensity={0.7} />
                  <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
                  <PlanetModel radius={sunVisualRadius} color={sunClass.color} />
                </Canvas>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-800/60 pb-1.5">
                <div className="text-sm font-bold text-slate-100 tracking-tight">The Sun</div>
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-800/80 text-slate-400 border border-slate-700 leading-none">
                  {sunClass.label}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Radius:</span>
                  <span className="font-medium">1.0 R⊙</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Mass:</span>
                  <span className="font-medium">1.0 M⊙</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Temperature:</span>
                  <span className="font-medium">5,778 K</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Distance:</span>
                  <span className="font-medium">0 pc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Neither is selected (Default state)
  return (
    <div className="h-full bg-zinc-950 border-t border-slate-800 flex items-center justify-center text-slate-500 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] font-medium tracking-wide relative">
      <LoadingOverlay isLoading={isLoading} />
      <Info className="w-5 h-5 mr-3 opacity-20" />
      Select a system or planet to view its physical characteristics
    </div>
  );
}
