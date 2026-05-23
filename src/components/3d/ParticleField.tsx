"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  color?: string;
  spread?: number;
  speed?: number;
}

function Particles({
  count = 80,
  color = "#4A5548",
  spread = 6,
  speed = 0.3,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return { positions: pos, velocities: vel };
  }, [count, spread]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = Math.random() * 1.5 + 0.3;
    }
    return s;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime * speed;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3] + Math.sin(t + i) * 0.001;
      arr[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(t + i * 0.7) * 0.001;
      arr[i * 3 + 2] += velocities[i * 3 + 2];

      const halfSpread = spread / 2;
      for (let j = 0; j < 3; j++) {
        const limit = j === 2 ? halfSpread * 0.5 : halfSpread;
        if (Math.abs(arr[i * 3 + j]) > limit) {
          velocities[i * 3 + j] *= -1;
          arr[i * 3 + j] = Math.sign(arr[i * 3 + j]) * limit;
        }
      }
    }

    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.05;
  });

  const vertexShader = `
    attribute float size;
    varying float vAlpha;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (80.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      vAlpha = smoothstep(0.0, 1.0, 1.0 - length(position.xy) / 4.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, d) * vAlpha * 0.35;
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
    }),
    [color]
  );

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleField(props: ParticleFieldProps) {
  return <Particles {...props} />;
}
