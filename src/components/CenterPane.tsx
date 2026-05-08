import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, OrbitControls, Stars, Line, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { usePlanetStore } from '../store/usePlanetStore';
import { classifyPlanet, getPlanetVisuals } from '../utils/classification';
import { Orbit as OrbitIcon, Play, Square, Sun, Loader2 } from 'lucide-react';

const SOLAR_SYSTEM = [
  { pl_name: 'Mercury', pl_orbsmax: 0.387, pl_orbeccen: 0.2056, pl_orbper: 88, color: '#a3a3a3' },
  { pl_name: 'Venus', pl_orbsmax: 0.723, pl_orbeccen: 0.0067, pl_orbper: 224.7, color: '#fcd34d' },
  { pl_name: 'Earth', pl_orbsmax: 1.000, pl_orbeccen: 0.0167, pl_orbper: 365.2, color: '#3b82f6' },
  { pl_name: 'Mars', pl_orbsmax: 1.524, pl_orbeccen: 0.0934, pl_orbper: 687, color: '#ef4444' },
  { pl_name: 'Jupiter', pl_orbsmax: 5.204, pl_orbeccen: 0.0489, pl_orbper: 4331, color: '#fdba74' },
  { pl_name: 'Saturn', pl_orbsmax: 9.582, pl_orbeccen: 0.0565, pl_orbper: 10747, color: '#fde047' },
  { pl_name: 'Uranus', pl_orbsmax: 19.201, pl_orbeccen: 0.0457, pl_orbper: 30589, color: '#7dd3fc' },
  { pl_name: 'Neptune', pl_orbsmax: 30.047, pl_orbeccen: 0.0113, pl_orbper: 59800, color: '#2563eb' }
];

function CentralStar({ planets }: { planets: any[] }) {
  const starRef = useRef<THREE.Mesh>(null);
  const setSelectedPlanet = usePlanetStore(state => state.setSelectedPlanet);
  
  useFrame(({ camera }) => {
    if (starRef.current) {
      const dist = camera.position.distanceTo(starRef.current.position);
      const scale = dist * 0.0125;
      starRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh 
      ref={starRef}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPlanet(null);
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} toneMapped={false} />
      {planets.length > 0 && (
        <Billboard>
          <Text 
            position={[0, -1.2, 0]} 
            fontSize={1.1} 
            color="#fcd34d" 
            anchorX="center" 
            anchorY="top"
          >
            {planets[0].hostname}
          </Text>
        </Billboard>
      )}
    </mesh>
  );
}

function HabitableZone({ planets, orbitScale }: { planets: any[], orbitScale: number }) {
  if (planets.length === 0) return null;
  const star = planets[0]; // Take the first planet to get star properties
  
  const tempK = star.st_teff;
  const radiusSolar = star.st_rad;

  if (tempK == null || radiusSolar == null) {
    return null;
  }
  
  const tempRatio = tempK / 5778.0;
  const luminosity = (radiusSolar * radiusSolar) * Math.pow(tempRatio, 4);

  if (luminosity <= 0) return null;

  const innerAu = Math.sqrt(luminosity / 1.1);
  const outerAu = Math.sqrt(luminosity / 0.53);
  
  const innerRadius = innerAu * orbitScale;
  const outerRadius = outerAu * orbitScale;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <meshBasicMaterial color="#16a34a" transparent opacity={0.06} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SolarPlanetOrbit({ planet, isAnimating, maxBoundary, orbitScale }: { planet: any, isAnimating: boolean, maxBoundary: number, orbitScale: number }) {
  const planetRef = useRef<THREE.Mesh>(null);
  const progress = useRef(Math.random() * Math.PI * 2);
  
  const rawAu = planet.pl_orbsmax;
  
  // Calculate rendering parameters
  const semiMajorAxis = rawAu * orbitScale; 
  const eccentricity = planet.pl_orbeccen || 0;
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - Math.pow(eccentricity, 2));

  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      -semiMajorAxis * eccentricity, 0, // offset center so focus is at 0,0
      semiMajorAxis, semiMinorAxis,
      0, 2 * Math.PI,
      false,
      0
    );
    return curve.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
  }, [semiMajorAxis, semiMinorAxis]);

  const speed = planet.pl_orbper ? (365 / planet.pl_orbper) * 0.2 : 0.05;

  useFrame(({ camera }, delta) => {
    if (!planetRef.current) return;
    if (isAnimating) {
      progress.current += delta * speed;
    }
    planetRef.current.position.x = -semiMajorAxis * eccentricity + semiMajorAxis * Math.cos(progress.current);
    planetRef.current.position.z = semiMinorAxis * Math.sin(progress.current);

    // Keep size visually constant regardless of zoom level
    const dist = camera.position.distanceTo(planetRef.current.position);
    const scale = dist * 0.0125;
    planetRef.current.scale.set(scale, scale, scale);
  });

  // Only render if the planet's orbit is strictly inside or perfectly encircles the furthest Exoplanet boundary
  if (rawAu > maxBoundary) return null;

  return (
    <group>
      <Line points={points} color={planet.color} lineWidth={1} transparent opacity={0.4} dashed={true} dashScale={0.5} dashSize={1} gapSize={1} />
      <mesh ref={planetRef}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshBasicMaterial 
          color={planet.color} 
        /><Billboard>
          <Text position={[0, -0.8, 0]} fontSize={0.75} color={planet.color} anchorX="center" anchorY="top">
            {planet.pl_name}
          </Text>
        </Billboard>
      </mesh>
    </group>
  );
}

function PlanetOrbit({ planet, isAnimating, isSelected, orbitScale }: { planet: any, isAnimating: boolean, isSelected: boolean, orbitScale: number }) {
  const setSelectedPlanet = usePlanetStore(state => state.setSelectedPlanet);
  const planetRef = useRef<THREE.Mesh>(null);
  const progress = useRef(Math.random() * Math.PI * 2); // Start at a random point in the orbit
  
  // Scale distances for proportional spacing, ensuring a minimum distance from the central star
  const semiMajorAxis = planet.pl_orbsmax ? planet.pl_orbsmax * orbitScale : 15; 
  const eccentricity = planet.pl_orbeccen || 0;
  
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - Math.pow(eccentricity, 2));

  // Generate Ellipse points for Orbit line
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      -semiMajorAxis * eccentricity, 0, // offset center so focus is at 0,0
      semiMajorAxis, semiMinorAxis, // xRadius, yRadius
      0, 2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );
    // return points in 3D (x, 0, z)
    return curve.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
  }, [semiMajorAxis, semiMinorAxis]);

  // Planet speed (arbitrary scale for visual simulation)
  const speed = planet.pl_orbper ? (365 / planet.pl_orbper) * 0.2 : 0.05;

  useFrame(({ camera }, delta) => {
    if (!planetRef.current) return;
    
    if (isAnimating) {
      progress.current += delta * speed;
    }
    
    // Parametric equation for ellipsis
    // x = a * cos(t)
    // z = b * sin(t)
    planetRef.current.position.x = -semiMajorAxis * eccentricity + semiMajorAxis * Math.cos(progress.current);
    planetRef.current.position.z = semiMinorAxis * Math.sin(progress.current);

    // Keep size visually constant regardless of zoom level
    const dist = camera.position.distanceTo(planetRef.current.position);
    const scale = dist * 0.0125;
    planetRef.current.scale.set(scale, scale, scale);
  });

  const pClass = classifyPlanet(planet);
  const visuals = getPlanetVisuals(planet);
  const texture = useTexture(visuals.textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const pathColor = isSelected ? pClass.color : "#9ca3af";
  const pathThickness = isSelected ? 2.5 : 1.5;
  const pathOpacity = isSelected ? 0.7 : 0.3;

  const planetColor = isSelected ? "#ffffff" : visuals.tintColor;

  return (
    <group>
      <Line points={points} color={pathColor} lineWidth={pathThickness} transparent opacity={pathOpacity} />
      <mesh 
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPlanet(planet);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[0.75, 32, 32]} /> {/* Reduced size as requested */}
        <meshBasicMaterial 
          map={texture}
          color={planetColor} 
        />
        <Billboard>
          <Text 
            position={[0, -1.2, 0]} 
            fontSize={0.9} 
            color={isSelected ? "#ffffff" : "#cbd5e1"} 
            anchorX="center" 
            anchorY="top"
          >
            {planet.pl_name}
          </Text>
        </Billboard>
      </mesh>
    </group>
  );
}

function CameraResetter({ selectedStarHostname }: { selectedStarHostname: string | null }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    camera.position.set(0.01, 80, 0);
    camera.zoom = 1;
    camera.updateProjectionMatrix();

    if (controls) {
      // @ts-ignore
      controls.target.set(0, 0, 0);
      // @ts-ignore
      controls.update();
    }
  }, [selectedStarHostname, camera, controls]);

  return null;
}

export function CenterPane() {
  const { planets, selectedPlanet, selectedStarHostname, isLoading } = usePlanetStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSolarSystem, setShowSolarSystem] = useState(false);

  // Only show planets belonging to the currently selected star
  const starPlanets = useMemo(
    () => {
      if (selectedStarHostname === 'Sun') {
        return SOLAR_SYSTEM.map(sp => ({
          ...sp,
          hostname: 'The Sun',
          st_teff: 5778,
          st_rad: 1.0,
          st_lum: 0.0,
          st_mass: 1.0,
          sy_dist: 0
        }));
      }
      return selectedStarHostname ? planets.filter(p => p.hostname === selectedStarHostname) : planets;
    },
    [planets, selectedStarHostname]
  );

  // Calculate maximum apocenter (farthest point from star) for exoplanets taking into account eccentricity
  const getApo = (p: any) => (p.pl_orbsmax || 0) * (1 + (p.pl_orbeccen || 0));
  const validOrbits = starPlanets.map(getApo).filter(val => val > 0);
  const maxExoApo = validOrbits.length > 0 ? Math.max(...validOrbits) : 0.1;

  // Find solar planets for comparison: show at least 1 enveloping planet
  const encirclingIndex = SOLAR_SYSTEM.findIndex(sp => getApo(sp) >= maxExoApo);
  let solarBoundaryIdx;
  if (encirclingIndex === -1) {
    // Exoplanets are beyond Neptune, show full solar system
    solarBoundaryIdx = SOLAR_SYSTEM.length - 1;
  } else {
    // Show the first enveloping planet
    solarBoundaryIdx = encirclingIndex;
  }
  
  // Guard: Always show at least up to Mars for terrestrial scale context
  const marsIdx = 3; // Mercury, Venus, Earth, Mars
  solarBoundaryIdx = Math.max(solarBoundaryIdx, marsIdx);
  
  const furthestSolarApo = getApo(SOLAR_SYSTEM[solarBoundaryIdx]);
  const solarBoundaryApo = furthestSolarApo;

  // Use all available space: fit the maximum of exoplanets or included solar markers to the viewport
  // A radius of ~30-32 units fits the 45-degree horizontal FOV well at y=80
  const effectiveMaxApo = (showSolarSystem && selectedStarHostname !== 'Sun') ? Math.max(maxExoApo, solarBoundaryApo) : maxExoApo;
  const orbitScale = 32 / (effectiveMaxApo || 1);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden shadow-inner">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm">Querying Archive...</p>
          </div>
        </div>
      )}

      {(!isLoading && starPlanets.length === 0) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
           <div className="text-center bg-slate-900/60 p-8 rounded-2xl border border-slate-800/80 backdrop-blur-sm shadow-2xl flex flex-col items-center">
             <OrbitIcon className="w-12 h-12 text-indigo-500/50 mb-4" />
             <p className="font-medium text-slate-200 text-lg tracking-wide">Observation Bay Offline</p>
             <p className="text-sm mt-2 text-slate-500 max-w-xs">Search for a star system to visualize its complete planetary arrangement.</p>
           </div>
        </div>
      )}

      {planets.length > 0 && (
         <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
           <button 
             onClick={() => setIsAnimating(!isAnimating)}
             className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 backdrop-blur border border-slate-700 shadow-lg transition-all font-medium text-sm"
           >
             {isAnimating ? <Square className="w-4 h-4 fill-slate-300" /> : <Play className="w-4 h-4 fill-slate-300" />}
             {isAnimating ? 'Stop Animation' : 'Start Animation'}
           </button>
           {selectedStarHostname !== 'Sun' && (
             <button 
               onClick={() => setShowSolarSystem(!showSolarSystem)}
               className={`rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 backdrop-blur border shadow-lg transition-all font-medium text-sm ${showSolarSystem ? 'bg-indigo-600/90 border-indigo-500 hover:bg-indigo-500/90 text-white' : 'bg-slate-800/90 border-slate-700 hover:bg-slate-700/90 text-slate-200'}`}
             >
               <Sun className={`w-4 h-4 ${showSolarSystem ? 'text-white' : 'text-slate-300'}`} />
               {showSolarSystem ? 'Hide Solar System' : 'Compare Solar System'}
             </button>
           )}
         </div>
      )}

      <Canvas 
        camera={{ position: [0.01, 80, 0], fov: 45 }} 
        style={{ width: '100%', height: '100%' }}
      >
        <CameraResetter selectedStarHostname={selectedStarHostname} />
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#fef08a" distance={100} />
        
        {/* Central Star label from selected star */}
        <CentralStar planets={starPlanets} />
        
        <HabitableZone planets={starPlanets} orbitScale={orbitScale} />
        
        {starPlanets.map(planet => (
          <PlanetOrbit 
            key={planet.pl_name} 
            planet={planet} 
            isAnimating={isAnimating} 
            isSelected={selectedPlanet?.pl_name === planet.pl_name}
            orbitScale={orbitScale}
          />
        ))}

        {showSolarSystem && selectedStarHostname !== 'Sun' && starPlanets.length > 0 && SOLAR_SYSTEM.slice(0, solarBoundaryIdx + 1).map(sp => (
           <SolarPlanetOrbit 
             key={sp.pl_name} 
             planet={sp} 
             isAnimating={isAnimating} 
             maxBoundary={effectiveMaxApo}
             orbitScale={orbitScale}
           />
        ))}
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={isAnimating ? 1 : 0} />
        <OrbitControls 
          makeDefault 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={false} 
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
          }}
        />
      </Canvas>
    </div>
  );
}
