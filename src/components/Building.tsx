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

// ─── Building shapes ──────────────────────────────────────────────────────────

type BuildingShape = 'box' | 'cylinder' | 'hexagon' | 'lshape';

function getBuildingShape(index: number): BuildingShape {
  const r = seededRandom(index * 317 + 41);
  const v = r();
  if (v < 0.40) return 'box';
  if (v < 0.60) return 'cylinder';
  if (v < 0.80) return 'hexagon';
  return 'lshape';
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

type BillboardPlacement = 'top' | 'left' | 'right';

function FacadeBillboard({ url, w, d, h, placement }: { url: string; w: number; d: number; h: number; placement: BillboardPlacement }) {
  const texture = useLoader(THREE.TextureLoader, url);
  const boardW = w * 0.7;
  const boardH = w * 0.35;
  const boardD = 0.04;
  const frameT = 0.015;
  const poleR = 0.012;
  const poleH = boardH * 0.6;

  const metalMat = <meshStandardMaterial color="#707070" metalness={0.9} roughness={0.2} />;

  // Position billboard based on placement — always at rooftop level
  let groupPos: [number, number, number];
  let groupRot: [number, number, number] = [0, 0, 0];

  if (placement === 'top') {
    // Centered on top with vertical poles
    groupPos = [0, h + poleH + boardH / 2, 0];
  } else {
    // Side-mounted: billboard sits at roof edge, flush against the wall face
    const side = placement === 'left' ? -1 : 1;
    // Billboard center is just outside the wall, at rooftop height
    groupPos = [side * (w / 2 + boardD / 2 + 0.005), h - boardH * 0.1, 0];
    groupRot = [0, Math.PI / 2, 0]; // rotate to face outward from the wall
  }

  const isSide = placement !== 'top';

  return (
    <group position={groupPos} rotation={groupRot}>
      {/* ── 3D billboard box ── */}
      <mesh castShadow>
        <boxGeometry args={[boardW, boardH, boardD]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* ── Metal frame ── */}
      <mesh position={[0, boardH / 2, 0]}>
        <boxGeometry args={[boardW + frameT * 2, frameT, boardD + frameT]} />
        {metalMat}
      </mesh>
      <mesh position={[0, -boardH / 2, 0]}>
        <boxGeometry args={[boardW + frameT * 2, frameT, boardD + frameT]} />
        {metalMat}
      </mesh>
      <mesh position={[-boardW / 2, 0, 0]}>
        <boxGeometry args={[frameT, boardH, boardD + frameT]} />
        {metalMat}
      </mesh>
      <mesh position={[boardW / 2, 0, 0]}>
        <boxGeometry args={[frameT, boardH, boardD + frameT]} />
        {metalMat}
      </mesh>

      {/* ── Logo — front ── */}
      <mesh position={[0, 0, boardD / 2 + 0.002]}>
        <planeGeometry args={[boardW * 0.8, boardH * 0.7]} />
        <meshStandardMaterial
          map={texture} transparent
          emissive={new THREE.Color('#ffffff')} emissiveMap={texture} emissiveIntensity={0.25}
        />
      </mesh>
      {/* ── Logo — back ── */}
      <mesh position={[0, 0, -(boardD / 2 + 0.002)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[boardW * 0.8, boardH * 0.7]} />
        <meshStandardMaterial
          map={texture} transparent
          emissive={new THREE.Color('#ffffff')} emissiveMap={texture} emissiveIntensity={0.25}
        />
      </mesh>

      {/* ── Support structure ── */}
      {!isSide ? (
        <>
          {/* Top: vertical poles + braces */}
          <mesh position={[-boardW * 0.32, -(boardH / 2 + poleH / 2), 0]}>
            <cylinderGeometry args={[poleR, poleR, poleH, 6]} />
            {metalMat}
          </mesh>
          <mesh position={[boardW * 0.32, -(boardH / 2 + poleH / 2), 0]}>
            <cylinderGeometry args={[poleR, poleR, poleH, 6]} />
            {metalMat}
          </mesh>
          <mesh position={[-boardW * 0.22, -(boardH / 2 + poleH * 0.35), 0]} rotation={[0, 0, 0.45]}>
            <cylinderGeometry args={[poleR * 0.6, poleR * 0.6, poleH * 0.5, 4]} />
            {metalMat}
          </mesh>
          <mesh position={[boardW * 0.22, -(boardH / 2 + poleH * 0.35), 0]} rotation={[0, 0, -0.45]}>
            <cylinderGeometry args={[poleR * 0.6, poleR * 0.6, poleH * 0.5, 4]} />
            {metalMat}
          </mesh>
          <mesh position={[0, -(boardH / 2 + poleH * 0.6), 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[poleR * 0.5, poleR * 0.5, boardW * 0.64, 4]} />
            {metalMat}
          </mesh>
        </>
      ) : (
        <>
          {/* Side-mounted: L-shaped brackets from building wall */}
          {/* Left vertical bracket on wall */}
          <mesh position={[-boardW * 0.3, -boardH * 0.3, 0]}>
            <boxGeometry args={[frameT, boardH * 0.5, frameT]} />
            {metalMat}
          </mesh>
          {/* Right vertical bracket on wall */}
          <mesh position={[boardW * 0.3, -boardH * 0.3, 0]}>
            <boxGeometry args={[frameT, boardH * 0.5, frameT]} />
            {metalMat}
          </mesh>
          {/* Diagonal brace — left */}
          <mesh position={[-boardW * 0.3, boardH * 0.15, boardD * 0.8]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[poleR * 0.5, poleR * 0.5, boardH * 0.4, 4]} />
            {metalMat}
          </mesh>
          {/* Diagonal brace — right */}
          <mesh position={[boardW * 0.3, boardH * 0.15, boardD * 0.8]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[poleR * 0.5, poleR * 0.5, boardH * 0.4, 4]} />
            {metalMat}
          </mesh>
        </>
      )}
    </group>
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

  const billboardPlacement = useMemo((): BillboardPlacement => {
    const r = seededRandom(index * 251 + 13);
    const v = r();
    if (v < 0.45) return 'top';
    if (v < 0.72) return 'left';
    return 'right';
  }, [index]);

  const shape = useMemo(() => getBuildingShape(index), [index]);

  const hasBillboard = office.logo_url && office.tier >= 2;
  const billboardOnTop = hasBillboard && billboardPlacement === 'top';
  const tooltipY = h + (billboardOnTop ? w * 0.35 + 0.5 : 0.4) + (office.chat_juridico_client ? 0.4 : 0);

  // Radius for cylindrical/hex shapes
  const radius = Math.max(w, d) * 0.5;

  const outlineGeom = useMemo(() => {
    if (shape === 'cylinder') return new THREE.CylinderGeometry(radius + 0.02, radius + 0.02, h, 16);
    if (shape === 'hexagon') return new THREE.CylinderGeometry(radius + 0.02, radius + 0.02, h, 6);
    return new THREE.BoxGeometry(w + 0.04, h, d + 0.04);
  }, [w, h, d, radius, shape]);

  // Window pattern
  const windows = useMemo(() => {
    const r = seededRandom(index * 137 + 7);
    // consume tier sizing randoms
    r(); r(); r();
    const floorH = 0.35;
    const rows = Math.floor((h - 0.4) / floorH);
    const result: { x: number; y: number; z: number; ry: number; gw: number; gh: number; lit: boolean }[] = [];

    if (shape === 'cylinder' || shape === 'hexagon') {
      // Windows around circumference
      const segments = shape === 'cylinder' ? 12 : 6;
      const winW = (2 * Math.PI * radius) / segments * 0.6;
      for (let row = 0; row < rows; row++) {
        const y = 0.4 + row * floorH;
        if (y > h - 0.2) break;
        for (let seg = 0; seg < segments; seg++) {
          const angle = (seg / segments) * Math.PI * 2;
          const wx = Math.sin(angle) * (radius + 0.002);
          const wz = Math.cos(angle) * (radius + 0.002);
          result.push({ x: wx, y, z: wz, ry: angle, gw: winW, gh: floorH * 0.6, lit: r() > 0.7 });
        }
      }
    } else if (shape === 'lshape') {
      // L-shape: main block + wing — windows on outer faces
      const cols = Math.max(2, Math.min(office.tier, 4));
      const colW = (w * 0.8) / cols;
      const wingW = w * 0.45;
      const wingD = d * 0.45;
      for (let row = 0; row < rows; row++) {
        const y = 0.4 + row * floorH;
        if (y > h - 0.2) break;
        // Main block front
        for (let col = 0; col < cols; col++) {
          const x = (col - (cols - 1) / 2) * colW;
          result.push({ x, y, z: d / 2 + 0.002, ry: 0, gw: colW * 0.8, gh: floorH * 0.6, lit: r() > 0.7 });
        }
        // Main block back (partial — wing covers part)
        for (let col = 0; col < Math.ceil(cols / 2); col++) {
          const x = (col - (cols - 1) / 2) * colW - wingW * 0.2;
          result.push({ x, y, z: -d / 2 - 0.002, ry: Math.PI, gw: colW * 0.8, gh: floorH * 0.6, lit: r() > 0.75 });
        }
        // Wing front (extends to the side)
        result.push({ x: w / 2 + wingW * 0.3, y, z: -(d / 2 - wingD / 2) + wingD / 2 + 0.002, ry: 0, gw: wingW * 0.6, gh: floorH * 0.6, lit: r() > 0.7 });
        // Sides
        result.push({ x: w / 2 + 0.002, y, z: d * 0.15, ry: Math.PI / 2, gw: d * 0.5, gh: floorH * 0.6, lit: r() > 0.75 });
        result.push({ x: -w / 2 - 0.002, y, z: 0, ry: -Math.PI / 2, gw: d * 0.7, gh: floorH * 0.6, lit: r() > 0.75 });
      }
    } else {
      // Standard box
      const cols = Math.max(2, Math.min(office.tier, 4));
      const colW = (w * 0.8) / cols;
      for (let row = 0; row < rows; row++) {
        const y = 0.4 + row * floorH;
        if (y > h - 0.2) break;
        for (let col = 0; col < cols; col++) {
          const x = (col - (cols - 1) / 2) * colW;
          result.push({ x, y, z: d / 2 + 0.002, ry: 0, gw: colW * 0.8, gh: floorH * 0.6, lit: r() > 0.7 });
          result.push({ x, y, z: -d / 2 - 0.002, ry: Math.PI, gw: colW * 0.8, gh: floorH * 0.6, lit: r() > 0.75 });
        }
        const litL = r() > 0.75;
        const litR = r() > 0.75;
        result.push({ x: w / 2 + 0.002, y, z: 0, ry: Math.PI / 2, gw: d * 0.7, gh: floorH * 0.6, lit: litR });
        result.push({ x: -w / 2 - 0.002, y, z: 0, ry: -Math.PI / 2, gw: d * 0.7, gh: floorH * 0.6, lit: litL });
      }
    }
    return result;
  }, [w, d, h, office.tier, index, shape, radius]);

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

      {/* Hover outline */}
      {showTooltip && (
        <lineSegments position={[0, h / 2, 0]} renderOrder={999}>
          <edgesGeometry args={[outlineGeom]} />
          <lineBasicMaterial color="#66ccff" transparent opacity={0.8} linewidth={1} depthTest={false} />
        </lineSegments>
      )}

      <group ref={groupRef} scale={[1, 0.001, 1]}>
        {/* Hit box */}
        <mesh
          position={[0, h / 2, 0]}
          onClick={(e) => { e.stopPropagation(); onClick(office); }}
          onPointerOver={(e) => { e.stopPropagation(); setShowTooltip(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setShowTooltip(false); document.body.style.cursor = 'default'; }}
        >
          {shape === 'cylinder' || shape === 'hexagon'
            ? <cylinderGeometry args={[radius + 0.05, radius + 0.05, h + 0.3, shape === 'hexagon' ? 6 : 16]} />
            : <boxGeometry args={[w + 0.1, h + 0.3, d + 0.1]} />
          }
          <meshStandardMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Body */}
        {shape === 'cylinder' && (
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[radius, radius, h, 24]} />
            <meshStandardMaterial color={bodyColor} metalness={bodyMetal} roughness={bodyRough} />
          </mesh>
        )}
        {shape === 'hexagon' && (
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[radius, radius, h, 6]} />
            <meshStandardMaterial color={bodyColor} metalness={bodyMetal} roughness={bodyRough} />
          </mesh>
        )}
        {shape === 'lshape' && (
          <>
            {/* Main block */}
            <mesh position={[0, h / 2, 0]} castShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color={bodyColor} metalness={bodyMetal} roughness={bodyRough} />
            </mesh>
            {/* Wing extending to the right-back */}
            <mesh position={[w * 0.45, h / 2, -(d * 0.28)]} castShadow>
              <boxGeometry args={[w * 0.45, h, d * 0.45]} />
              <meshStandardMaterial color={bodyColor} metalness={bodyMetal} roughness={bodyRough} />
            </mesh>
          </>
        )}
        {shape === 'box' && (
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={bodyColor} metalness={bodyMetal} roughness={bodyRough} />
          </mesh>
        )}

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
        <mesh position={[0, 0.14, (shape === 'cylinder' || shape === 'hexagon') ? radius + 0.003 : d / 2 + 0.003]}>
          <planeGeometry args={[(shape === 'cylinder' || shape === 'hexagon') ? radius * 0.8 : w * 0.45, 0.26]} />
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
        {office.logo_url && office.tier >= 2 && <FacadeBillboard url={office.logo_url} w={w} d={d} h={h} placement={billboardPlacement} />}

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

        {showTooltip && (() => {
          const tierLabels: Record<number, string> = { 1: 'Iniciante', 2: 'Starter', 3: 'Pro', 4: 'Business', 5: 'Enterprise' };
          return (
            <Html position={[0, tooltipY, 0]} center>
              <div className="bg-black/90 border border-[#333] px-3 py-2.5 whitespace-nowrap pointer-events-none rounded-sm backdrop-blur-sm min-w-[180px]">
                {/* Row 1: rank + name + PLUS badge */}
                <p className="text-white text-sm font-semibold">
                  {office.rank != null && <span className="text-amber-400 mr-1.5">#{office.rank}</span>}
                  {office.name}
                  {office.is_plus && <span className="text-amber-400 text-[9px] ml-1 font-bold">PLUS</span>}
                </p>

                {/* Row 2: location */}
                <p className="text-[#888] text-xs mt-0.5">
                  {office.city}, {office.state}
                </p>

                {/* Row 3: tier label + verification status */}
                <p className="text-xs mt-1">
                  <span className="text-white font-medium">Tier {office.tier} · {tierLabels[office.tier]}</span>
                  <span className="mx-1 text-[#555]">·</span>
                  {office.verified
                    ? <span className="text-emerald-400">Verificado</span>
                    : <span className="text-orange-400">Não verificado · Verifique para subir</span>
                  }
                </p>

                {/* Row 4: tier progress bar */}
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= office.tier ? 'bg-amber-400' : 'bg-[#333]'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-[#666] ml-1">{office.tier}/5</span>
                </div>
              </div>
            </Html>
          );
        })()}
      </group>
    </group>
  );
}
