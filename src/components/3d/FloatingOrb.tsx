"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingOrbProps {
  color?: string;
  pulseSpeed?: number;
  size?: number;
  intensity?: number;
}

function Orb({
  color = "#4A5548",
  pulseSpeed = 1.2,
  size = 1.5,
  intensity = 0.8,
}: FloatingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [color, intensity]
  );

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;

      vec3 pos = position;
      float displacement = sin(pos.x * 3.0 + uTime) * 0.04
                         + sin(pos.y * 4.0 + uTime * 1.3) * 0.03
                         + sin(pos.z * 2.5 + uTime * 0.7) * 0.05;
      pos += normal * displacement;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uIntensity;

    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);

      vec3 innerColor = uColor * 0.6;
      vec3 outerColor = uColor * 1.4;
      vec3 finalColor = mix(innerColor, outerColor, fresnel);

      float pulse = sin(uTime * 2.0) * 0.15 + 0.85;
      float alpha = (0.7 + fresnel * 0.3) * uIntensity * pulse;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const glowVertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const glowFragmentShader = `
    varying vec3 vNormal;
    uniform vec3 uColor;
    uniform float uTime;

    void main() {
      float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      float pulse = sin(uTime * 1.5) * 0.2 + 0.8;
      gl_FragColor = vec4(uColor * 1.5, intensity * 0.5 * pulse);
    }
  `;

  useFrame((state) => {
    const t = state.clock.elapsedTime * pulseSpeed;
    uniforms.uTime.value = t;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.08;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.2;
      ringRef.current.rotation.z = t * 0.3;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 3 + Math.cos(t * 0.3) * 0.15;
      ring2Ref.current.rotation.z = -t * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[size, 8]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      <mesh ref={glowRef} scale={1.3}>
        <icosahedronGeometry args={[size, 8]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.BackSide}
        />
      </mesh>

      <mesh ref={ringRef}>
        <torusGeometry args={[size * 1.4, 0.015, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[size * 1.6, 0.01, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      <pointLight color={color} intensity={2} distance={8} />
    </group>
  );
}

export default function FloatingOrb(props: FloatingOrbProps) {
  return <Orb {...props} />;
}
