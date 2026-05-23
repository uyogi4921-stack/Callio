"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WaveformVisualizerProps {
  color?: string;
  barCount?: number;
}

function Waveform({ color = "#4A5548", barCount = 32 }: WaveformVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null!);

  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => ({
      x: (i / barCount - 0.5) * 4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      baseHeight: 0.1 + Math.random() * 0.3,
    }));
  }, [barCount]);

  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    bars.forEach((bar, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const height =
        bar.baseHeight +
        Math.sin(t * bar.speed + bar.phase) * 0.2 +
        Math.sin(t * 0.5 + i * 0.3) * 0.1;
      const h = Math.max(0.05, Math.abs(height));
      mesh.scale.y = h;
      mesh.position.y = h / 2;
    });
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {bars.map((bar, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
          position={[bar.x, 0, 0]}
        >
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.4 + (i / barCount) * 0.4}
          />
        </mesh>
      ))}

      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 2]} intensity={0.8} />
    </group>
  );
}

export default function WaveformVisualizer(props: WaveformVisualizerProps) {
  return <Waveform {...props} />;
}
