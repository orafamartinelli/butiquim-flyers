import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { O_PATH } from "./oPath";

// ALTURA de referência do "O" em unidades 3D (RingPx converte pixels com base nela)
const ALTURA = 2.17;

// O "O" do Butiquim em 3D: o desenho oficial (pincelada com o traço interno) extrudado como letra-caixa,
// com chanfro arredondado nas bordas — sem virar tubo.
export const logoOGeometry = (profundidade = 0.13) => {
  // evenodd: o 2º contorno é o furo do "O" (sem isso o miolo sai preenchido)
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${O_PATH}"/></svg>`);
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
  const probe = new THREE.ShapeGeometry(shapes);
  probe.computeBoundingBox();
  const bb = probe.boundingBox!;
  const k = ALTURA / (bb.max.y - bb.min.y);
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth: profundidade / k,
    curveSegments: 48,
    bevelEnabled: true,
    bevelThickness: 0.05 / k,
    bevelSize: 0.028 / k,
    bevelSegments: 10,
  });
  g.center();
  g.scale(k, -k, k); // SVG tem y pra baixo
  g.computeVertexNormals();
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
}> = ({ width, height, look, rotX = 0, rotY = 0, rotZ = 0, scale = 1, x = 0, y = 0, envIntensity = 1, lights = [], style, flat = false }) => {
  const geo = useMemo(() => logoOGeometry(), []);
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

// posiciona o "O" em pixels: centro (cx, cy) e altura visível ringH
export const RingPx: React.FC<
  Omit<React.ComponentProps<typeof Ring3D>, "x" | "y" | "scale"> & { cx: number; cy: number; ringH: number }
> = ({ cx, cy, ringH, width, height, ...rest }) => {
  const k = (2 * 6.2 * Math.tan((15 * Math.PI) / 180)) / height;
  return <Ring3D width={width} height={height} x={(cx - width / 2) * k} y={-(cy - height / 2) * k} scale={(ringH * k) / ALTURA} {...rest} />;
};
