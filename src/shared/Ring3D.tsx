import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// O "O" do Butiquim em 3D: pincelada que dá ~1,3 volta, com o traço interno
// à esquerda (igual ao símbolo), espessura variando como pincel e pontas afinadas.
export const brushOGeometry = () => {
  const N = 520;
  const M = 28;
  const start = (120 / 180) * Math.PI;
  const end = (585 / 180) * Math.PI;
  const pts: THREE.Vector3[] = [];
  const rad: number[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const th = start + (end - start) * u;
    const deg = (th * 180) / Math.PI;
    // raio do caminho: começa por dentro (traço interno) e abre até o anel externo
    const k = Math.min(1, Math.max(0, (deg - 120) / 125));
    const r = 0.79 + 0.21 * (k * k * (3 - 2 * k));
    pts.push(new THREE.Vector3(Math.cos(th) * r * 0.8, Math.sin(th) * r, 0));
    // espessura de pincel: mais grossa nas laterais, fina em cima/embaixo; pontas afinadas
    const side = 0.78 + 0.34 * Math.abs(Math.cos(th));
    const taperIn = Math.min(1, u / 0.1);
    const taperOut = Math.min(1, (1 - u) / 0.12);
    const inner = deg < 250 ? 0.72 + 0.28 * k : 1;
    rad.push(0.085 * side * inner * Math.sqrt(taperIn) * Math.sqrt(taperOut) + 0.004);
  }
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  const Z = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= N; i++) {
    const p = pts[i];
    const t = pts[Math.min(N, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize();
    const n = new THREE.Vector3().crossVectors(t, Z).normalize();
    for (let j = 0; j <= M; j++) {
      const a = (j / M) * Math.PI * 2;
      const dir = n.clone().multiplyScalar(Math.cos(a)).add(Z.clone().multiplyScalar(Math.sin(a) * 0.62));
      const v = p.clone().add(dir.clone().multiplyScalar(rad[i]));
      // z levemente diferente em cada volta pra o traço interno não "colar" no externo
      v.z += (i / N) * 0.05;
      pos.push(v.x, v.y, v.z);
      const nn = n.clone().multiplyScalar(Math.cos(a)).add(Z.clone().multiplyScalar(Math.sin(a) / 0.62)).normalize();
      nor.push(nn.x, nn.y, nn.z);
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j;
      const b = (i + 1) * (M + 1) + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
};

const Env: React.FC<{ intensity: number }> = ({ intensity }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = intensity;
  }, [gl, scene, intensity]);
  return null;
};

export type RingLook = "lima" | "cromo" | "cobre";

const Material: React.FC<{ look: RingLook }> = ({ look }) => {
  if (look === "lima")
    return <meshPhysicalMaterial color="#b9c400" roughness={0.35} metalness={0} clearcoat={1} clearcoatRoughness={0.08} />;
  if (look === "cromo")
    return <meshPhysicalMaterial color="#ffffff" roughness={0.08} metalness={1} iridescence={1} iridescenceIOR={1.7} iridescenceThicknessRange={[180, 720]} />;
  return <meshPhysicalMaterial color="#e9a05b" roughness={0.3} metalness={1} clearcoat={0.4} clearcoatRoughness={0.25} />;
};

export const Ring3D: React.FC<{
  width: number;
  height: number;
  look: RingLook;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  scale?: number;
  x?: number;
  y?: number;
  envIntensity?: number;
  lights?: { color: string; pos: [number, number, number]; intensity: number }[];
  style?: React.CSSProperties;
  flat?: boolean;
}> = ({ width, height, look, rotX = 0, rotY = 0, rotZ = -0.33, scale = 1, x = 0, y = 0, envIntensity = 1, lights = [], style, flat = false }) => {
  const geo = useMemo(() => brushOGeometry(), []);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height, ...style }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0, 6.2] }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} flat={flat}>
        <Env intensity={envIntensity} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        {lights.map((l, i) => (
          <pointLight key={i} color={l.color} position={l.pos} intensity={l.intensity} distance={0} decay={0} />
        ))}
        <group position={[x, y, 0]} rotation={[rotX, rotY, rotZ]} scale={scale}>
          <mesh geometry={geo}>
            <Material look={look} />
          </mesh>
        </group>
      </ThreeCanvas>
    </div>
  );
};

// posiciona o anel em pixels: centro (cx, cy) e altura visível ringH
export const RingPx: React.FC<
  Omit<React.ComponentProps<typeof Ring3D>, "x" | "y" | "scale"> & { cx: number; cy: number; ringH: number }
> = ({ cx, cy, ringH, width, height, ...rest }) => {
  const k = (2 * 6.2 * Math.tan((15 * Math.PI) / 180)) / height;
  return <Ring3D width={width} height={height} x={(cx - width / 2) * k} y={-(cy - height / 2) * k} scale={(ringH * k) / 2.17} {...rest} />;
};
