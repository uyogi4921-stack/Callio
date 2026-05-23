"use client";

import { Suspense, lazy, type ComponentType } from "react";

interface Scene3DWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
}

const Canvas = lazy(() =>
  import("@react-three/fiber").then((mod) => ({
    default: mod.Canvas as ComponentType<any>,
  }))
);

export default function Scene3DWrapper({
  children,
  className,
  style,
  cameraPosition = [0, 0, 5],
  cameraFov = 45,
}: Scene3DWrapperProps) {
  return (
    <Suspense fallback={null}>
      <Canvas
        className={className}
        style={style}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        camera={{ position: cameraPosition, fov: cameraFov }}
      >
        {children}
      </Canvas>
    </Suspense>
  );
}
