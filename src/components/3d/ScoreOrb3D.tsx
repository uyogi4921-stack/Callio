"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

interface ScoreOrb3DProps {
  score: number;
  color?: string;
}

function ScoreVisualization({ score, color = "#4A5548" }: ScoreOrb3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  const arcLength = (score / 100) * Math.PI * 2;

  const arcPoints = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.2, 1.2, 0, arcLength, false, 0);
    return curve.getPoints(64).map((p) => new THREE.Vector3(p.x, p.y, 0));
  }, [arcLength]);

  const bgArcPoints = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.2, 1.2, 0, Math.PI * 2, false, 0);
    return curve.getPoints(64).map((p) => new THREE.Vector3(p.x, p.y, 0));
  }, []);

  const orbitParticles = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.4 + Math.random() * 0.3;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.z = -Math.PI / 2;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <Line points={bgArcPoints} color={color} transparent opacity={0.25} lineWidth={2.5} />
        <Line points={arcPoints} color={color} transparent opacity={0.9} lineWidth={3.5} />
      </group>

      <mesh>
        <torusGeometry args={[0.9, 0.005, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[orbitParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.03}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      <Text
        position={[0, 0.1, 0]}
        fontSize={0.7}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {score.toString()}
      </Text>

      <Text
        position={[0, -0.4, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        SCORE
      </Text>

      <pointLight color={color} intensity={2} distance={6} position={[0, 0, 2]} />
    </group>
  );
}

export default function ScoreOrb3D(props: ScoreOrb3DProps) {
  return <ScoreVisualization {...props} />;
}
