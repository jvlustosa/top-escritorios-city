'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';

import * as THREE from 'three';
import Building from './Building';
import { RankedOffice } from '@/data/mock-offices';

interface CitySceneProps {
  offices: RankedOffice[];
  onSelectOffice: (office: RankedOffice) => void;
  onHelicopterClick?: () => void;
  timeOverride?: 'day' | 'night' | 'auto';
  onReady?: () => void;
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

  const nightSky: [number, number, number] = [8, 10, 22];
  const daySky: [number, number, number] = [135, 185, 230];
  const sunsetSky: [number, number, number] = [60, 25, 55];

  const nightFog: [number, number, number] = [10, 12, 25];
  const dayFog: [number, number, number] = [170, 200, 230];
  const sunsetFog: [number, number, number] = [90, 40, 30];

  // Neutral gray asphalt — night brightened for street visibility
  const nightGround: [number, number, number] = [18, 18, 24];
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

  const nightGrid: [number, number, number] = [22, 22, 30];
  const dayGrid: [number, number, number] = [72, 72, 70];
  const gridLineColor = lerpColor(nightGrid, dayGrid, day);

  // Night roads brighter for visibility under moonlight
  const nightRoadMain: [number, number, number] = [42, 42, 50];
  const dayRoadMain: [number, number, number] = [45, 45, 45];
  const nightRoadSec: [number, number, number] = [35, 35, 42];
  const dayRoadSec: [number, number, number] = [35, 35, 35];

  return {
    skyColor,
    fogColor,
    groundColor,
    gridLineColor,
    ambientIntensity: 0.25 + day * 0.45,
    sunIntensity: 0.15 + day * 0.85,
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

      // Along horizontal roads — lamp at every unit, staggered sides
      for (let j = -gridSize; j <= gridSize; j++) {
        if (j % 4 === 0) continue; // skip intersections
        const x = j * spacing;
        const side = (j % 2 === 0) ? 1 : -1; // stagger sides
        result.push({
          pos: [x, 0, i * spacing + sidewalkCenter * side],
          armDir: [0, 0, -side],
        });
      }

      // Along vertical roads — lamp at every unit, staggered sides
      for (let j = -gridSize; j <= gridSize; j++) {
        if (j % 4 === 0) continue;
        const z = j * spacing;
        const side = (j % 2 === 0) ? 1 : -1;
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
    if (!poleRef.current || !headRef.current || !armRef.current) return;
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

    });
    poleRef.current.instanceMatrix.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
    armRef.current.instanceMatrix.needsUpdate = true;
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
const CROSSWALK_WIDTH = 0.6;       // 3m faixa de pedestres
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
  // Sidewalks segmented — interrupted at perpendicular road crossings
  const sidewalks = useMemo(() => {
    const result: { pos: [number, number, number]; size: [number, number]; rot: number }[] = [];

    // Collect all road grid indices
    const roadIndices: number[] = [];
    for (let i = -gridSize; i <= gridSize; i++) {
      if (i % 4 === 0) roadIndices.push(i);
    }

    for (const i of roadIndices) {
      const main = i % 8 === 0;
      const halfW = (main ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2;
      const swZ1 = i * spacing + halfW + SIDEWALK_WIDTH / 2; // +side
      const swZ2 = i * spacing - halfW - SIDEWALK_WIDTH / 2; // -side

      // Build segments between perpendicular crossings for horizontal roads (along X)
      // Perpendicular roads are vertical (along Z) at x = j * spacing
      const cuts = roadIndices.map(j => {
        const crossMain = j % 8 === 0;
        const crossHalf = (crossMain ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2 + SIDEWALK_WIDTH;
        return { center: j * spacing, half: crossHalf };
      });

      // Sort cuts by center position
      cuts.sort((a, b) => a.center - b.center);

      // Generate segments for horizontal sidewalks (along X, offset in Z)
      let cursor = -totalSize / 2;
      for (const cut of cuts) {
        const segStart = cursor;
        const segEnd = cut.center - cut.half;
        if (segEnd > segStart + 0.1) {
          const len = segEnd - segStart;
          const cx = (segStart + segEnd) / 2;
          result.push({ pos: [cx, 0.006, swZ1], size: [len, SIDEWALK_WIDTH], rot: 0 });
          result.push({ pos: [cx, 0.006, swZ2], size: [len, SIDEWALK_WIDTH], rot: 0 });
        }
        cursor = cut.center + cut.half;
      }
      // Last segment after final cut
      const segEnd = totalSize / 2;
      if (segEnd > cursor + 0.1) {
        const len = segEnd - cursor;
        const cx = (cursor + segEnd) / 2;
        result.push({ pos: [cx, 0.006, swZ1], size: [len, SIDEWALK_WIDTH], rot: 0 });
        result.push({ pos: [cx, 0.006, swZ2], size: [len, SIDEWALK_WIDTH], rot: 0 });
      }

      // Generate segments for vertical sidewalks (along Z, offset in X)
      const swX1 = i * spacing + halfW + SIDEWALK_WIDTH / 2;
      const swX2 = i * spacing - halfW - SIDEWALK_WIDTH / 2;

      // Perpendicular roads are horizontal (along X) at z = j * spacing
      cursor = -totalSize / 2;
      for (const cut of cuts) {
        const segStart = cursor;
        const segEndZ = cut.center - cut.half;
        if (segEndZ > segStart + 0.1) {
          const len = segEndZ - segStart;
          const cz = (segStart + segEndZ) / 2;
          result.push({ pos: [swX1, 0.006, cz], size: [SIDEWALK_WIDTH, len], rot: 0 });
          result.push({ pos: [swX2, 0.006, cz], size: [SIDEWALK_WIDTH, len], rot: 0 });
        }
        cursor = cut.center + cut.half;
      }
      const segEndZ = totalSize / 2;
      if (segEndZ > cursor + 0.1) {
        const len = segEndZ - cursor;
        const cz = (cursor + segEndZ) / 2;
        result.push({ pos: [swX1, 0.006, cz], size: [SIDEWALK_WIDTH, len], rot: 0 });
        result.push({ pos: [swX2, 0.006, cz], size: [SIDEWALK_WIDTH, len], rot: 0 });
      }
    }
    return result;
  }, []);

  // Center line dashes (yellow), lane dividers (white), and stop lines
  // All markings are segmented — they stop before intersections
  const markings = useMemo(() => {
    const centerLines: { pos: [number, number, number]; size: [number, number] }[] = [];
    const laneDashes: { pos: [number, number, number]; size: [number, number] }[] = [];
    const stopLines: { pos: [number, number, number]; size: [number, number] }[] = [];
    const crosswalks: { pos: [number, number, number]; size: [number, number] }[] = [];

    // CONTRAN: listra 0.4m, espaço 0.4m (1 unit = 5m)
    const CW_STRIPE_W = 0.08;  // 0.4m
    const CW_STEP = 0.16;      // stripe + gap (0.4m + 0.4m)
    const CW_STRIPE_COUNT = Math.floor(CROSSWALK_WIDTH / CW_STEP);

    // Collect perpendicular road cuts (same for all roads)
    const roadIndices: number[] = [];
    for (let j = -gridSize; j <= gridSize; j++) {
      if (j % 4 === 0) roadIndices.push(j);
    }

    // Helper: build intersection gaps along an axis
    const buildCuts = () =>
      roadIndices.map(j => {
        const crossMain = j % 8 === 0;
        const crossHalf = (crossMain ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2;
        return { center: j * spacing, half: crossHalf };
      }).sort((a, b) => a.center - b.center);

    const cuts = buildCuts();

    for (let i = -gridSize; i <= gridSize; i++) {
      if (i % 4 !== 0) continue;
      const main = i % 8 === 0;
      const roadCenter = i * spacing;
      const halfW = (main ? ROAD_MAIN_WIDTH : ROAD_SECONDARY_WIDTH) / 2;

      // --- Horizontal road (along X) at z = roadCenter ---
      // Segments between perpendicular vertical roads
      let cursor = -totalSize / 2;
      for (const cut of cuts) {
        const segStart = cursor;
        const segEnd = cut.center - cut.half;
        if (segEnd > segStart + 0.05) {
          const len = segEnd - segStart;
          const cx = (segStart + segEnd) / 2;

          if (main) {
            // Double yellow center line segments
            centerLines.push({ pos: [cx, 0.005, roadCenter + 0.06], size: [len, STRIPE_W] });
            centerLines.push({ pos: [cx, 0.005, roadCenter - 0.06], size: [len, STRIPE_W] });
            // White lane divider dashes within this segment
            const laneOffset = ROAD_MAIN_WIDTH / 4;
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                laneDashes.push({ pos: [d + dashLen / 2, 0.005, roadCenter + laneOffset], size: [dashLen, STRIPE_W] });
                laneDashes.push({ pos: [d + dashLen / 2, 0.005, roadCenter - laneOffset], size: [dashLen, STRIPE_W] });
              }
            }
          } else {
            // Dashed yellow center for secondary
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                centerLines.push({ pos: [d + dashLen / 2, 0.005, roadCenter], size: [dashLen, STRIPE_W] });
              }
            }
          }

          // Stop line (solid white) at the approach to the intersection
          stopLines.push({ pos: [segEnd - STRIPE_W / 2, 0.005, roadCenter + halfW / 2], size: [STRIPE_W * 2, halfW - 0.15] });
          stopLines.push({ pos: [segEnd - STRIPE_W / 2, 0.005, roadCenter - halfW / 2], size: [STRIPE_W * 2, halfW - 0.15] });
          stopLines.push({ pos: [segStart + STRIPE_W / 2, 0.005, roadCenter + halfW / 2], size: [STRIPE_W * 2, halfW - 0.15] });
          stopLines.push({ pos: [segStart + STRIPE_W / 2, 0.005, roadCenter - halfW / 2], size: [STRIPE_W * 2, halfW - 0.15] });

          // Crosswalk — stripes parallel to traffic, spread across road width
          const cwCountZ = Math.floor((halfW * 2) / CW_STEP);
          // Approaching from right (segEnd side)
          const cwX1 = segEnd - CROSSWALK_WIDTH / 2 - 0.1;
          for (let s = 0; s < cwCountZ; s++) {
            const zPos = roadCenter - halfW + CW_STRIPE_W / 2 + s * CW_STEP;
            crosswalks.push({ pos: [cwX1, 0.006, zPos], size: [CROSSWALK_WIDTH, CW_STRIPE_W] });
          }
          // Approaching from left (segStart side)
          const cwX2 = segStart + CROSSWALK_WIDTH / 2 + 0.1;
          for (let s = 0; s < cwCountZ; s++) {
            const zPos = roadCenter - halfW + CW_STRIPE_W / 2 + s * CW_STEP;
            crosswalks.push({ pos: [cwX2, 0.006, zPos], size: [CROSSWALK_WIDTH, CW_STRIPE_W] });
          }
        }
        cursor = cut.center + cut.half;
      }
      // Last segment
      {
        const segStart = cursor;
        const segEnd = totalSize / 2;
        if (segEnd > segStart + 0.05) {
          const len = segEnd - segStart;
          const cx = (segStart + segEnd) / 2;
          if (main) {
            centerLines.push({ pos: [cx, 0.005, roadCenter + 0.06], size: [len, STRIPE_W] });
            centerLines.push({ pos: [cx, 0.005, roadCenter - 0.06], size: [len, STRIPE_W] });
            const laneOffset = ROAD_MAIN_WIDTH / 4;
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                laneDashes.push({ pos: [d + dashLen / 2, 0.005, roadCenter + laneOffset], size: [dashLen, STRIPE_W] });
                laneDashes.push({ pos: [d + dashLen / 2, 0.005, roadCenter - laneOffset], size: [dashLen, STRIPE_W] });
              }
            }
          } else {
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                centerLines.push({ pos: [d + dashLen / 2, 0.005, roadCenter], size: [dashLen, STRIPE_W] });
              }
            }
          }
        }
      }

      // --- Vertical road (along Z) at x = roadCenter ---
      cursor = -totalSize / 2;
      for (const cut of cuts) {
        const segStart = cursor;
        const segEnd = cut.center - cut.half;
        if (segEnd > segStart + 0.05) {
          const len = segEnd - segStart;
          const cz = (segStart + segEnd) / 2;

          if (main) {
            centerLines.push({ pos: [roadCenter + 0.06, 0.005, cz], size: [STRIPE_W, len] });
            centerLines.push({ pos: [roadCenter - 0.06, 0.005, cz], size: [STRIPE_W, len] });
            const laneOffset = ROAD_MAIN_WIDTH / 4;
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                laneDashes.push({ pos: [roadCenter + laneOffset, 0.005, d + dashLen / 2], size: [STRIPE_W, dashLen] });
                laneDashes.push({ pos: [roadCenter - laneOffset, 0.005, d + dashLen / 2], size: [STRIPE_W, dashLen] });
              }
            }
          } else {
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                centerLines.push({ pos: [roadCenter, 0.005, d + dashLen / 2], size: [STRIPE_W, dashLen] });
              }
            }
          }

          // Stop lines for vertical road approaches
          stopLines.push({ pos: [roadCenter + halfW / 2, 0.005, segEnd - STRIPE_W / 2], size: [halfW - 0.15, STRIPE_W * 2] });
          stopLines.push({ pos: [roadCenter - halfW / 2, 0.005, segEnd - STRIPE_W / 2], size: [halfW - 0.15, STRIPE_W * 2] });
          stopLines.push({ pos: [roadCenter + halfW / 2, 0.005, segStart + STRIPE_W / 2], size: [halfW - 0.15, STRIPE_W * 2] });
          stopLines.push({ pos: [roadCenter - halfW / 2, 0.005, segStart + STRIPE_W / 2], size: [halfW - 0.15, STRIPE_W * 2] });

          // Crosswalk — stripes parallel to traffic, spread across road width
          const cwCountX = Math.floor((halfW * 2) / CW_STEP);
          // Approaching from bottom (segEnd side)
          const cwZ1 = segEnd - CROSSWALK_WIDTH / 2 - 0.1;
          for (let s = 0; s < cwCountX; s++) {
            const xPos = roadCenter - halfW + CW_STRIPE_W / 2 + s * CW_STEP;
            crosswalks.push({ pos: [xPos, 0.006, cwZ1], size: [CW_STRIPE_W, CROSSWALK_WIDTH] });
          }
          // Approaching from top (segStart side)
          const cwZ2 = segStart + CROSSWALK_WIDTH / 2 + 0.1;
          for (let s = 0; s < cwCountX; s++) {
            const xPos = roadCenter - halfW + CW_STRIPE_W / 2 + s * CW_STEP;
            crosswalks.push({ pos: [xPos, 0.006, cwZ2], size: [CW_STRIPE_W, CROSSWALK_WIDTH] });
          }
        }
        cursor = cut.center + cut.half;
      }
      // Last segment vertical
      {
        const segStart = cursor;
        const segEnd = totalSize / 2;
        if (segEnd > segStart + 0.05) {
          const len = segEnd - segStart;
          const cz = (segStart + segEnd) / 2;
          if (main) {
            centerLines.push({ pos: [roadCenter + 0.06, 0.005, cz], size: [STRIPE_W, len] });
            centerLines.push({ pos: [roadCenter - 0.06, 0.005, cz], size: [STRIPE_W, len] });
            const laneOffset = ROAD_MAIN_WIDTH / 4;
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                laneDashes.push({ pos: [roadCenter + laneOffset, 0.005, d + dashLen / 2], size: [STRIPE_W, dashLen] });
                laneDashes.push({ pos: [roadCenter - laneOffset, 0.005, d + dashLen / 2], size: [STRIPE_W, dashLen] });
              }
            }
          } else {
            for (let d = segStart; d < segEnd; d += DASH_LENGTH + DASH_GAP) {
              const dashEnd = Math.min(d + DASH_LENGTH, segEnd);
              const dashLen = dashEnd - d;
              if (dashLen > 0.05) {
                centerLines.push({ pos: [roadCenter, 0.005, d + dashLen / 2], size: [STRIPE_W, dashLen] });
              }
            }
          }
        }
      }
    }

    return { centerLines, laneDashes, stopLines, crosswalks };
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

      {/* Stop lines (linha de retenção) at intersection approaches */}
      {markings.stopLines.map((m, i) => (
        <mesh key={`sl-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={m.pos}>
          <planeGeometry args={m.size} />
          <meshStandardMaterial color={whiteLine} />
        </mesh>
      ))}

      {/* Crosswalks (faixa de pedestres) before intersections */}
      {markings.crosswalks.map((c, i) => (
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

function CityGrid({ offices, onSelectOffice, onHelicopterClick, timeOverride }: CitySceneProps) {
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
      {/* Ground — asphalt with noise grain, fog-integrated fade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <shaderMaterial
          fog
          uniforms={{
            uColor: { value: new THREE.Color(tod.groundColor) },
            fogColor: { value: new THREE.Color(tod.fogColor) },
            fogNear: { value: 15.0 },
            fogFar: { value: 50.0 },
          }}
          vertexShader={`
            varying vec3 vWorldPos;
            varying float vFogDepth;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vWorldPos = wp.xyz;
              vec4 mvPos = viewMatrix * wp;
              vFogDepth = -mvPos.z;
              gl_Position = projectionMatrix * mvPos;
            }
          `}
          fragmentShader={`
            uniform vec3 uColor;
            uniform vec3 fogColor;
            uniform float fogNear;
            uniform float fogFar;
            varying vec3 vWorldPos;
            varying float vFogDepth;

            float hash(vec2 p) {
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            float noise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              f = f * f * (3.0 - 2.0 * f);
              float a = hash(i);
              float b = hash(i + vec2(1.0, 0.0));
              float c = hash(i + vec2(0.0, 1.0));
              float d = hash(i + vec2(1.0, 1.0));
              return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void main() {
              // Asphalt grain
              vec2 wp = vWorldPos.xz;
              float grain = noise(wp * 8.0) * 0.06
                          + noise(wp * 24.0) * 0.03
                          + noise(wp * 64.0) * 0.015;
              vec3 col = uColor + (grain - 0.04);

              // Fog: blend to fogColor same as Three.js built-in
              float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
              col = mix(col, fogColor, fogFactor);

              gl_FragColor = vec4(col, 1.0);
            }
          `}
        />
      </mesh>

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
          onHelicopterClick={office.is_featured ? onHelicopterClick : undefined}
          index={i}
          day={tod.day}
        />
      ))}
    </>
  );
}

function DynamicFog({ fogColor, isNight }: { fogColor: string; isNight: boolean }) {
  const { scene, camera } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog(fogColor, 20, 65);
  }, [scene, fogColor]);

  useFrame(() => {
    if (!scene.fog || !(scene.fog instanceof THREE.Fog)) return;
    const dist = camera.position.length();
    const baseNear = isNight ? 20 : 15;
    const baseFar = isNight ? 65 : 50;
    // Gentle sqrt scaling — fog grows slower than camera distance
    const scale = Math.max(1, Math.sqrt(dist / 18));
    scene.fog.near = baseNear * scale;
    scene.fog.far = baseFar * scale;

    // Sync ground shader fog uniforms
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material instanceof THREE.ShaderMaterial && obj.material.uniforms.fogNear) {
        obj.material.uniforms.fogNear.value = (scene.fog as THREE.Fog)?.near;
        obj.material.uniforms.fogFar.value = (scene.fog as THREE.Fog)?.far;
      }
    });
  });

  return null;
}

function SceneSetup({ onReady }: { onReady?: () => void }) {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const fired = useRef(false);

  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.0;

  useFrame(() => {
    if (fired.current) return;
    frameCount.current++;
    // Wait for a few frames so meshes/textures are actually rendered
    if (frameCount.current >= 10) {
      fired.current = true;
      onReady?.();
    }
  });

  return null;
}

export default function CityScene({ offices, onSelectOffice, onHelicopterClick, timeOverride, onReady }: CitySceneProps) {
  const tod = useMemo(() => getTimeOfDay(timeOverride), [timeOverride]);

  return (
    <Canvas
      camera={{ fov: 50, position: [12, 10, 12], near: 0.1, far: 200 }}
      style={{ background: tod.fogColor }}
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
    >
      <SceneSetup onReady={onReady} />
      {tod.showStars && (
        <Stars radius={200} depth={80} count={1000} factor={2} saturation={0} fade speed={0.2} />
      )}
      <DynamicFog fogColor={tod.fogColor} isNight={tod.day < 0.3} />

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
      {tod.day < 0.3 && (
        <>
          {/* Moonlight — cool blue from above */}
          <directionalLight position={[-15, 25, 10]} intensity={0.6} color="#b0c4e8" />
          {/* City ambient glow — warm fill from below to simulate street-level light pollution */}
          <hemisphereLight args={['#1a1a30', '#2a2520', 0.35]} />
          {/* Subtle warm fill to illuminate road surfaces */}
          <pointLight position={[0, 8, 0]} intensity={0.5} color="#ffe0b0" distance={60} decay={1.5} />
        </>
      )}
      {tod.day > 0.3 && <Environment preset="city" environmentIntensity={0.4} />}

      <CityGrid offices={offices} onSelectOffice={onSelectOffice} onHelicopterClick={onHelicopterClick} timeOverride={timeOverride} />

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
