import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { usePlanetStore } from '../store/usePlanetStore';
import { SOLAR_SYSTEM_PLANETS, type SolarPlanet } from '../data/solarSystemData';
import { ClampedTextLabel } from './ClampedTextLabel';

function getScaledRadius(distAU: number): number {
  return Math.pow(distAU, 0.58) * 8.5 + 3.0;
}

function SunMarker() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <ClampedTextLabel offsetY={-3.5} text="SOL" fontSize={1.8} color="#fef08a" referenceDistance={45} />
    </group>
  );
}

function OrbitLine({ radius, color, isSelected }: { radius: number; color: string; isSelected: boolean }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={isSelected ? '#ffffff' : color}
      lineWidth={isSelected ? 2 : 1}
      transparent
      opacity={isSelected ? 0.75 : 0.35}
      dashed={!isSelected}
      dashScale={0.5}
      dashSize={1}
      gapSize={1}
    />
  );
}

function SolarPlanetMesh({ planet }: { planet: SolarPlanet }) {
  const { selectedSolarPlanet, setSelectedSolarPlanet } = usePlanetStore();
  const isSelected = selectedSolarPlanet?.name === planet.name;
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitalRadius = getScaledRadius(planet.distAU);

  const initialAngle = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < planet.name.length; i++) {
      hash = (hash << 5) - hash + planet.name.charCodeAt(i);
      hash |= 0;
    }
    return ((Math.abs(hash) % 1000) / 1000) * Math.PI * 2;
  }, [planet.name]);

  const angleRef = useRef(initialAngle);

  const texture = useTexture(planet.textureUrl, (tex) => {
    if (Array.isArray(tex)) {
      tex.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; });
    } else {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
  });

  useFrame((_, delta) => {
    angleRef.current += delta * planet.speed * 0.3;
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angleRef.current) * orbitalRadius;
      meshRef.current.position.z = Math.sin(angleRef.current) * orbitalRadius;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      <OrbitLine radius={orbitalRadius} color={planet.color} isSelected={isSelected} />
      <mesh
        ref={meshRef}
        position={[Math.cos(initialAngle) * orbitalRadius, 0, Math.sin(initialAngle) * orbitalRadius]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSolarPlanet(planet);
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
        {planet.hasRings && (
          <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[planet.radius * 1.4, planet.radius * 2.4, 64]} />
            <meshStandardMaterial color="#fde047" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        )}
        <ClampedTextLabel
          offsetY={-planet.radius - 0.6}
          text={planet.name}
          fontSize={1.2}
          color={isSelected ? "#60a5fa" : "#ffffff"}
          referenceDistance={40}
        />
      </mesh>
    </group>
  );
}

export function InnerSolarSystemPane() {
  return (
    <div className="w-1/2 h-full relative bg-black border-r border-slate-800 shrink-0 overflow-hidden">
      <div className="absolute top-3 left-4 z-20 pointer-events-none">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sistema Solar</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Sol &amp; 8 Planetas (Haz clic en un planeta para explorar sus satélites)</p>
      </div>

      <Canvas camera={{ position: [0, 45, 55], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 0, 0]} intensity={4} color="#fef08a" distance={200} />
        <Stars radius={200} depth={60} count={6000} factor={4} saturation={0} fade />

        <Suspense fallback={null}>
          <SunMarker />
          {SOLAR_SYSTEM_PLANETS.map((planet) => (
            <SolarPlanetMesh key={planet.name} planet={planet} />
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
