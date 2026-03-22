'use client';

import { Suspense, useLayoutEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Building from './Building';
import { Office } from '@/data/mock-offices';

interface CitySceneProps {
  offices: Office[];
  onSelectOffice: (office: Office) => void;
}

function KeyLight() {
  const ref = useRef<THREE.DirectionalLight>(null);

  useLayoutEffect(() => {
    const cam = ref.current?.shadow?.camera;
    if (!cam) return;
    cam.left = -24;
    cam.right = 24;
    cam.top = 24;
    cam.bottom = -24;
    cam.near = 1;
    cam.far = 64;
    cam.updateProjectionMatrix();
  }, []);

  return (
    <directionalLight
      ref={ref}
      castShadow
      position={[11, 18, 9]}
      intensity={1}
      color="#fffaf5"
      shadow-mapSize={[1536, 1536]}
      shadow-bias={-0.00028}
      shadow-normalBias={0.025}
    />
  );
}

function CityGrid({ offices, onSelectOffice }: CitySceneProps) {
  const cols = Math.ceil(Math.sqrt(offices.length));
  const spacing = 2;

  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[cols * spacing + 4, cols * spacing + 4]} />
        <meshStandardMaterial color="#ede9fe" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Road grid lines */}
      {Array.from({ length: cols + 1 }).map((_, i) => {
        const pos = (i - cols / 2) * spacing;
        return (
          <group key={`road-${i}`}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos - spacing / 2, 0.006, 0]} receiveShadow>
              <planeGeometry args={[0.28, cols * spacing + 4]} />
              <meshStandardMaterial color="#d4cafc" roughness={0.85} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, pos - spacing / 2]} receiveShadow>
              <planeGeometry args={[cols * spacing + 4, 0.28]} />
              <meshStandardMaterial color="#d4cafc" roughness={0.85} />
            </mesh>
          </group>
        );
      })}

      {/* Buildings */}
      {offices.map((office, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col - cols / 2) * spacing;
        const z = (row - cols / 2) * spacing;
        return (
          <Building
            key={office.id}
            office={office}
            position={[x, 0, z]}
            onClick={onSelectOffice}
          />
        );
      })}
    </>
  );
}

export default function CityScene({ offices, onSelectOffice }: CitySceneProps) {
  return (
    <Canvas
      orthographic
      shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{
        zoom: 80,
        position: [12, 11, 12],
        near: -200,
        far: 200,
      }}
      style={{ background: '#f5f3ff' }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.28} />
      </Suspense>

      <ambientLight intensity={0.42} />
      <KeyLight />
      <pointLight position={[-4, 6, -4]} intensity={0.35} color="#e2498a" />
      <pointLight position={[4, 5, 4]} intensity={0.35} color="#5636d1" />

      <CityGrid offices={offices} onSelectOffice={onSelectOffice} />

      <OrbitControls
        makeDefault
        enableRotate
        enableZoom
        enablePan
        enableDamping
        dampingFactor={0.065}
        rotateSpeed={0.68}
        panSpeed={0.88}
        zoomSpeed={0.85}
        screenSpacePanning
        target={[0, 0, 0]}
        minZoom={48}
        maxZoom={145}
        minPolarAngle={0.22}
        maxPolarAngle={Math.PI / 2 - 0.06}
      />
    </Canvas>
  );
}
