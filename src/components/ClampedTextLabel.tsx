import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ClampedTextLabelProps {
  position?: [number, number, number];
  offsetY?: number;
  text: string;
  fontSize?: number;
  color?: string;
  referenceDistance?: number;
  outlineColor?: string;
  outlineWidth?: number;
}

export function ClampedTextLabel({
  position = [0, 0, 0],
  offsetY = 0,
  text,
  fontSize = 1.2,
  color = '#ffffff',
  referenceDistance = 35,
  outlineColor = '#000000',
  outlineWidth = 0.08,
}: ClampedTextLabelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const worldPosRef = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.getWorldPosition(worldPosRef.current);
      const dist = camera.position.distanceTo(worldPosRef.current);
      // Clamp maximum screen size when close (dist < referenceDistance)
      const scale = Math.min(1.0, dist / referenceDistance);
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] + offsetY, position[2]]}>
      <Billboard>
        <Text
          fontSize={fontSize}
          color={color}
          anchorX="center"
          anchorY="top"
          outlineWidth={outlineWidth}
          outlineColor={outlineColor}
        >
          {text}
        </Text>
      </Billboard>
    </group>
  );
}
