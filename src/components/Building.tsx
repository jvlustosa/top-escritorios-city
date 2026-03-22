'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { RankedOffice } from '@/data/mock-offices';

interface BuildingProps {
  office: RankedOffice;
  position: [number, number, number];
  onClick: (office: RankedOffice) => void;
  index: number;
  day: number; // 0 = night, 1 = noon
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Tier sizing ───────────────────────────────────────────────────────────────

function getTierProps(tier: number, rand: () => number) {
  switch (tier) {
    case 5: return { w: 1.0 + rand() * 0.25, d: 0.8 + rand() * 0.2, h: 4.5 + rand() * 1.5 };
    case 4: return { w: 0.85 + rand() * 0.15, d: 0.75 + rand() * 0.12, h: 3.0 + rand() * 0.8 };
    case 3: return { w: 0.7 + rand() * 0.12, d: 0.65 + rand() * 0.1, h: 1.8 + rand() * 0.7 };
    case 2: return { w: 0.58 + rand() * 0.1, d: 0.52 + rand() * 0.08, h: 1.1 + rand() * 0.4 };
    default: return { w: 0.46 + rand() * 0.08, d: 0.42 + rand() * 0.06, h: 0.7 + rand() * 0.3 };
  }
}

// ─── Billboard on facade ──────────────────────────────────────────────────────

function FacadeBillboard({ url, w, d, h }: { url: string; w: number; d: number; h: number }) {
  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <mesh position={[0, h * 0.75, d / 2 + 0.003]}>
      <planeGeometry args={[w * 0.5, w * 0.25]} />
      <meshStandardMaterial
        map={texture}
        transparent
        emissive={new THREE.Color('#ffffff')}
        emissiveMap={texture}
        emissiveIntensity={0.3}
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}

// ─── Main Building ─────────────────────────────────────────────────────────────

export default function Building({ office, position, onClick, index, day }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outlineRef = useRef<THREE.Group>(null);
  const plusGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const plusRingRef = useRef<THREE.Mesh>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const appearProgress = useRef(0);

  const rand = useMemo(() => seededRandom(index * 137 + 7), [index]);

  const { w, d, h } = useMemo(() => {
    const r = seededRandom(index * 137 + 7);
    return getTierProps(office.tier, r);
  }, [office.tier, index]);

  const tooltipY = h + 0.4 + (office.chat_juridico_client ? 0.4 : 0);

  const outlineGeom = useMemo(() => new THREE.BoxGeometry(w + 0.04, h, d + 0.04), [w, h, d]);

  // Window pattern
  const windows = useMemo(() => {
    const r = seededRandom(index * 137 + 7);
    // consume tier sizing randoms
    r(); r(); r();
    const cols = Math.max(2, Math.min(office.tier, 4));
    const floorH = 0.35;
    const rows = Math.floor((h - 0.4) / floorH);
    const colW = (w * 0.8) / cols;
    const result: { x: number; y: number; z: number; ry: number; gw: number; gh: number; lit: boolean }[] = [];

    for (let row = 0; row < rows; row++) {
      const y = 0.4 + row * floorH;
      if (y > h - 0.2) break;
      // front + back
      for (let col = 0; col < cols; col++) {
        const x = (col - (cols - 1) / 2) * colW;
        const lit = r() > 0.3;
        result.push({ x, y, z: d / 2 + 0.002, ry: 0, gw: colW * 0.8, gh: floorH * 0.6, lit });
        result.push({ x, y, z: -d / 2 - 0.002, ry: Math.PI, gw: colW * 0.8, gh: floorH * 0.6, lit: r() > 0.35 });
      }
      // sides
      const litL = r() > 0.35;
      const litR = r() > 0.35;
      result.push({ x: w / 2 + 0.002, y, z: 0, ry: Math.PI / 2, gw: d * 0.7, gh: floorH * 0.6, lit: litR });
      result.push({ x: -w / 2 - 0.002, y, z: 0, ry: -Math.PI / 2, gw: d * 0.7, gh: floorH * 0.6, lit: litL });
    }
    return result;
  }, [w, d, h, office.tier, index]);

  // Body color by tier
  const bodyColor = office.tier >= 4 ? '#c0ccd8' : office.tier === 3 ? '#c0b8a8' : '#b0b0b0';
  const bodyMetal = office.tier >= 4 ? 0.4 : 0.1;
  const bodyRough = office.tier >= 4 ? 0.15 : 0.7;

  // Day: blueish glass reflection, lights off. Night: warm lit windows.
  const isDay = day > 0.5;
  const glassColor = isDay ? '#6badd4' : '#90b8d0';
  const glassLit = isDay ? '#6badd4' : '#ffe8c0';
  const glassDark = isDay ? '#4a7fa8' : '#304050';
  const glassMetalness = isDay ? 0.85 : 0.5;
  const glassRoughness = isDay ? 0.05 : 0.1;

  const animDone = useRef(false);

  useFrame(({ clock }, delta) => {
    // Plus glow pulse animation
    if (plusGlowRef.current) {
      plusGlowRef.current.emissiveIntensity = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2));
    }

    // Plus + ChatJurídico ring rotation
    if (plusRingRef.current) {
      plusRingRef.current.rotation.y = clock.elapsedTime * 2;
    }

    if (animDone.current) return;
    const delay = Math.min(index * 0.05, 0.4);
    appearProgress.current = Math.min(appearProgress.current + delta * 1.0, 1);
    const t = Math.max(0, (appearProgress.current - delay) / (1 - delay));
    const eased = 1 - Math.pow(1 - Math.min(t, 1), 3);

    if (groupRef.current) groupRef.current.scale.setY(Math.max(0.001, eased));

    if (outlineRef.current) {
      const op = eased < 0.15 ? eased / 0.15 : Math.max(0, 1 - (eased - 0.15) / 0.4);
      outlineRef.current.visible = eased < 0.55;
      outlineRef.current.traverse((child) => {
        if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
          child.material.opacity = op;
        }
      });
    }

    if (eased >= 0.999) {
      animDone.current = true;
      if (outlineRef.current) outlineRef.current.visible = false;
    }
  });

  return (
    <group position={position}>
      {/* Wireframe reveal */}
      <group ref={outlineRef}>
        <lineSegments position={[0, h / 2, 0]}>
          <edgesGeometry args={[outlineGeom]} />
          <lineBasicMaterial color="#5599bb" transparent opacity={0} linewidth={1} />
        </lineSegments>
      </group>

      <group ref={groupRef} scale={[1, 0.001, 1]}>
        {/* Hit box */}
        <mesh
          position={[0, h / 2, 0]}
          onClick={(e) => { e.stopPropagation(); onClick(office); }}
          onPointerOver={(e) => { e.stopPropagation(); setShowTooltip(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setShowTooltip(false); document.body.style.cursor = 'default'; }}
        >
          <boxGeometry args={[w + 0.1, h + 0.3, d + 0.1]} />
          <meshStandardMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Body */}
        <mesh position={[0, h / 2, 0]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={bodyColor} metalness={bodyMetal} roughness={bodyRough} />
        </mesh>

        {/* Windows */}
        {windows.map((win, i) => (
          <mesh key={i} position={[win.x, win.y, win.z]} rotation={[0, win.ry, 0]}>
            <planeGeometry args={[win.gw, win.gh]} />
            <meshStandardMaterial
              color={win.lit ? glassColor : glassDark}
              emissive={isDay ? '#000000' : (win.lit ? glassLit : '#000000')}
              emissiveIntensity={isDay ? 0 : (win.lit ? 0.7 : 0)}
              metalness={glassMetalness}
              roughness={glassRoughness}
              envMapIntensity={isDay ? 1.5 : 0.3}
            />
          </mesh>
        ))}

        {/* Lobby */}
        <mesh position={[0, 0.14, d / 2 + 0.003]}>
          <planeGeometry args={[w * 0.45, 0.26]} />
          <meshStandardMaterial
            color={isDay ? '#a0c0d0' : '#ffe8b0'}
            emissive={isDay ? '#000000' : '#ffe8b0'}
            emissiveIntensity={isDay ? 0 : 1.0}
            transparent
            opacity={isDay ? 0.5 : 0.8}
            metalness={isDay ? 0.7 : 0}
            roughness={isDay ? 0.1 : 0.5}
          />
        </mesh>

        {/* Facade billboard */}
        {office.logo_url && office.tier >= 2 && <FacadeBillboard url={office.logo_url} w={w} d={d} h={h} />}

        {/* Chat Jurídico antenna */}
        {office.chat_juridico_client && !office.is_plus && (
          <>
            <mesh position={[0, h + 0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 6]} />
              <meshStandardMaterial color="#d0d0d0" />
            </mesh>
            <mesh position={[0, h + 0.28, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} />
            </mesh>
          </>
        )}

        {/* Plus + ChatJurídico holographic antenna */}
        {office.chat_juridico_client && office.is_plus && (
          <>
            <mesh position={[0, h + 0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 6]} />
              <meshStandardMaterial color="#d0d0d0" />
            </mesh>
            <mesh position={[0, h + 0.28, 0]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={3} />
            </mesh>
            <mesh ref={plusRingRef} position={[0, h + 0.28, 0]}>
              <torusGeometry args={[0.06, 0.008, 8, 16]} />
              <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={3} />
            </mesh>
          </>
        )}

        {/* Verified ground glow — emissive plane instead of pointLight */}
        {office.verified && (
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w * 0.6, d * 0.6]} />
            <meshStandardMaterial color="#ffd080" emissive="#ffd080" emissiveIntensity={0.3} transparent opacity={0.4} />
          </mesh>
        )}

        {/* Plus glow ring at base */}
        {office.is_plus && (
          <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w * 1.4, d * 1.4]} />
            <meshStandardMaterial ref={plusGlowRef} color="#ffd700" emissive="#ffd700" emissiveIntensity={0.3} transparent opacity={0.5} />
          </mesh>
        )}

        {/* Plus name sign (letreiro) */}
        {office.is_plus && (
          <Html position={[0, h + 0.15, 0]} center>
            <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white text-[9px] px-2 py-0.5 rounded-sm font-bold whitespace-nowrap shadow-lg pointer-events-none">
              {office.name}
            </div>
          </Html>
        )}

        {showTooltip && (
          <Html position={[0, tooltipY, 0]} center>
            <div className="bg-black/90 border border-[#333] px-3 py-2 whitespace-nowrap pointer-events-none rounded-sm backdrop-blur-sm">
              <p className="text-white text-sm font-semibold">
                {office.rank != null && <span className="text-amber-400 mr-1.5">#{office.rank}</span>}
                {office.name}
                {office.is_plus && <span className="text-amber-400 text-[9px] ml-1 font-bold">PLUS</span>}
              </p>
              <p className="text-[#888] text-xs mt-0.5">
                {office.city}, {office.state}
                {!office.verified && ' · Não verificado'}
              </p>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
