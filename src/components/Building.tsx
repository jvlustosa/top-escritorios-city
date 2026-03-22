'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Office } from '@/data/mock-offices';

const TIER_COLORS: Record<number, string> = {
  1: '#4a4a6a',
  2: '#5a5a8a',
  3: '#3a5a9a',
  4: '#2a4a8a',
  5: '#1a3a7a',
};

const VERIFIED_COLOR = '#4488cc';
const GOLD = '#F5C518';

interface BuildingProps {
  office: Office;
  position: [number, number, number];
  onClick: (office: Office) => void;
}

export default function Building({ office, position, onClick }: BuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const floors = office.tier;
  const height = 0.5 + floors * 0.7;
  const width = 0.6 + office.tier * 0.1;
  const depth = 0.6 + office.tier * 0.1;

  const baseColor = office.verified ? VERIFIED_COLOR : TIER_COLORS[office.tier] || TIER_COLORS[1];

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <group position={position}>
      {/* Main building */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(office);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setShowTooltip(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          setShowTooltip(false);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={hovered ? '#6688bb' : baseColor}
          transparent={office.verified}
          opacity={office.verified ? 0.85 : 1}
          metalness={office.verified ? 0.6 : 0.1}
          roughness={office.verified ? 0.2 : 0.8}
        />
      </mesh>

      {/* Windows (simple grid of emissive rectangles) */}
      {Array.from({ length: floors }).map((_, floor) =>
        Array.from({ length: Math.min(office.tier, 3) }).map((_, col) => (
          <mesh
            key={`${floor}-${col}`}
            position={[
              -width / 2 - 0.001,
              0.6 + floor * 0.7,
              (col - 1) * 0.25,
            ]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.12, 0.18]} />
            <meshStandardMaterial
              color="#ffffaa"
              emissive="#ffffaa"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))
      )}

      {/* Gold antenna for Chat Jurídico clients */}
      {office.chat_juridico_client && (
        <>
          <mesh position={[0, height + 0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <meshStandardMaterial
              color={GOLD}
              emissive={GOLD}
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, height + 0.65, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={GOLD}
              emissive={GOLD}
              emissiveIntensity={1}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Glow effect */}
          <pointLight
            position={[0, height + 0.65, 0]}
            color={GOLD}
            intensity={0.5}
            distance={2}
          />
        </>
      )}

      {/* Verified badge - small checkmark plate */}
      {office.verified && (
        <mesh position={[width / 2 + 0.01, height * 0.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshStandardMaterial
            color="#44cc88"
            emissive="#44cc88"
            emissiveIntensity={0.4}
          />
        </mesh>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <Html position={[0, height + (office.chat_juridico_client ? 1 : 0.4), 0]} center>
          <div className="bg-city-navy/95 border border-city-navy-light rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none shadow-lg">
            <p className="text-white font-heading text-sm font-semibold">
              {office.name}
            </p>
            <p className="text-gray-400 text-xs font-mono">
              {office.city}, {office.state}
            </p>
            {office.chat_juridico_client && (
              <p className="text-city-gold text-xs mt-1">★ Chat Jurídico</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
