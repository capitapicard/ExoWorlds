import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Billboard, Line } from '@react-three/drei';
import * as THREE from 'three';
import { usePlanetStore } from '../store/usePlanetStore';
import { Loader2, Globe, LayoutGrid } from 'lucide-react';
import { classifyStar } from '../utils/classification';
import { StarGridView } from './StarGridView';

type StellarViewMode = 'map' | 'grid';

// Convert equatorial coordinates (RA/Dec/Dist) to 3D Cartesian
function toCartesian(ra: number, dec: number, dist: number): [number, number, number] {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const x = dist * Math.cos(decRad) * Math.cos(raRad);
  const z = dist * Math.cos(decRad) * Math.sin(raRad);
  const y = dist * Math.sin(decRad);
  return [x, y, z];
}

interface StarPoint {
  hostname: string;
  ra: number;
  dec: number;
  dist: number;
  teff: number | null;
  pos: [number, number, number];
  planetCount: number;
}

function SunMarker() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { setSelectedStarHostname, setSelectedPlanet } = usePlanetStore();

  useFrame(({ camera }) => {
    if (groupRef.current) {
      const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
      // Constant screen size factor
      const s = dist * 0.007; 
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* The Dot */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          setSelectedStarHostname('Sun');
          setSelectedPlanet(null);
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#fcd34d"} />
      </mesh>
      
      {/* The Label - Positioned to the right of the dot with bottom alignment */}
      <Billboard position={[1.5, -0.6, 0]}>
        <Text 
          fontSize={2.7} 
          color="#fef08a" 
          anchorX="left" 
          anchorY="bottom" 
          outlineWidth={0.08}
          outlineColor="#000000"
        >
          SUN
        </Text>
      </Billboard>
    </group>
  );
}

function StarDot({ star, isSelected, onClick }: {
  star: StarPoint;
  isSelected: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const pos = new THREE.Vector3(...star.pos);

  useFrame(({ camera }) => {
    if (groupRef.current) {
      const dist = camera.position.distanceTo(pos);
      // Constant small dot size factor
      const s = dist * 0.004;
      groupRef.current.scale.set(s, s, s);
    }
  });

  const starClass = classifyStar(star.teff);
  const baseColor = starClass.color;
  const dotColor = isSelected ? '#ffffff' : (hovered ? '#ffffff' : baseColor);

  return (
    <group ref={groupRef} position={star.pos}>
      {/* The Dot */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={dotColor} />
      </mesh>

      {/* The Label - To the right and bottom-aligned */}
      <Billboard position={[1.4, -0.5, 0]}>
        <group>
          <Text
            fontSize={2.4}
            color={isSelected ? "#ffffff" : baseColor}
            anchorX="left"
            anchorY="bottom"
            outlineWidth={0.08}
            outlineColor="#000000"
          >
            {star.hostname}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

function StarLine({ pos }: { pos: [number, number, number] }) {
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)], [pos]);
  return (
    <Line points={points} color="#1e293b" transparent opacity={0.25} lineWidth={0.4} />
  );
}

function SceneStars({ stars, selectedHostname, onSelectStar }: {
  stars: StarPoint[];
  selectedHostname: string | null;
  onSelectStar: (hostname: string) => void;
}) {
  const maxDist = useMemo(() => Math.max(...stars.map(s => s.dist), 1), [stars]);
  const scaleFactor = 60 / maxDist;

  const scaledStars = useMemo(() => stars.map(s => ({
    ...s,
    pos: [s.pos[0] * scaleFactor, s.pos[1] * scaleFactor, s.pos[2] * scaleFactor] as [number, number, number],
  })), [stars, scaleFactor]);

  return (
    <>
      {scaledStars.map(star => (
        <group key={star.hostname}>
          <StarLine pos={star.pos} />
          <StarDot
            star={star}
            isSelected={star.hostname === selectedHostname}
            onClick={() => onSelectStar(star.hostname)}
          />
        </group>
      ))}
    </>
  );
}

export function StellarMapPane() {
  const { planets, selectedStarHostname, setSelectedStarHostname, setSelectedPlanet, isLoading } = usePlanetStore();
  const [stellarView, setStellarView] = useState<StellarViewMode>('map');

  const stars = useMemo<StarPoint[]>(() => {
    const map = new Map<string, StarPoint>();
    for (const p of planets) {
      // If we don't have distance, default to 10 parsecs so it still renders
      if (!map.has(p.hostname) && p.ra != null && p.dec != null) {
        const dist = p.sy_dist || 10;
        map.set(p.hostname, {
          hostname: p.hostname,
          ra: p.ra,
          dec: p.dec,
          dist: dist,
          teff: p.st_teff,
          pos: toCartesian(p.ra, p.dec, dist),
          planetCount: 0,
        });
      }
      
      const entry = map.get(p.hostname);
      if (entry) {
        // If we previously used the fallback distance, and this planet row has the real distance, update it
        if (entry.dist === 10 && p.sy_dist != null && p.sy_dist !== 10) {
          entry.dist = p.sy_dist;
          entry.pos = toCartesian(p.ra!, p.dec!, p.sy_dist);
        }
        entry.planetCount++;
      }
    }
    return Array.from(map.values());
  }, [planets]);

  const handleSelectStar = (hostname: string) => {
    setSelectedStarHostname(hostname);
    setSelectedPlanet(null);
  };

  const camDist = 120;

  return (
    <div className="w-1/2 h-full relative bg-black border-r border-slate-800 shrink-0 overflow-hidden">
      <div className="absolute top-3 left-4 z-20 pointer-events-none">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Stellar Neighborhood</p>
        {stars.length > 0 && (
          <p className="text-[10px] text-slate-600 mt-0.5">{stars.length} star{stars.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      <div className="absolute top-3 right-4 z-20 flex rounded-lg border border-slate-700 bg-slate-800/90 backdrop-blur shadow-lg overflow-hidden">
        {([
          { mode: 'map', icon: Globe, title: 'Stellar map' },
          { mode: 'grid', icon: LayoutGrid, title: 'Star grid' },
        ] as const).map(({ mode, icon: Icon, title }) => (
          <button
            key={mode}
            onClick={() => setStellarView(mode)}
            title={title}
            className={`w-9 h-9 flex items-center justify-center transition-colors ${
              stellarView === mode ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm">Querying Archive...</p>
          </div>
        </div>
      )}

      {(!isLoading && stars.length === 0) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-slate-500 text-sm">No stellar data available.</p>
            <p className="text-slate-700 text-xs mt-1">Search for a star to map its neighborhood.</p>
          </div>
        </div>
      )}

      {stellarView === 'grid' ? (
        <StarGridView planets={planets} selectedHostname={selectedStarHostname} onSelectStar={handleSelectStar} />
      ) : (
      <Canvas camera={{ position: [0, camDist * 0.4, camDist], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.25} />
        <pointLight position={[0, 0, 0]} intensity={6} color="#ffffff" distance={300} />
        <Stars radius={300} depth={100} count={6000} factor={3} saturation={0} fade />
        
        <SunMarker />
        
        {stars.length > 0 && (
          <SceneStars
            stars={stars}
            selectedHostname={selectedStarHostname}
            onSelectStar={handleSelectStar}
          />
        )}

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
      )}
    </div>
  );
}
