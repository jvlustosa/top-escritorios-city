'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';

import * as THREE from 'three';
import Building from './Building';
import { RankedOffice } from '@/data/mock-offices';

interface CitySceneProps {
  offices: RankedOffice[];
  onSelectOffice: (office: RankedOffice) => void;
  timeOverride?: 'day' | 'night' | 'auto';
}

// --- Day/Night cycle system ---

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

interface TimeOfDay {
  skyColor: string;
  fogColor: string;
  groundColor: string;
  gridLineColor: string;
  ambientIntensity: number;
  sunIntensity: number;
  sunColor: string;
  fillerShadeBase: number;
  showStars: boolean;
  starsFade: number;
  roadMainColor: string;
  roadSecondaryColor: string;
  parkColor: string;
  day: number;
}

function getTimeOfDay(override?: 'day' | 'night' | 'auto'): TimeOfDay {
  let hour: number;
  if (override === 'day') {
    hour = 12; // noon
  } else if (override === 'night') {
    hour = 22; // night
  } else {
    hour = new Date().getHours() + new Date().getMinutes() / 60;
  }

  // Day progress: 0 = night, 1 = noon
  let day: number;
  if (hour >= 6 && hour <= 12) day = (hour - 6) / 6;
  else if (hour > 12 && hour <= 18) day = 1 - (hour - 12) / 6;
  else day = 0;

  // Golden hour detection
  const isSunrise = hour >= 5.5 && hour <= 7.5;
  const isSunset = hour >= 16.5 && hour <= 19;

  const nightSky: [number, number, number] = [5, 5, 15];
  const daySky: [number, number, number] = [135, 185, 230];
  const sunsetSky: [number, number, number] = [60, 25, 55];

  const nightFog: [number, number, number] = [5, 5, 15];
  const dayFog: [number, number, number] = [170, 200, 230];
  const sunsetFog: [number, number, number] = [90, 40, 30];

  // Neutral gray asphalt — no green. Night ground darker so roads contrast.
  const nightGround: [number, number, number] = [6, 6, 10];
  const dayGround: [number, number, number] = [58, 58, 56];
  const sunsetGround: [number, number, number] = [28, 24, 20];

  // Small park patches — subtle green only here
  const nightPark: [number, number, number] = [10, 18, 12];
  const dayPark: [number, number, number] = [45, 62, 40];

  let skyColor: string;
  let fogColor: string;
  let groundColor: string;
  let parkColor: string;
  let sunColor = '#ffffff';

  if (isSunrise) {
    const t = (hour - 5.5) / 2;
    skyColor = lerpColor(sunsetSky, daySky, t);
    fogColor = lerpColor(sunsetFog, dayFog, t);
    groundColor = lerpColor(sunsetGround, dayGround, t);
    parkColor = lerpColor(nightPark, dayPark, t);
    sunColor = lerpColor([255, 140, 50], [255, 255, 255], t);
  } else if (isSunset) {
    const t = 1 - (hour - 16.5) / 2.5;
    skyColor = lerpColor(sunsetSky, daySky, t);
    fogColor = lerpColor(sunsetFog, dayFog, t);
    groundColor = lerpColor(sunsetGround, dayGround, t);
    parkColor = lerpColor(nightPark, dayPark, t);
    sunColor = lerpColor([255, 140, 50], [255, 255, 255], t);
  } else {
    skyColor = lerpColor(nightSky, daySky, day);
    fogColor = lerpColor(nightFog, dayFog, day);
    groundColor = lerpColor(nightGround, dayGround, day);
    parkColor = lerpColor(nightPark, dayPark, day);
  }

  const nightGrid: [number, number, number] = [8, 8, 12];
  const dayGrid: [number, number, number] = [72, 72, 70];
  const gridLineColor = lerpColor(nightGrid, dayGrid, day);

  // Night roads brighter than ground for visibility
  const nightRoadMain: [number, number, number] = [32, 32, 38];
  const dayRoadMain: [number, number, number] = [45, 45, 45];
  const nightRoadSec: [number, number, number] = [25, 25, 30];
  const dayRoadSec: [number, number, number] = [35, 35, 35];

  return {
    skyColor,
    fogColor,
    groundColor,
    gridLineColor,
    ambientIntensity: 0.08 + day * 0.62,
    sunIntensity: 0.05 + day * 0.95,
    sunColor: day < 0.1 ? '#8090c0' : sunColor, // cool moonlight at night
    fillerShadeBase: 8 + Math.floor(day * 32),
    showStars: day < 0.5,
    starsFade: Math.max(0, 1 - day * 2),
    roadMainColor: lerpColor(nightRoadMain, dayRoadMain, day),
    roadSecondaryColor: lerpColor(nightRoadSec, dayRoadSec, day),
    parkColor,
    day,
  };
}

// --- Compute valid block positions (between roads) ---
// Roads are at every 4th grid unit * spacing (0, ±10, ±20, ±30)
// Buildings must be placed inside blocks, not on road lines.

function generateBlockPositions(): [number, number][] {
  const spacing = 2.5;
  const positions: [number, number][] = [];

  // Valid offsets within a block: 1, 2, 3 grid units from each road line
  for (let bx = -3; bx <= 2; bx++) {
    for (let bz = -3; bz <= 2; bz++) {
      const roadX = bx * 4 * spacing;
      const roadZ = bz * 4 * spacing;
      for (let ox = 1; ox <= 3; ox++) {
        for (let oz = 1; oz <= 3; oz++) {
          positions.push([roadX + ox * spacing, roadZ + oz * spacing]);
        }
      }
    }
  }

  // Sort by distance from center (best offices get center positions)
  positions.sort((a, b) => (a[0] ** 2 + a[1] ** 2) - (b[0] ** 2 + b[1] ** 2));
  return positions;
}

const BLOCK_POSITIONS = generateBlockPositions();

// --- Scene components ---

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function FillerBuildings({ shadeBase, day }: { shadeBase: number; day: number }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const windowRef = useRef<THREE.InstancedMesh>(null);

  const { buildings, windows } = useMemo(() => {
    const rand = seededRandom(42);
    const blds: { x: number; y: number; z: number; w: number; h: number; d: number; v: number }[] = [];
    const wins: { x: number; y: number; z: number; lit: boolean }[] = [];
    const gridSize = 12;
    const spacing = 2.5;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        if (Math.abs(x) <= 3 && Math.abs(z) <= 3) continue;
        if (x % 4 === 0 || z % 4 === 0) continue;
        if (rand() > 0.5) continue;

        const h = 0.15 + rand() * 0.8;
        const w = 0.3 + rand() * 0.35;
        const d = 0.3 + rand() * 0.25;
        const v = shadeBase + Math.floor(rand() * 12);
        const bx = x * spacing;
        const bz = z * spacing;
        blds.push({ x: bx, y: h / 2, z: bz, w, h, d, v });

        // Windows on front face for taller buildings
        if (h > 0.25) {
          const floorH = 0.14;
          const rows = Math.min(Math.floor((h - 0.08) / floorH), 5);
          const cols = Math.max(1, Math.floor(w / 0.11));
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              wins.push({
                x: bx + (col - (cols - 1) / 2) * 0.09,
                y: 0.08 + row * floorH,
                z: bz + d / 2 + 0.002,
                lit: rand() > 0.35,
              });
            }
          }
        }
      }
    }
    return { buildings: blds, windows: wins };
  }, [shadeBase]);

  useEffect(() => {
    if (!bodyRef.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      bodyRef.current!.setMatrixAt(i, dummy.matrix);
      bodyRef.current!.setColorAt(i, color.setRGB(b.v / 255, b.v / 255, b.v / 255));
    });
    bodyRef.current.instanceMatrix.needsUpdate = true;
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
  }, [buildings]);

  const isNight = day < 0.5;

  useEffect(() => {
    if (!windowRef.current || windows.length === 0) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    windows.forEach((w, i) => {
      dummy.position.set(w.x, w.y, w.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      windowRef.current!.setMatrixAt(i, dummy.matrix);
      if (isNight) {
        color.set(w.lit ? '#ffe0a0' : '#0a0e16');
      } else {
        color.set(w.lit ? '#8ab8d0' : '#506070');
      }
      windowRef.current!.setColorAt(i, color);
    });
    windowRef.current.instanceMatrix.needsUpdate = true;
    if (windowRef.current.instanceColor) windowRef.current.instanceColor.needsUpdate = true;
  }, [windows, isNight]);

  return (
    <>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, buildings.length]} frustumCulled>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.85} metalness={0.05} />
      </instancedMesh>
      {windows.length > 0 && (
        <instancedMesh ref={windowRef} args={[undefined, undefined, windows.length]} frustumCulled>
          <planeGeometry args={[0.055, 0.07]} />
          <meshStandardMaterial
            emissive={isNight ? '#ffe0a0' : '#000000'}
            emissiveIntensity={isNight ? 0.5 : 0}
            metalness={isNight ? 0.2 : 0.6}
            roughness={isNight ? 0.3 : 0.08}
          />
        </instancedMesh>
      )}
    </>
  );
}

function StreetLamps({ day }: { day: number }) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const armRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);

  const LAMP_HEIGHT = 1.2;
  const ARM_LENGTH = 0.35;

  // Place lamps on sidewalks, staggered on alternating sides
  const lamps = useMemo(() => {
    const result: { pos: [number, number, number]; armDir: [number, number, number] }[] = [];
    const gridSize = 12;
    const spacing = 2.5;

    for (let i = -gridSize; i <= gridSize; i++) {
      if (i % 4 !== 0) continue;
      const main = i % 8 === 0;
      const halfW = (main ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2;
      const sidewalkCenter = halfW + SIDEWALK_WIDTH / 2;

      // Along horizontal roads — stagger: odd j on +z side, even j on -z side
      for (let j = -gridSize; j <= gridSize; j++) {
        if (j % 4 === 0) continue; // skip intersections
        if (j % 2 !== 0) continue; // every other unit for spacing
        const x = j * spacing;
        const side = (j % 4 === 2) ? 1 : -1; // stagger sides
        result.push({
          pos: [x, 0, i * spacing + sidewalkCenter * side],
          armDir: [0, 0, -side],
        });
      }

      // Along vertical roads — stagger similarly
      for (let j = -gridSize; j <= gridSize; j++) {
        if (j % 4 === 0) continue;
        if (j % 2 !== 0) continue;
        const z = j * spacing;
        const side = (j % 4 === 2) ? 1 : -1;
        result.push({
          pos: [i * spacing + sidewalkCenter * side, 0, z],
          armDir: [-side, 0, 0],
        });
      }
    }
    return result;
  }, []);

  const isNight = day < 0.3;

  useEffect(() => {
    if (!poleRef.current || !headRef.current || !armRef.current || !glowRef.current) return;
    const dummy = new THREE.Object3D();
    lamps.forEach((lamp, i) => {
      const [x, , z] = lamp.pos;

      // Pole
      dummy.position.set(x, LAMP_HEIGHT / 2, z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      poleRef.current!.setMatrixAt(i, dummy.matrix);

      // Arm — horizontal bar extending over road
      const armX = x + lamp.armDir[0] * ARM_LENGTH / 2;
      const armZ = z + lamp.armDir[2] * ARM_LENGTH / 2;
      dummy.position.set(armX, LAMP_HEIGHT, armZ);
      // Rotate arm to point in correct direction
      dummy.rotation.set(0, 0, Math.PI / 2);
      if (lamp.armDir[2] !== 0) dummy.rotation.set(0, Math.PI / 2, Math.PI / 2);
      dummy.updateMatrix();
      armRef.current!.setMatrixAt(i, dummy.matrix);

      // Head — at end of arm, over road
      const headX = x + lamp.armDir[0] * ARM_LENGTH;
      const headZ = z + lamp.armDir[2] * ARM_LENGTH;
      dummy.position.set(headX, LAMP_HEIGHT - 0.02, headZ);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      headRef.current!.setMatrixAt(i, dummy.matrix);

      // Ground light pool — centered under head
      dummy.position.set(headX, 0.008, headZ);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      glowRef.current!.setMatrixAt(i, dummy.matrix);
    });
    poleRef.current.instanceMatrix.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
    armRef.current.instanceMatrix.needsUpdate = true;
    glowRef.current.instanceMatrix.needsUpdate = true;
  }, [lamps]);

  return (
    <>
      {/* Pole */}
      <instancedMesh ref={poleRef} args={[undefined, undefined, lamps.length]} frustumCulled>
        <cylinderGeometry args={[0.015, 0.025, LAMP_HEIGHT, 6]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
      </instancedMesh>
      {/* Arm */}
      <instancedMesh ref={armRef} args={[undefined, undefined, lamps.length]} frustumCulled>
        <cylinderGeometry args={[0.01, 0.01, ARM_LENGTH, 4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
      </instancedMesh>
      {/* Head / luminaire */}
      <instancedMesh ref={headRef} args={[undefined, undefined, lamps.length]} frustumCulled>
        <boxGeometry args={[0.12, 0.025, 0.06]} />
        <meshStandardMaterial
          color={isNight ? '#ffe8b0' : '#888888'}
          emissive={isNight ? '#ffe0a0' : '#000000'}
          emissiveIntensity={isNight ? 3.0 : 0}
        />
      </instancedMesh>
      {/* Ground light pool — warm cone under each lamp */}
      <instancedMesh ref={glowRef} args={[undefined, undefined, lamps.length]} frustumCulled>
        <circleGeometry args={[1.2, 20]} />
        <meshStandardMaterial
          color="#ffe0a0"
          emissive="#ffe0a0"
          emissiveIntensity={isNight ? 1.5 : 0}
          transparent
          opacity={isNight ? 0.6 : 0}
          depthWrite={false}
        />
      </instancedMesh>
      {/* Real point lights — only near center for performance (within 20 units) */}
      {isNight && lamps
        .filter((lamp) => Math.abs(lamp.pos[0]) < 20 && Math.abs(lamp.pos[2]) < 20)
        .filter((_, i) => i % 2 === 0)
        .map((lamp, i) => {
          const headX = lamp.pos[0] + lamp.armDir[0] * ARM_LENGTH;
          const headZ = lamp.pos[2] + lamp.armDir[2] * ARM_LENGTH;
          return (
            <pointLight
              key={`lamp-light-${i}`}
              position={[headX, LAMP_HEIGHT - 0.05, headZ]}
              color="#ffe0a0"
              intensity={1.5}
              distance={5}
              decay={1.5}
            />
          );
        })}
    </>
  );
}

/*
 * Brazilian traffic system — CTB / CONTRAN proportions
 * Scale: 1 unit ≈ 5m
 * Main avenue (via arterial): 2 lanes each dir × 3.0m + 0.6m median ≈ 12.6m → 2.5 units
 * Secondary street (via coletora): 1 lane each dir × 3.0m ≈ 6.0m → 1.2 units
 * Sidewalk (calçada): 2.0m → 0.4 units
 * Center line: yellow continuous (avenida) or yellow dashed (rua) — CONTRAN Res. 236
 * Lane dividers: white dashed — CONTRAN
 * Crosswalk (faixa de pedestres): white parallel stripes, 3m wide → 0.6 units
 */

const ROAD_MAIN_WIDTH = 2.5;      // via arterial
const ROAD_SECONDARY_WIDTH = 1.2;  // via coletora
const SIDEWALK_WIDTH = 0.4;
const CROSSWALK_WIDTH = 0.6;
const DASH_LENGTH = 0.6;           // 3m dashes
const DASH_GAP = 0.4;              // 2m gaps
const STRIPE_W = 0.04;             // line width

function Roads({
  mainColor,
  secondaryColor,
  day,
}: {
  mainColor: string;
  secondaryColor: string;
  day: number;
}) {
  const gridSize = 12;
  const spacing = 2.5;
  const totalSize = gridSize * 2 * spacing + 4;

  // Yellow center line color — fades with day/night
  const yellowLine = lerpColor([80, 70, 10], [200, 180, 40], day);
  const whiteLine = lerpColor([40, 40, 45], [220, 220, 220], day);
  const sidewalkColor = lerpColor([16, 16, 20], [75, 72, 68], day);

  const roads = useMemo(() => {
    const result: { pos: [number, number, number]; size: [number, number]; main: boolean }[] = [];
    for (let i = -gridSize; i <= gridSize; i++) {
      if (i % 4 !== 0) continue;
      const main = i % 8 === 0;
      const w = main ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH;
      result.push({ pos: [0, 0.003, i * spacing], size: [totalSize, w], main });
      result.push({ pos: [i * spacing, 0.003, 0], size: [w, totalSize], main });
    }
    return result;
  }, []);

  // Sidewalks — raised strips along each road
  const sidewalks = useMemo(() => {
    const result: { pos: [number, number, number]; size: [number, number]; rot: number }[] = [];
    for (let i = -gridSize; i <= gridSize; i++) {
      if (i % 4 !== 0) continue;
      const main = i % 8 === 0;
      const halfW = (main ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2;
      // Horizontal roads (along X) — sidewalks at z ± halfW
      result.push({ pos: [0, 0.006, i * spacing + halfW + SIDEWALK_WIDTH / 2], size: [totalSize, SIDEWALK_WIDTH], rot: 0 });
      result.push({ pos: [0, 0.006, i * spacing - halfW - SIDEWALK_WIDTH / 2], size: [totalSize, SIDEWALK_WIDTH], rot: 0 });
      // Vertical roads (along Z) — sidewalks at x ± halfW
      result.push({ pos: [i * spacing + halfW + SIDEWALK_WIDTH / 2, 0.006, 0], size: [SIDEWALK_WIDTH, totalSize], rot: 0 });
      result.push({ pos: [i * spacing - halfW - SIDEWALK_WIDTH / 2, 0.006, 0], size: [SIDEWALK_WIDTH, totalSize], rot: 0 });
    }
    return result;
  }, []);

  // Center line dashes (yellow) and lane dividers (white)
  const markings = useMemo(() => {
    const centerLines: { pos: [number, number, number]; size: [number, number] }[] = [];
    const laneDashes: { pos: [number, number, number]; size: [number, number] }[] = [];

    for (let i = -gridSize; i <= gridSize; i++) {
      if (i % 4 !== 0) continue;
      const main = i % 8 === 0;

      // Center line — continuous yellow for main, dashed for secondary
      if (main) {
        // Continuous double yellow center line (avenida)
        centerLines.push({ pos: [0, 0.005, i * spacing + 0.06], size: [totalSize, STRIPE_W] });
        centerLines.push({ pos: [0, 0.005, i * spacing - 0.06], size: [totalSize, STRIPE_W] });
        centerLines.push({ pos: [i * spacing + 0.06, 0.005, 0], size: [STRIPE_W, totalSize] });
        centerLines.push({ pos: [i * spacing - 0.06, 0.005, 0], size: [STRIPE_W, totalSize] });

        // White lane dividers for main (between lanes in same direction)
        const laneOffset = ROAD_MAIN_WIDTH / 4;
        for (let d = -totalSize / 2; d < totalSize / 2; d += DASH_LENGTH + DASH_GAP) {
          laneDashes.push({ pos: [d + DASH_LENGTH / 2, 0.005, i * spacing + laneOffset], size: [DASH_LENGTH, STRIPE_W] });
          laneDashes.push({ pos: [d + DASH_LENGTH / 2, 0.005, i * spacing - laneOffset], size: [DASH_LENGTH, STRIPE_W] });
          laneDashes.push({ pos: [i * spacing + laneOffset, 0.005, d + DASH_LENGTH / 2], size: [STRIPE_W, DASH_LENGTH] });
          laneDashes.push({ pos: [i * spacing - laneOffset, 0.005, d + DASH_LENGTH / 2], size: [STRIPE_W, DASH_LENGTH] });
        }
      } else {
        // Dashed yellow center for secondary streets
        for (let d = -totalSize / 2; d < totalSize / 2; d += DASH_LENGTH + DASH_GAP) {
          centerLines.push({ pos: [d + DASH_LENGTH / 2, 0.005, i * spacing], size: [DASH_LENGTH, STRIPE_W] });
          centerLines.push({ pos: [i * spacing, 0.005, d + DASH_LENGTH / 2], size: [STRIPE_W, DASH_LENGTH] });
        }
      }
    }

    return { centerLines, laneDashes };
  }, []);

  // Crosswalks (faixa de pedestres) at intersections
  const crosswalks = useMemo(() => {
    const result: { pos: [number, number, number]; size: [number, number] }[] = [];
    for (let ix = -gridSize; ix <= gridSize; ix++) {
      if (ix % 4 !== 0) continue;
      for (let iz = -gridSize; iz <= gridSize; iz++) {
        if (iz % 4 !== 0) continue;
        const cx = ix * spacing;
        const cz = iz * spacing;
        const mainX = ix % 8 === 0;
        const mainZ = iz % 8 === 0;
        const halfX = (mainX ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2;
        const halfZ = (mainZ ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2;

        // Zebra stripes — 6 parallel white bars across each approach
        const stripeCount = 6;
        const stripeW = 0.06;
        const stripeGap = CROSSWALK_WIDTH / stripeCount;

        // North/South approaches (along X, offset in Z)
        for (let s = 0; s < stripeCount; s++) {
          const zOff = halfZ + 0.15 + s * stripeGap;
          result.push({ pos: [cx, 0.005, cz + zOff], size: [halfX * 1.6, stripeW] });
          result.push({ pos: [cx, 0.005, cz - zOff], size: [halfX * 1.6, stripeW] });
        }
        // East/West approaches (along Z, offset in X)
        for (let s = 0; s < stripeCount; s++) {
          const xOff = halfX + 0.15 + s * stripeGap;
          result.push({ pos: [cx + xOff, 0.005, cz], size: [stripeW, halfZ * 1.6] });
          result.push({ pos: [cx - xOff, 0.005, cz], size: [stripeW, halfZ * 1.6] });
        }
      }
    }
    return result;
  }, []);

  return (
    <>
      {/* Asphalt surface */}
      {roads.map((r, i) => (
        <mesh key={`r-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={r.pos}>
          <planeGeometry args={r.size} />
          <meshStandardMaterial color={r.main ? mainColor : secondaryColor} />
        </mesh>
      ))}

      {/* Calçadas (sidewalks) — slightly raised, lighter surface */}
      {sidewalks.map((s, i) => (
        <mesh key={`sw-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={s.pos}>
          <planeGeometry args={s.size} />
          <meshStandardMaterial color={sidewalkColor} />
        </mesh>
      ))}

      {/* Yellow center lines */}
      {markings.centerLines.map((m, i) => (
        <mesh key={`cl-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={m.pos}>
          <planeGeometry args={m.size} />
          <meshStandardMaterial color={yellowLine} />
        </mesh>
      ))}

      {/* White lane dividers */}
      {markings.laneDashes.map((m, i) => (
        <mesh key={`ld-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={m.pos}>
          <planeGeometry args={m.size} />
          <meshStandardMaterial color={whiteLine} />
        </mesh>
      ))}

      {/* Crosswalk stripes (faixa de pedestres) */}
      {crosswalks.map((c, i) => (
        <mesh key={`cw-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={c.pos}>
          <planeGeometry args={c.size} />
          <meshStandardMaterial color={whiteLine} />
        </mesh>
      ))}
    </>
  );
}

// Traffic sign posts at intersections — small pole + plate
function TrafficSigns({ day }: { day: number }) {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const plateRef = useRef<THREE.InstancedMesh>(null);

  const signs = useMemo(() => {
    const result: { pos: [number, number, number]; rot: number }[] = [];
    const gridSize = 12;
    const spacing = 2.5;

    for (let ix = -gridSize; ix <= gridSize; ix++) {
      if (ix % 4 !== 0) continue;
      for (let iz = -gridSize; iz <= gridSize; iz++) {
        if (iz % 4 !== 0) continue;
        // Skip center intersections to reduce clutter
        if (Math.abs(ix) <= 4 && Math.abs(iz) <= 4) continue;
        const main = ix % 8 === 0 || iz % 8 === 0;
        if (!main) continue; // Only on main avenues

        const cx = ix * spacing;
        const cz = iz * spacing;
        const mainX = ix % 8 === 0;
        const halfW = (mainX ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2 + 0.3;

        // Place a sign at one corner of the intersection
        result.push({ pos: [cx + halfW, 0, cz + halfW], rot: Math.PI * 0.25 });
      }
    }
    return result;
  }, []);

  const plateColor = lerpColor([30, 30, 60], [30, 60, 130], day);

  useEffect(() => {
    if (!poleRef.current || !plateRef.current) return;
    const dummy = new THREE.Object3D();

    signs.forEach((s, i) => {
      // Pole
      dummy.position.set(s.pos[0], 0.45, s.pos[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poleRef.current!.setMatrixAt(i, dummy.matrix);

      // Plate
      dummy.position.set(s.pos[0], 0.82, s.pos[2]);
      dummy.rotation.set(0, s.rot, 0);
      dummy.updateMatrix();
      plateRef.current!.setMatrixAt(i, dummy.matrix);
    });

    poleRef.current.instanceMatrix.needsUpdate = true;
    plateRef.current.instanceMatrix.needsUpdate = true;
  }, [signs]);

  if (signs.length === 0) return null;

  return (
    <>
      {/* Sign poles */}
      <instancedMesh ref={poleRef} args={[undefined, undefined, signs.length]} frustumCulled>
        <cylinderGeometry args={[0.015, 0.015, 0.9, 4]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </instancedMesh>
      {/* Sign plates (blue rectangle — Brazilian standard) */}
      <instancedMesh ref={plateRef} args={[undefined, undefined, signs.length]} frustumCulled>
        <boxGeometry args={[0.25, 0.12, 0.01]} />
        <meshStandardMaterial color={plateColor} metalness={0.3} roughness={0.6} />
      </instancedMesh>
    </>
  );
}

// Chat Jurídico street billboards — sparse along main roads
function ChatJuridicoBillboards({ day }: { day: number }) {
  const boardColor = lerpColor([20, 20, 25], [240, 240, 240], day);
  const textColor = lerpColor([0, 180, 100], [0, 140, 80], day);
  const poleColor = lerpColor([30, 30, 35], [90, 90, 90], day);

  const billboards = useMemo(() => {
    const rand = seededRandom(777);
    const spacing = 2.5;
    const result: { pos: [number, number, number]; rotY: number }[] = [];

    // Billboard on sidewalk: road edge + full sidewalk width + margin
    const sideOffset = ROAD_MAIN_WIDTH / 2 + SIDEWALK_WIDTH + 0.15;

    // roadGrid = grid coord of a main road, slideGrid = position along road, alongX = road axis, side = +1/-1
    const spots: { roadGrid: number; slideGrid: number; alongX: boolean; side: 1 | -1 }[] = [
      { roadGrid: 8,   slideGrid: 1,   alongX: true,  side: 1 },
      { roadGrid: -8,  slideGrid: 2,   alongX: false, side: -1 },
      { roadGrid: 8,   slideGrid: -3,  alongX: false, side: 1 },
      { roadGrid: -8,  slideGrid: -5,  alongX: true,  side: -1 },
      { roadGrid: 0,   slideGrid: -10, alongX: true,  side: 1 },
    ];

    for (const spot of spots) {
      if (rand() > 0.85) continue;
      const slide = (rand() - 0.5) * spacing * 0.8;

      let x: number, z: number, rotY: number;
      if (spot.alongX) {
        // Road at z = roadGrid*spacing, billboard pushed to side in Z
        x = spot.slideGrid * spacing + slide;
        z = spot.roadGrid * spacing + sideOffset * spot.side;
        rotY = 0;
      } else {
        // Road at x = roadGrid*spacing, billboard pushed to side in X
        x = spot.roadGrid * spacing + sideOffset * spot.side;
        z = spot.slideGrid * spacing + slide;
        rotY = Math.PI / 2;
      }
      result.push({ pos: [x, 0, z], rotY });
    }
    return result;
  }, []);

  return (
    <>
      {billboards.map((b, i) => (
        <group key={`bb-${i}`} position={b.pos}>
          {/* Pole */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 1.2, 4]} />
            <meshStandardMaterial color={poleColor} metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Board panel */}
          <group position={[0, 1.25, 0]} rotation={[0, b.rotY, 0]}>
            {/* White background */}
            <mesh>
              <boxGeometry args={[0.7, 0.3, 0.02]} />
              <meshStandardMaterial color={boardColor} metalness={0.05} roughness={0.8} />
            </mesh>

            {/* Green accent bar (top) */}
            <mesh position={[0, 0.13, 0.011]}>
              <planeGeometry args={[0.66, 0.03]} />
              <meshStandardMaterial color={textColor} emissive={textColor} emissiveIntensity={0.3} />
            </mesh>

            {/* "Chat Jurídico" text block — simulated with colored rectangle */}
            <mesh position={[0, 0.0, 0.011]}>
              <planeGeometry args={[0.5, 0.1]} />
              <meshStandardMaterial color={textColor} emissive={textColor} emissiveIntensity={0.4} />
            </mesh>

            {/* Subtle bottom tagline bar */}
            <mesh position={[0, -0.1, 0.011]}>
              <planeGeometry args={[0.4, 0.025]} />
              <meshStandardMaterial color={poleColor} />
            </mesh>
          </group>

          {/* Small light on top at night */}
          {day < 0.4 && (
            <pointLight position={[0, 1.45, 0]} color="#00ff88" intensity={0.05} distance={1.5} />
          )}
        </group>
      ))}
    </>
  );
}

// Small park patches with trees
function Parks({ color, day }: { color: string; day: number }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);

  const { parkPlanes, trees } = useMemo(() => {
    const rand = seededRandom(99);
    const spacing = 2.5;
    const planes: [number, number, number][] = [];
    const treeList: { x: number; z: number; h: number; r: number }[] = [];

    const parkBlocks = [
      [2, 2], [-2, 1], [1, -2], [-1, -2], [2, -1], [-2, -2],
    ];

    for (const [bx, bz] of parkBlocks) {
      if (rand() > 0.7) continue;
      const cx = bx * 4 * spacing + 2 * spacing;
      const cz = bz * 4 * spacing + 2 * spacing;
      planes.push([cx, 0.004, cz]);

      // Scatter trees
      const treeCount = 3 + Math.floor(rand() * 5);
      for (let t = 0; t < treeCount; t++) {
        treeList.push({
          x: cx + (rand() - 0.5) * 3.2,
          z: cz + (rand() - 0.5) * 3.2,
          h: 0.3 + rand() * 0.5,
          r: 0.15 + rand() * 0.2,
        });
      }
    }
    return { parkPlanes: planes, trees: treeList };
  }, []);

  const trunkColor = day > 0.5 ? '#4a3a2a' : '#1a1410';
  const canopyColor = day > 0.5 ? '#2d5a1e' : '#0a1a08';

  useEffect(() => {
    if (!trunkRef.current || !canopyRef.current || trees.length === 0) return;
    const dummy = new THREE.Object3D();
    trees.forEach((tree, i) => {
      dummy.position.set(tree.x, tree.h * 0.4, tree.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.x, tree.h * 0.75, tree.z);
      dummy.scale.set(tree.r, tree.r, tree.r);
      dummy.updateMatrix();
      canopyRef.current!.setMatrixAt(i, dummy.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <>
      {parkPlanes.map((pos, i) => (
        <mesh key={`park-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={pos}>
          <planeGeometry args={[4, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {trees.length > 0 && (
        <>
          <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} frustumCulled>
            <cylinderGeometry args={[0.02, 0.035, 0.5, 5]} />
            <meshStandardMaterial color={trunkColor} roughness={0.9} />
          </instancedMesh>
          <instancedMesh ref={canopyRef} args={[undefined, undefined, trees.length]} frustumCulled>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={canopyColor} roughness={0.85} />
          </instancedMesh>
        </>
      )}
    </>
  );
}

function CityGrid({ offices, onSelectOffice, timeOverride }: CitySceneProps) {
  const tod = useMemo(() => getTimeOfDay(timeOverride), [timeOverride]);

  // Compute valid positions for offices (avoiding roads)
  const officePositions = useMemo(() => {
    return offices.map((_, i) => {
      if (i < BLOCK_POSITIONS.length) {
        return BLOCK_POSITIONS[i];
      }
      // Overflow: place further out in a spiral
      const angle = (i / offices.length) * Math.PI * 2;
      const radius = 20 + (i - BLOCK_POSITIONS.length) * 3;
      return [
        Math.round((Math.cos(angle) * radius) / 2.5) * 2.5,
        Math.round((Math.sin(angle) * radius) / 2.5) * 2.5,
      ] as [number, number];
    });
  }, [offices]);

  return (
    <>
      {/* Ground — large plane so edges disappear into fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={tod.groundColor} />
      </mesh>

      <gridHelper args={[80, 80, tod.gridLineColor, tod.gridLineColor]} position={[0, -0.005, 0]} />

      <Roads mainColor={tod.roadMainColor} secondaryColor={tod.roadSecondaryColor} day={tod.day} />
      <Parks color={tod.parkColor} day={tod.day} />
      <StreetLamps day={tod.day} />
      <TrafficSigns day={tod.day} />
      <ChatJuridicoBillboards day={tod.day} />
      <FillerBuildings shadeBase={tod.fillerShadeBase} day={tod.day} />

      {offices.map((office, i) => (
        <Building
          key={office.id}
          office={office}
          position={[officePositions[i][0], 0, officePositions[i][1]]}
          onClick={onSelectOffice}
          index={i}
          day={tod.day}
        />
      ))}
    </>
  );
}

function SceneSetup() {
  const { gl } = useThree();
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.0;
  return null;
}

export default function CityScene({ offices, onSelectOffice, timeOverride }: CitySceneProps) {
  const tod = useMemo(() => getTimeOfDay(timeOverride), [timeOverride]);

  return (
    <Canvas
      camera={{ fov: 50, position: [12, 10, 12], near: 0.1, far: 200 }}
      style={{ background: tod.skyColor }}
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
    >
      <SceneSetup />
      {tod.showStars && (
        <Stars radius={200} depth={80} count={1000} factor={2} saturation={0} fade speed={0.2} />
      )}
      <fog attach="fog" args={[tod.fogColor, tod.day < 0.3 ? 20 : 15, tod.day < 0.3 ? 65 : 50]} />

      <ambientLight intensity={tod.ambientIntensity} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={tod.sunIntensity}
        color={tod.sunColor}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[-5, 8, -8]} intensity={tod.sunIntensity * 0.25} color={tod.sunColor} />
      <hemisphereLight args={[tod.skyColor, tod.groundColor, 0.3]} />
      {tod.day > 0.3 && <Environment preset="city" environmentIntensity={0.4} />}

      <CityGrid offices={offices} onSelectOffice={onSelectOffice} timeOverride={timeOverride} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
        enableRotate
        enableZoom
        enablePan
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 6}
        minDistance={5}
        maxDistance={35}
        enableDamping
        dampingFactor={0.05}
      />

    </Canvas>
  );
}
