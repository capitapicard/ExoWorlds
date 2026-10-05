import { useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { usePlanetStore } from '../store/usePlanetStore';
import type { Satellite, SolarPlanet } from '../data/solarSystemData';
import { ClampedTextLabel } from './ClampedTextLabel';
import { Orbit as OrbitIcon, Play, Square } from 'lucide-react';

function CentralPlanet({ planet }: { planet: SolarPlanet }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useTexture(planet.textureUrl, (tex) => {
    if (Array.isArray(tex)) {
      tex.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; });
    } else {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
  });

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const displayRadius = Math.max(planet.radius * 1.5, 2.0);

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[displayRadius, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} />
        {planet.hasRings && (
          <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[displayRadius * 1.4, displayRadius * 2.4, 64]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        )}
      </mesh>
      <ClampedTextLabel
        offsetY={-displayRadius - 1.2}
        text={planet.name}
        fontSize={1.8}
        color="#ffffff"
        referenceDistance={35}
      />
    </group>
  );
}

function SatelliteMesh({
  satellite,
  index,
  planetRadius,
  isAnimating,
}: {
  satellite: Satellite;
  index: number;
  planetRadius: number;
  isAnimating: boolean;
}) {
  const { selectedSatellite, setSelectedSatellite } = usePlanetStore();
  const isSelected = selectedSatellite?.name === satellite.name;
  const meshRef = useRef<THREE.Mesh>(null);
  
  const orbitalRadius = planetRadius + 3.5 + index * 2.8;

  const initialAngle = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < satellite.name.length; i++) {
      hash = (hash << 5) - hash + satellite.name.charCodeAt(i);
      hash |= 0;
    }
    return ((Math.abs(hash) % 1000) / 1000) * Math.PI * 2;
  }, [satellite.name]);

  const angleRef = useRef(initialAngle);

  const inclinationRad = (satellite.inclinationDeg * Math.PI) / 180;

  const orbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * orbitalRadius, 0, Math.sin(theta) * orbitalRadius));
    }
    return pts;
  }, [orbitalRadius]);

  const speed = Math.max(0.1, 0.8 / Math.sqrt(index + 1));

  useFrame((_, delta) => {
    if (isAnimating) {
      angleRef.current += delta * speed * 0.4;
    }
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angleRef.current) * orbitalRadius;
      meshRef.current.position.z = Math.sin(angleRef.current) * orbitalRadius;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group rotation={[inclinationRad, 0, 0]}>
      <Line
        points={orbitPoints}
        color={isSelected ? '#38bdf8' : satellite.color}
        lineWidth={isSelected ? 2 : 1}
        transparent
        opacity={isSelected ? 0.9 : 0.4}
        dashed={!isSelected}
        dashScale={0.5}
        dashSize={1}
        gapSize={1}
      />
      
      <mesh
        ref={meshRef}
        position={[Math.cos(initialAngle) * orbitalRadius, 0, Math.sin(initialAngle) * orbitalRadius]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSatellite(satellite);
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[satellite.radius * (isSelected ? 1.25 : 1.0), 32, 32]} />
        <meshStandardMaterial color={isSelected ? '#60a5fa' : satellite.color} roughness={0.7} />
        <ClampedTextLabel
          offsetY={-satellite.radius - 0.5}
          text={satellite.name}
          fontSize={1.1}
          color={isSelected ? '#38bdf8' : '#e2e8f0'}
          referenceDistance={35}
        />
      </mesh>
    </group>
  );
}

export function SolarPlanetViewport() {
  const selectedSolarPlanet = usePlanetStore((state) => state.selectedSolarPlanet);
  // Initial state is paused as requested
  const [isAnimating, setIsAnimating] = useState(false);

  if (!selectedSolarPlanet) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
        <div className="text-center bg-slate-900/60 p-8 rounded-2xl border border-slate-800/80 backdrop-blur-sm shadow-2xl flex flex-col items-center">
          <OrbitIcon className="w-12 h-12 text-indigo-500/50 mb-4" />
          <p className="font-medium text-slate-200 text-lg tracking-wide">Visor de Satélites</p>
          <p className="text-sm mt-2 text-slate-500 max-w-xs">Selecciona un planeta del Sistema Solar en el panel izquierdo para explorar sus satélites naturales.</p>
        </div>
      </div>
    );
  }

  const displaySatellites = selectedSolarPlanet.satellites.slice(0, 12);
  const displayRadius = Math.max(selectedSolarPlanet.radius * 1.5, 2.0);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden shadow-inner">
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">{selectedSolarPlanet.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {displaySatellites.length > 0 
            ? `${displaySatellites.length} satélite${displaySatellites.length !== 1 ? 's' : ''} ${selectedSolarPlanet.satellites.length > 12 ? '(limitado a 12 principales)' : ''}`
            : 'Sin satélites conocidos'
          }
        </p>
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-row gap-2">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          title={isAnimating ? 'Pausar Movimiento' : 'Iniciar Movimiento'}
          className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 rounded-lg w-10 h-10 flex items-center justify-center backdrop-blur border border-slate-700 shadow-lg transition-all"
        >
          {isAnimating ? <Square className="w-4 h-4 fill-slate-300" /> : <Play className="w-4 h-4 fill-slate-300 ml-0.5" />}
        </button>
      </div>

      <Canvas camera={{ position: [0, 25, 35], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[30, 20, 30]} intensity={3} color="#ffffff" />
        <pointLight position={[-30, -10, -20]} intensity={1} color="#6366f1" />
        <Stars radius={120} depth={40} count={4000} factor={3} saturation={0} fade />

        <Suspense fallback={null}>
          <CentralPlanet planet={selectedSolarPlanet} />
          {displaySatellites.map((sat, idx) => (
            <SatelliteMesh
              key={sat.name}
              satellite={sat}
              index={idx}
              planetRadius={displayRadius}
              isAnimating={isAnimating}
            />
          ))}
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
        />
      </Canvas>
    </div>
  );
}
