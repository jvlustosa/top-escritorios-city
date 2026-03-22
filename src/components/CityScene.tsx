'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Building from './Building';
import { Office } from '@/data/mock-offices';

interface CitySceneProps {
  offices: Office[];
  onSelectOffice: (office: Office) => void;
}

function CityGrid({ offices, onSelectOffice }: CitySceneProps) {
  const cols = Math.ceil(Math.sqrt(offices.length));
  const spacing = 2;

  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[cols * spacing + 4, cols * spacing + 4]} />
        <meshStandardMaterial color="#12121f" />
      </mesh>

      {/* Road grid lines */}
      {Array.from({ length: cols + 1 }).map((_, i) => {
        const pos = (i - cols / 2) * spacing;
        return (
          <group key={`road-${i}`}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos - spacing / 2, 0.005, 0]}>
              <planeGeometry args={[0.3, cols * spacing + 4]} />
              <meshStandardMaterial color="#1a1a2f" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, pos - spacing / 2]}>
              <planeGeometry args={[cols * spacing + 4, 0.3]} />
              <meshStandardMaterial color="#1a1a2f" />
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
      camera={{
        zoom: 80,
        position: [10, 10, 10],
        near: -100,
        far: 100,
      }}
      style={{ background: '#0a0a0f' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.7} color="#ffffff" />
      <pointLight position={[-3, 5, -3]} intensity={0.4} color="#ff9944" />
      <pointLight position={[3, 4, 3]} intensity={0.3} color="#4488ff" />

      <CityGrid offices={offices} onSelectOffice={onSelectOffice} />

      <OrbitControls
        enableRotate={true}
        enableZoom={false}
        enablePan={true}
        maxPolarAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 6}
      />
    </Canvas>
  );
}
