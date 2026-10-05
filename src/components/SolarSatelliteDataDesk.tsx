import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { usePlanetStore } from '../store/usePlanetStore';
import { TERRESTRIAL_BODIES } from '../data/solarSystemData';
import { Info } from 'lucide-react';

function SatelliteModel({ radius, color }: { radius: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  );
}

function TexturedTerrestrialModel({ radius, textureUrl, color = '#ffffff' }: { radius: number; textureUrl: string; color?: string }) {
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
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial color={color} map={textureMap} roughness={0.6} metalness={0.2} />
    </mesh>
  );
}

export function SolarSatelliteDataDesk() {
  const { selectedSatellite, isLoading } = usePlanetStore();
  const [compareBodyName, setCompareBodyName] = useState<string>('Tierra');

  const formatVal = (val: number | null | undefined, unit: string) => {
    return val !== null && val !== undefined ? `${val.toLocaleString()} ${unit}` : 'Desconocido';
  };

  if (selectedSatellite) {
    const compareBody = TERRESTRIAL_BODIES.find(b => b.name === compareBodyName) || TERRESTRIAL_BODIES[0];

    const satDiam = selectedSatellite.diameterKm;
    const targetDiam = compareBody.diameterKm;
    const maxDiam = Math.max(satDiam, targetDiam);

    const MAX_VR = 2.2;
    const satVisualRadius = (satDiam / maxDiam) * MAX_VR;
    const targetVisualRadius = (targetDiam / maxDiam) * MAX_VR;

    const halfFovRad = (45 / 2) * (Math.PI / 180);
    const sharedCameraZ = (MAX_VR / Math.tan(halfFovRad)) * 1.5;

    const diamRatio = ((satDiam / targetDiam) * 100).toFixed(1);

    return (
      <div className="h-full bg-zinc-950/95 backdrop-blur border-t border-slate-800 flex flex-col z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <span className="text-sm">Procesando...</span>
            </div>
          </div>
        )}

        {/* Top Header Bar (Identical to BottomPane) */}
        <div className="px-6 py-1.5 flex items-center justify-between z-20 bg-slate-900/40 border-b border-slate-800/50">
          <h2 className="text-xs font-bold text-slate-300 tracking-[0.15em] flex items-center gap-2 uppercase">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            Análisis de Satélite: {selectedSatellite.name}
          </h2>

          <div className="flex items-center gap-3">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cuerpo de Referencia:</label>
            <select
              value={compareBodyName}
              onChange={(e) => setCompareBodyName(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-indigo-500 font-medium shadow-sm transition-all hover:border-slate-600"
            >
              {TERRESTRIAL_BODIES.map((body) => (
                <option key={body.name} value={body.name}>{body.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Area Split 50% / 50% (Identical to BottomPane) */}
        <div className="flex-1 overflow-hidden flex flex-row bg-black divide-x divide-slate-800/40">
          {/* Selected Satellite Half (Left) */}
          <div className="w-1/2 flex flex-row items-center p-4 gap-4">
            <div className="w-1/2 flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[240px]">
                <Canvas camera={{ position: [0, 0, sharedCameraZ], fov: 45 }} style={{ width: '100%', height: '100%' }}>
                  <ambientLight intensity={0.9} />
                  <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
                  <pointLight position={[-10, -10, -10]} intensity={2} color={selectedSatellite.color} />
                  <Suspense fallback={<SatelliteModel radius={satVisualRadius} color={selectedSatellite.color} />}>
                    <SatelliteModel radius={satVisualRadius} color={selectedSatellite.color} />
                  </Suspense>
                </Canvas>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-800/60 pb-1.5">
                <div className="text-sm font-bold tracking-tight text-sky-400">{selectedSatellite.name}</div>
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-sky-950/60 border border-sky-800/40 text-sky-400 leading-none">
                  Satélite Natural
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Diámetro:</span>
                  <span className="font-medium">{formatVal(selectedSatellite.diameterKm, 'km')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Masa:</span>
                  <span className="font-medium">{selectedSatellite.massKg}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Distancia Órbita:</span>
                  <span className="font-medium">{formatVal(selectedSatellite.distKm, 'km')}</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Inclinación:</span>
                  <span className="font-medium">{selectedSatellite.inclinationDeg}°</span>
                </div>
                <div className="text-xs text-slate-100 whitespace-nowrap">
                  <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Período:</span>
                  <span className="font-medium">{formatVal(selectedSatellite.periodDays, 'Días')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terrestrial Reference Body Half (Right) */}
          <div className="w-1/2 flex flex-row items-center p-4 gap-4">
            <div className="w-1/2 flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[240px]">
                <Canvas camera={{ position: [0, 0, sharedCameraZ], fov: 45 }} style={{ width: '100%', height: '100%' }}>
                  <ambientLight intensity={0.7} />
                  <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
                  <pointLight position={[-10, -10, -10]} intensity={2} color={compareBody.color} />
                  <Suspense fallback={<SatelliteModel radius={targetVisualRadius} color={compareBody.color} />}>
                    <TexturedTerrestrialModel radius={targetVisualRadius} textureUrl={compareBody.textureUrl} color={compareBody.color} />
                  </Suspense>
                </Canvas>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-800/60 pb-1.5">
                <div className="text-sm font-bold text-slate-100 tracking-tight">{compareBody.name}</div>
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-800/80 text-slate-400 border border-slate-700 leading-none">
                  Cuerpo Terrestre
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Diámetro:</span>
                  <span className="font-medium">{formatVal(compareBody.diameterKm, 'km')}</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Masa:</span>
                  <span className="font-medium">{compareBody.massKg}</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Escala Relativa:</span>
                  <span className="font-medium text-amber-300">{diamRatio}% del diámetro</span>
                </div>
                <div className="text-xs text-slate-300 whitespace-nowrap">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mr-2 inline-block w-24">Tipo:</span>
                  <span className="font-medium">{compareBody.name === 'Luna' ? 'Satélite Terrestre' : 'Planeta Rocoso'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default empty state (Identical to BottomPane)
  return (
    <div className="h-full bg-zinc-950 border-t border-slate-800 flex items-center justify-center text-slate-500 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] font-medium tracking-wide relative">
      <Info className="w-5 h-5 mr-3 opacity-20" />
      Selecciona un satélite para ver su comparativa física
    </div>
  );
}
